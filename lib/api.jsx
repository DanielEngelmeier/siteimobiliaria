import axios from "axios";
import { Platform } from "react-native";

const PORT = 3333;
const WEB_HOST =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

// Seu IPv4 da máquina que roda o json-server
const LAN_IP = "192.168.15.7";

const BASE_URL =
  Platform.OS === "web"
    ? `http://${WEB_HOST}:${PORT}` // Web (localhost no mesmo PC)
    : `http://${LAN_IP}:${PORT}`; // Expo Go / Emuladores

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});
