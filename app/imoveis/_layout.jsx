import { Stack } from "expo-router";

export default function ImoveisLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Imóveis" }} />
      <Stack.Screen name="form" options={{ title: "Cadastro de Imóvel" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalhe do Imóvel" }} />
    </Stack>
  );
}
