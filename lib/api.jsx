import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const PORT = 3333;

// Descobre o host automaticamente.
// - Web: usa o host do navegador.
// - Expo Go / Emuladores: tenta extrair do hostUri do Metro.
// - Fallback: 'localhost'.
function resolveHost() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.hostname;
  }

  const expoConfig = Constants.expoConfig || {};
  const manifest = Constants.manifest || {};
  const manifest2 =
    Constants.manifest2 &&
    Constants.manifest2.extra &&
    Constants.manifest2.extra.expoClient
      ? Constants.manifest2.extra.expoClient
      : {};

  const hostUri =
    expoConfig.hostUri || manifest2.hostUri || manifest.hostUri || null;

  if (hostUri) {
    // Geralmente vem algo como "192.168.15.10:19000"
    const host = hostUri.split(":")[0];
    if (host) return host;
  }

  return "localhost";
}

// Permite sobrescrever por variável de ambiente (para builds/CI).
// Use prefixo EXPO_PUBLIC_ para estar disponível no app.
const ENV_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const BASE_URL = ENV_BASE_URL || `http://${resolveHost()}:${PORT}`;
console.log("[API] BASE_URL =", BASE_URL);
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});
