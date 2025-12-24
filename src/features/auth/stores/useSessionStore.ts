/**
 * Session Store - Gerenciamento de autenticação e sessão
 * Usa expo-secure-store para persistir credenciais de forma segura
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
    BASE_URL: 'laundry_base_url',
    USERNAME: 'laundry_username',
    PASSWORD: 'laundry_password',
} as const;

export interface SessionState {
    // Estado de autenticação
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Credenciais e configuração
    baseUrl: string | null;
    username: string | null;
    password: string | null;

    // Ações
    setCredentials: (baseUrl: string, username: string, password: string) => Promise<void>;
    loadCredentials: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    // DEV: Inicia autenticado para pular login durante desenvolvimento
    isAuthenticated: true,
    isLoading: false,
    error: null,
    // IMPORTANTE: Presence Dashboard API (Horse) - porta 8081
    baseUrl: 'http://192.168.0.136:8081',
    username: 'presence',
    password: '1',

    /**
     * Define e persiste as credenciais de autenticação
     */
    setCredentials: async (baseUrl: string, username: string, password: string) => {
        try {
            set({ isLoading: true, error: null });

            // Salva no SecureStore
            await Promise.all([
                SecureStore.setItemAsync(STORAGE_KEYS.BASE_URL, baseUrl),
                SecureStore.setItemAsync(STORAGE_KEYS.USERNAME, username),
                SecureStore.setItemAsync(STORAGE_KEYS.PASSWORD, password),
            ]);

            set({
                baseUrl,
                username,
                password,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: 'Erro ao salvar credenciais',
                isLoading: false,
                isAuthenticated: false,
            });
            console.error('Erro ao salvar credenciais:', error);
        }
    },

    /**
     * Carrega credenciais salvas do SecureStore
     * NOTA: Em modo DEV, ignora credenciais salvas e usa os valores padrão
     */
    loadCredentials: async () => {
        // DEV: Não carregar do SecureStore para usar sempre o IP correto
        console.log('[SessionStore] loadCredentials - usando valores padrão (DEV mode)');
        return;

        /* PRODUÇÃO: Descomentar quando tiver tela de login
        try {
            set({ isLoading: true, error: null });

            const [baseUrl, username, password] = await Promise.all([
                SecureStore.getItemAsync(STORAGE_KEYS.BASE_URL),
                SecureStore.getItemAsync(STORAGE_KEYS.USERNAME),
                SecureStore.getItemAsync(STORAGE_KEYS.PASSWORD),
            ]);

            if (baseUrl && username && password) {
                set({
                    baseUrl,
                    username,
                    password,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            set({
                error: 'Erro ao carregar credenciais',
                isLoading: false,
            });
            console.error('Erro ao carregar credenciais:', error);
        }
        */
    },

    /**
     * Remove credenciais e desloga o usuário
     */
    logout: async () => {
        try {
            set({ isLoading: true });

            // Remove do SecureStore
            await Promise.all([
                SecureStore.deleteItemAsync(STORAGE_KEYS.BASE_URL),
                SecureStore.deleteItemAsync(STORAGE_KEYS.USERNAME),
                SecureStore.deleteItemAsync(STORAGE_KEYS.PASSWORD),
            ]);

            set({
                baseUrl: null,
                username: null,
                password: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            set({
                error: 'Erro ao fazer logout',
                isLoading: false,
            });
            console.error('Erro ao fazer logout:', error);
        }
    },

    /**
     * Limpa mensagens de erro
     */
    clearError: () => set({ error: null }),
}));
