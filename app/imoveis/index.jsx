import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Imoveis() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Cadastro de Imóveis</Text>
      <Text style={styles.subtitle}>Aqui você implementará o CRUD.</Text>

      <Button
        title="Adicionar Novo Imóvel"
        onPress={() => alert("Futuro: ir para tela de cadastro!")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
    marginBottom: 20,
  },
});
