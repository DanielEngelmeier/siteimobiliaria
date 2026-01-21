import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: "#0055aa" },
        headerTintColor: "#fff",
        drawerActiveTintColor: "#0055aa",
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Drawer.Screen
        name="imoveis/index"
        options={{
          title: "Cadastro de Imóveis",
        }}
      />
    </Drawer>
  );
}
