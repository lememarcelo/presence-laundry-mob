/**
 * Store de Sessão/Autenticação
 * Gerencia credenciais do usuário usando expo-secure-store para persistência segura
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// Chaves para o secure storage
const STORAGE_KEYS = {
  API_BASE_URL: 'presence_api_base_url',
  USERNAME: 'presence_username',
  PASSWORD: 'presence_password',
  IS_AUTHENTICATED: 'presence_is_authenticated',
} as const;

export interface SessionCredentials {
  apiBaseUrl: string;
  username: string;
  password: string;
}

interface SessionState {
  // Estado
  isAuthenticated: boolean;
  isLoading: boolean;
  credentials: SessionCredentials | null;
  error: string | null;

  // Ações
  setCredentials: (credentials: SessionCredentials) => Promise<void>;
  clearCredentials: () => Promise<void>;
  loadStoredCredentials: () => Promise<boolean>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Store Zustand para gerenciamento de sessão
 * Persiste credenciais de forma segura usando expo-secure-store
 */
export const useSessionStore = create<SessionState>((set, get) => ({
  // Estado inicial
  isAuthenticated: false,
  isLoading: true,
  credentials: null,
  error: null,

  /**
   * Salva credenciais no secure store e atualiza estado
   */
  setCredentials: async (credentials: SessionCredentials) => {
    try {
      set({ isLoading: true, error: null });

      // Salva cada credencial separadamente no secure store
      await SecureStore.setItemAsync(STORAGE_KEYS.API_BASE_URL, credentials.apiBaseUrl);
      await SecureStore.setItemAsync(STORAGE_KEYS.USERNAME, credentials.username);
      await SecureStore.setItemAsync(STORAGE_KEYS.PASSWORD, credentials.password);
      await SecureStore.setItemAsync(STORAGE_KEYS.IS_AUTHENTICATED, 'true');

      set({
        credentials,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar credenciais';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * Remove credenciais do secure store e limpa estado
   */
  clearCredentials: async () => {
    try {
      set({ isLoading: true });

      // Remove todas as credenciais do secure store
      await SecureStore.deleteItemAsync(STORAGE_KEYS.API_BASE_URL);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USERNAME);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PASSWORD);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.IS_AUTHENTICATED);

      set({
        credentials: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao limpar credenciais';
      set({ error: errorMessage, isLoading: false });
    }
  },

  /**
   * Carrega credenciais salvas do secure store
   * Retorna true se encontrou credenciais válidas
   */
  loadStoredCredentials: async () => {
    try {
      set({ isLoading: true, error: null });

      const [apiBaseUrl, username, password, isAuth] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.API_BASE_URL),
        SecureStore.getItemAsync(STORAGE_KEYS.USERNAME),
        SecureStore.getItemAsync(STORAGE_KEYS.PASSWORD),
        SecureStore.getItemAsync(STORAGE_KEYS.IS_AUTHENTICATED),
      ]);

      // Verifica se todas as credenciais existem
      if (apiBaseUrl && username && password && isAuth === 'true') {
        set({
          credentials: { apiBaseUrl, username, password },
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      set({
        credentials: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar credenciais';
      set({
        credentials: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  setError: (error: string | null) => set({ error }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// Exporta seletor para uso com getState() fora de componentes React
export const getSessionCredentials = () => useSessionStore.getState().credentials;

// Verifica se está autenticado (para uso fora de componentes React)
export const isAuthenticated = () => useSessionStore.getState().isAuthenticated;
