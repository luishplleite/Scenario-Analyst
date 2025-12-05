import type { Translations } from "@shared/schema";

export const translations: Record<string, Translations> = {
  "pt-br": {
    auth: {
      login: "Entrar",
      register: "Cadastrar",
      username: "Nome de usuário",
      password: "Senha",
      confirmPassword: "Confirmar senha",
      displayName: "Nome de exibição",
      enterOffice: "Entrar no Escritório",
      selectAvatar: "Escolha seu Avatar",
      selectLanguage: "Selecione o idioma",
    },
    hud: {
      mute: "Mudo",
      unmute: "Ativar som",
      cameraOn: "Câmera ligada",
      cameraOff: "Câmera desligada",
      settings: "Configurações",
      connecting: "Conectando...",
      connected: "Conectado",
      disconnected: "Desconectado",
    },
    lobby: {
      title: "DevHub - Escritório Virtual",
      chooseSkin: "Escolha sua aparência",
      enterButton: "Entrar no Escritório",
    },
    status: {
      online: "Online",
      connecting: "Conectando",
      offline: "Offline",
    },
  },
  "en-us": {
    auth: {
      login: "Login",
      register: "Register",
      username: "Username",
      password: "Password",
      confirmPassword: "Confirm password",
      displayName: "Display name",
      enterOffice: "Enter Office",
      selectAvatar: "Choose your Avatar",
      selectLanguage: "Select language",
    },
    hud: {
      mute: "Muted",
      unmute: "Unmute",
      cameraOn: "Camera on",
      cameraOff: "Camera off",
      settings: "Settings",
      connecting: "Connecting...",
      connected: "Connected",
      disconnected: "Disconnected",
    },
    lobby: {
      title: "DevHub - Virtual Office",
      chooseSkin: "Choose your look",
      enterButton: "Enter the Office",
    },
    status: {
      online: "Online",
      connecting: "Connecting",
      offline: "Offline",
    },
  },
};

export type Language = "pt-br" | "en-us";

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations["en-us"];
}
