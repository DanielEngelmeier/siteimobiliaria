import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  atualizarImovel,
  criarImovel,
  criarOpcionalDoImovel,
  excluirOpcionalDoImovel,
  listarOpcionais,
  listarOpcionaisDoImovel,
  listarTipos,
  obterImovel,
} from "../../services/imoveis";

const vazio = {
  titulo: "",
  nomeProprietario: "",
  telefoneProprietario: "",
  cpfProprietario: "",
  cep: "",
  endereco: "",
  numero: 0,
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "SP",
  valor: 0,
  area: 0,
  dormitorios: 0,
  banheiros: 0,
  vagas: 0,
  suites: 0,
  tipoImovelId: 1,
  ativo: true,
};

export default function FormImovel() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params?.id ? Number(params.id) : undefined;
  const editando = !!id;

  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);

  // Dropdown de Tipos
  const [tipos, setTipos] = useState([]);

  // Checkboxes de opcionais
  const [opcionais, setOpcionais] = useState([]); // [{id, nome}]
  const [selecionados, setSelecionados] = useState(new Set()); // Set<number>
  const [vinculos, setVinculos] = useState([]); // [{id, imovelId, opcionalId}]

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  // Carregar Tipos e Opcionais
  useEffect(() => {
    listarTipos()
      .then(setTipos)
      .catch(() => {});
    listarOpcionais()
      .then(setOpcionais)
      .catch(() => {});
  }, []);

  // Se editando, carrega imóvel e seus opcionais vinculados
  useEffect(() => {
    if (!editando) return;
    obterImovel(id)
      .then((i) => setForm(i))
      .catch(() => Alert.alert("Erro", "Falha ao carregar imóvel"));

    listarOpcionaisDoImovel(id)
      .then((links) => {
        setVinculos(links);
        setSelecionados(new Set(links.map((l) => l.opcionalId)));
      })
      .catch(() => {});
  }, [editando, id]);

  // Mapa rápido: opcionalId -> vinculoId
  const mapaVinculos = useMemo(() => {
    const m = new Map();
    vinculos.forEach((v) => m.set(v.opcionalId, v.id));
    return m;
  }, [vinculos]);

  // Toggle de checkbox
  const toggleOpcional = (opcionalId) => {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(opcionalId)) novo.delete(opcionalId);
      else novo.add(opcionalId);
      return novo;
    });
  };

  const salvar = async () => {
    if (!form.titulo || !form.endereco || !form.cidade || !form.uf) {
      Alert.alert("Atenção", "Preencha Título, Endereço, Cidade e UF.");
      return;
    }
    try {
      setSalvando(true);

      // 1) Cria/Atualiza o imóvel
      let imovelId = id;
      if (editando) {
        const atualizado = await atualizarImovel(id, form);
        imovelId = atualizado.id || id;
      } else {
        const criado = await criarImovel(form);
        imovelId = criado.id;
      }

      // 2) Sincroniza opcionais (N-N)
      //    - adiciona os que foram marcados e ainda não têm vínculo
      //    - remove vínculos dos que foram desmarcados
      const marcados = new Set(selecionados); // Set<number>

      // Add
      const aAdicionar = [...marcados].filter(
        (opId) => !mapaVinculos.has(opId),
      );
      for (const opcionalId of aAdicionar) {
        await criarOpcionalDoImovel({ imovelId, opcionalId });
      }

      // Remove
      const aRemover = vinculos.filter((v) => !marcados.has(v.opcionalId));
      for (const v of aRemover) {
        await excluirOpcionalDoImovel(v.id);
      }

      Alert.alert(
        "Sucesso",
        `Imóvel ${editando ? "atualizado" : "criado"} com sucesso`,
      );
      router.back();
    } catch (e) {
      Alert.alert("Erro", e?.message || "Falha ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <Text style={styles.section}>Dados do Imóvel</Text>
      <TextInput
        style={styles.input}
        placeholder="Título*"
        value={form.titulo}
        onChangeText={(t) => set("titulo", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Endereço*"
        value={form.endereco}
        onChangeText={(t) => set("endereco", t)}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Número"
          keyboardType="numeric"
          value={String(form.numero || "")}
          onChangeText={(t) => set("numero", Number(t) || 0)}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="CEP"
          value={form.cep}
          onChangeText={(t) => set("cep", t)}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Complemento"
        value={form.complemento || ""}
        onChangeText={(t) => set("complemento", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Bairro"
        value={form.bairro}
        onChangeText={(t) => set("bairro", t)}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Cidade*"
          value={form.cidade}
          onChangeText={(t) => set("cidade", t)}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="UF*"
          maxLength={2}
          value={form.uf}
          onChangeText={(t) => set("uf", t.toUpperCase())}
        />
      </View>

      <Text style={styles.section}>Valores</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Valor (R$)"
          keyboardType="numeric"
          value={String(form.valor || "")}
          onChangeText={(t) => set("valor", Number(t.replace(/\D/g, "")) || 0)}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Área (m²)"
          keyboardType="numeric"
          value={String(form.area || "")}
          onChangeText={(t) => set("area", Number(t) || 0)}
        />
      </View>

      <Text style={styles.section}>Composição</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Dormitórios"
          keyboardType="numeric"
          value={String(form.dormitorios || "")}
          onChangeText={(t) => set("dormitorios", Number(t) || 0)}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Banheiros"
          keyboardType="numeric"
          value={String(form.banheiros || "")}
          onChangeText={(t) => set("banheiros", Number(t) || 0)}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Vagas"
          keyboardType="numeric"
          value={String(form.vagas || "")}
          onChangeText={(t) => set("vagas", Number(t) || 0)}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Suítes"
          keyboardType="numeric"
          value={String(form.suites || "")}
          onChangeText={(t) => set("suites", Number(t) || 0)}
        />
      </View>

      {/* Dropdown para Tipo */}
      <Text style={styles.section}>Tipo</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={form.tipoImovelId}
          onValueChange={(val) => set("tipoImovelId", val)}
          mode="dropdown"
        >
          {tipos.map((t) => (
            <Picker.Item key={t.id} label={t.nome} value={t.id} />
          ))}
        </Picker>
      </View>

      {/* Checkboxes para Opcionais */}
      <Text style={styles.section}>Opcionais</Text>
      <View style={styles.checkboxGroup}>
        {opcionais.map((op) => (
          <View key={op.id} style={styles.checkboxRow}>
            <Checkbox
              value={selecionados.has(op.id)}
              onValueChange={() => toggleOpcional(op.id)}
              color={selecionados.has(op.id) ? "#1565c0" : undefined}
            />
            <Text style={{ marginLeft: 8 }}>{op.nome}</Text>
          </View>
        ))}
        {!opcionais.length && (
          <Text style={{ color: "#888" }}>Nenhum opcional cadastrado</Text>
        )}
      </View>

      <Text style={styles.section}>Proprietário</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Proprietário"
        value={form.nomeProprietario}
        onChangeText={(t) => set("nomeProprietario", t)}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Telefone"
          value={form.telefoneProprietario}
          onChangeText={(t) => set("telefoneProprietario", t)}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="CPF"
          value={form.cpfProprietario}
          onChangeText={(t) => set("cpfProprietario", t)}
        />
      </View>

      <Text style={styles.section}>Status</Text>
      <View style={styles.switchRow}>
        <Text>Ativo</Text>
        <Switch value={form.ativo} onValueChange={(v) => set("ativo", v)} />
      </View>

      <TouchableOpacity
        style={styles.btnSalvar}
        onPress={salvar}
        disabled={salvando}
      >
        <Text style={styles.btnSalvarText}>
          {salvando ? "Salvando..." : editando ? "Atualizar" : "Salvar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  section: { fontWeight: "700", marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 8 },
  rowInput: { flex: 1 },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  checkboxGroup: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  btnSalvar: {
    backgroundColor: "#1565c0",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  btnSalvarText: { color: "#fff", fontWeight: "700" },
});
