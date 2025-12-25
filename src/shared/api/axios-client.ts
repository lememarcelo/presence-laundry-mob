/**
 * Axios Client - Cliente HTTP configurado para Basic Auth
 * Intercepta requisições para adicionar autenticação automaticamente
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getSessionCredentials, useSessionStore } from '@/features/auth/stores/session.store';

/**
 * Instância principal do Axios
 * Será configurada dinamicamente com a baseURL do usuário
 */
export const apiClient: AxiosInstance = axios.create({
    timeout: 60000, // 60 segundos - aumentado para endpoints pesados
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor para adicionar Basic Auth em todas as requisições
 * Lê as credenciais do SessionStore e gera o header Authorization
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const credentials = getSessionCredentials();

        if (!credentials) {
            // Rejeita requisição se não houver credenciais
            if (__DEV__) {
                console.warn('[API] Requisição bloqueada - credenciais não disponíveis');
            }
            return Promise.reject(new Error('Credenciais não disponíveis'));
        }

        // Define a baseURL dinamicamente
        config.baseURL = credentials.apiBaseUrl;

        // Adiciona Basic Auth
        const authCredentials = `${credentials.username}:${credentials.password}`;
        const encodedCredentials = btoa(authCredentials);
        config.headers.Authorization = `Basic ${encodedCredentials}`;

        // Log da URL completa
        if (__DEV__) {
            const fullUrl = `${config.baseURL}${config.url}`;
            console.log('[API]', config.method?.toUpperCase(), fullUrl);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor de resposta para tratamento de erros comuns
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (__DEV__) {
            console.log('[API] Error details:', {
                message: error.message,
                code: error.code,
                url: error.config?.url,
                status: error.response?.status,
            });
        }

        // Erros de autenticação (401)
        if (error.response?.status === 401) {
            useSessionStore.getState().clearCredentials();
            return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
        }

        // Erros de conexão
        if (!error.response) {
            return Promise.reject(new Error(`Erro de conexão: ${error.message || 'Verifique sua internet.'}`));
        }

        // Outros erros HTTP
        const message = error.response?.data?.message || 'Erro ao comunicar com o servidor';
        return Promise.reject(new Error(message));
    }
);

/**
 * Helper para extrair mensagem de erro de forma padronizada
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Erro desconhecido';
}
