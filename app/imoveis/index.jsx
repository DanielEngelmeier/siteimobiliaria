import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { excluirImovel, listarImoveis } from "../../services/imoveis";

export default function ListaImoveis() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [dados, setDados] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setPage(1);
          setDados([]);
        }
        setLoading(true);
        const { data, total } = await listarImoveis({
          q: busca,
          page: reset ? 1 : page,
          limit: 10,
        });
        setTotal(total);
        setDados((prev) => (reset ? data : [...prev, ...data]));
      } catch (e) {
        Alert.alert("Erro", e?.message || "Falha ao carregar");
      } finally {
        setLoading(false);
      }
    },
    [busca, page],
  );

  useEffect(() => {
    load(true);
  }, [busca]);
  useEffect(() => {
    if (page > 1) load(false);
  }, [page]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };
  const onEndReached = () => {
    if (!loading && dados.length < total) setPage((p) => p + 1);
  };

  const confirmarExclusao = (id) => {
    Alert.alert("Excluir", "Tem certeza que deseja excluir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await excluirImovel(id);
            await load(true);
          } catch (e) {
            Alert.alert("Erro", e?.message || "Falha ao excluir");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/imoveis/form",
          params: { id: String(item.id) },
        })
      }
    >
      <Text style={styles.titulo}>{item.titulo}</Text>
      <Text style={styles.linha}>
        {item.cidade}/{item.uf} • Área {item.area} m² • R${" "}
        {Number(item.valor || 0).toLocaleString("pt-BR")}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/imoveis/form",
              params: { id: String(item.id) },
            })
          }
        >
          <Text style={styles.link}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmarExclusao(item.id)}>
          <Text style={[styles.link, { color: "red" }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por título, endereço, cidade..."
          value={busca}
          onChangeText={setBusca}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.btnNovo}
          onPress={() => router.push("/imoveis/form")}
        >
          <Text style={styles.btnNovoText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dados}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: "center", marginTop: 24 }}>
              Nenhum imóvel encontrado
            </Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  topBar: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  btnNovo: {
    backgroundColor: "#2e7d32",
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  btnNovoText: { color: "#fff", fontWeight: "700" },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  titulo: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  linha: { color: "#555" },
  actions: { marginTop: 8, flexDirection: "row", gap: 16 },
  link: { color: "#1565c0", fontWeight: "700" },
});
