/**
 * Axios Client - Configuração HTTP com Basic Auth
 * Cliente HTTP centralizado para comunicação com Presence Remote (DataSnap)
 * M7-A-001: Tratamento de erro 401 com redirect para login
 */

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getSessionCredentials } from '@features/auth/stores/session.store';

// Instância singleton do axios
let axiosInstance: AxiosInstance | null = null;

// Callback para logout em caso de 401 (evita dependência circular)
let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Registra callback para ser chamado em erro 401
 * Deve ser chamado no App.tsx com a função de logout do store
 */
export function setOnUnauthorizedCallback(callback: () => void): void {
  onUnauthorizedCallback = callback;
}

/**
 * Cria/retorna a instância configurada do axios
 * Usa padrão singleton para garantir interceptors configurados
 */
export function getAxiosInstance(): AxiosInstance {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      timeout: 30000, // 30 segundos
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Interceptor de requisição - adiciona Basic Auth
    axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const credentials = getSessionCredentials();

        if (!credentials) {
          // Rejeita requisição se não houver credenciais
          if (__DEV__) {
            console.warn('[API] Requisição bloqueada - credenciais não disponíveis');
          }
          return Promise.reject(new Error('Credenciais não disponíveis'));
        }

        // Define a URL base dinamicamente
        config.baseURL = credentials.apiBaseUrl;

        // Adiciona autenticação Basic
        config.auth = {
          username: credentials.username,
          password: credentials.password,
        };

        // Log em desenvolvimento
        if (__DEV__) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        }

        return config;
      },
      (error: AxiosError) => {
        console.error('[API] Erro na requisição:', error.message);
        return Promise.reject(error);
      }
    );

    // Interceptor de resposta - trata erros comuns
    axiosInstance.interceptors.response.use(
      (response) => {
        // Log em desenvolvimento
        if (__DEV__) {
          console.log(`[API] Response ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error: AxiosError) => {
        // Log detalhado do erro
        if (__DEV__) {
          console.error('[API] Erro:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
          });
        }

        // Tratamento de erros específicos
        if (error.response) {
          switch (error.response.status) {
            case 401:
              // Não autorizado - credenciais inválidas
              // M7-A-001: Chama callback de logout se registrado
              console.warn('[API] Autenticação falhou (401) - realizando logout');
              if (onUnauthorizedCallback) {
                onUnauthorizedCallback();
              }
              break;
            case 403:
              console.warn('[API] Acesso negado (403)');
              break;
            case 404:
              console.warn('[API] Recurso não encontrado (404)');
              break;
            case 500:
              console.error('[API] Erro interno do servidor (500)');
              break;
          }
        } else if (error.request) {
          // Requisição feita mas sem resposta (timeout, rede)
          console.error('[API] Sem resposta do servidor - verifique a conexão');
        }

        return Promise.reject(error);
      }
    );
  }

  return axiosInstance;
}

/**
 * Reseta a instância do axios (útil para logout)
 */
export function resetAxiosInstance(): void {
  axiosInstance = null;
}

/**
 * Testa a conexão com o servidor usando as credenciais fornecidas
 * Usado na tela de login para validar credenciais
 */
export async function testConnection(
  apiBaseUrl: string,
  username: string,
  password: string
): Promise<boolean> {
  try {
    const response = await axios.get(`${apiBaseUrl}/TSMDashLaundry/Lojas`, {
      auth: { username, password },
      timeout: 10000,
    });

    // Considera sucesso se retornou 200 e dados válidos
    return response.status === 200;
  } catch (error) {
    if (__DEV__) {
      console.error('[API] Teste de conexão falhou:', error);
    }
    return false;
  }
}

// Exporta a instância como default
export default getAxiosInstance;
