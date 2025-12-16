/**
 * Axios Client - Configuração HTTP com Basic Auth
 * Cliente HTTP centralizado para comunicação com Presence Remote (DataSnap)
 */

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getSessionCredentials } from '@features/auth/stores/session.store';

// Instância singleton do axios
let axiosInstance: AxiosInstance | null = null;

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

        if (credentials) {
          // Define a URL base dinamicamente
          config.baseURL = credentials.apiBaseUrl;

          // Adiciona autenticação Basic
          config.auth = {
            username: credentials.username,
            password: credentials.password,
          };
        }

        // Log em desenvolvimento
        if (__DEV__) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
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
              // O componente que chamou deve tratar o logout
              console.warn('[API] Autenticação falhou (401)');
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
