/**
 * useOfflineStatus - Hook para gerenciar status de conexão e cache offline
 * M6-U-003: Modo offline com cache local
 * 
 * Usa fetch para verificar conectividade e SecureStore para cache
 */

import { useEffect, useState, useCallback, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";

// Chave para cache local
const CACHE_PREFIX = "dashboard_cache_";
const CACHE_TIMESTAMP_KEY = "dashboard_cache_ts";
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 horas

// URL para verificar conectividade (Google DNS rápido)
const CONNECTIVITY_CHECK_URL = "https://dns.google/resolve?name=google.com&type=A";

export interface OfflineStatus {
    isOnline: boolean;
    isOfflineMode: boolean;
    lastSyncTime: Date | null;
    cacheAge: string;
}

export interface UseOfflineStatusReturn {
    status: OfflineStatus;
    saveToCache: (key: string, data: unknown) => Promise<void>;
    loadFromCache: <T>(key: string) => Promise<T | null>;
    clearCache: () => Promise<void>;
    forceRefresh: () => Promise<void>;
}

/**
 * Formata a idade do cache em texto legível
 */
function formatCacheAge(timestamp: number | null): string {
    if (!timestamp) return "Sem cache";

    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Agora";
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
}

/**
 * Hook para gerenciar modo offline e cache
 */
export function useOfflineStatus(): UseOfflineStatusReturn {
    const queryClient = useQueryClient();
    const [isOnline, setIsOnline] = useState(true);
    const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const wasOfflineRef = useRef(false);

    // Monitorar conexão de rede via fetch check
    useEffect(() => {
        const checkNetwork = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(CONNECTIVITY_CHECK_URL, {
                    method: "HEAD",
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                const online = response.ok;

                // Quando voltar online, revalidar queries
                if (online && wasOfflineRef.current) {
                    console.log("[OfflineStatus] Conexão restaurada, revalidando...");
                    queryClient.invalidateQueries();
                }

                wasOfflineRef.current = !online;
                setIsOnline(online);
            } catch {
                // Sem conexão
                wasOfflineRef.current = true;
                setIsOnline(false);
            }
        };

        // Verificar estado inicial
        checkNetwork();

        // Polling a cada 15 segundos
        pollingRef.current = setInterval(checkNetwork, 15000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [queryClient]);

    // Carregar timestamp do último sync
    useEffect(() => {
        SecureStore.getItemAsync(CACHE_TIMESTAMP_KEY).then((value) => {
            if (value) {
                setLastSyncTimestamp(parseInt(value, 10));
            }
        });
    }, []);

    // Salvar dados no cache local (SecureStore tem limite de 2KB por item)
    // Para dados maiores, fazemos chunking ou usamos apenas para timestamp
    const saveToCache = useCallback(async (key: string, data: unknown) => {
        try {
            const cacheKey = `${CACHE_PREFIX}${key}`;
            const jsonData = JSON.stringify(data);

            // SecureStore tem limite, então salvamos apenas dados pequenos
            if (jsonData.length < 2000) {
                await SecureStore.setItemAsync(cacheKey, jsonData);
            }

            const timestamp = Date.now();
            await SecureStore.setItemAsync(CACHE_TIMESTAMP_KEY, String(timestamp));
            setLastSyncTimestamp(timestamp);
        } catch (error) {
            console.warn("[OfflineCache] Erro ao salvar cache:", error);
        }
    }, []);

    // Carregar dados do cache local
    const loadFromCache = useCallback(async <T>(key: string): Promise<T | null> => {
        try {
            const cacheKey = `${CACHE_PREFIX}${key}`;
            const data = await SecureStore.getItemAsync(cacheKey);
            if (data) {
                // Verificar se cache expirou
                const timestampStr = await SecureStore.getItemAsync(CACHE_TIMESTAMP_KEY);
                if (timestampStr) {
                    const timestamp = parseInt(timestampStr, 10);
                    if (Date.now() - timestamp > CACHE_MAX_AGE_MS) {
                        console.log("[OfflineCache] Cache expirado, removendo...");
                        await SecureStore.deleteItemAsync(cacheKey);
                        return null;
                    }
                }
                return JSON.parse(data) as T;
            }
            return null;
        } catch (error) {
            console.warn("[OfflineCache] Erro ao carregar cache:", error);
            return null;
        }
    }, []);

    // Limpar cache (apenas timestamp pois SecureStore não lista chaves)
    const clearCache = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync(CACHE_TIMESTAMP_KEY);
            setLastSyncTimestamp(null);
        } catch (error) {
            console.warn("[OfflineCache] Erro ao limpar cache:", error);
        }
    }, []);

    // Forçar refresh (invalidar todas as queries)
    const forceRefresh = useCallback(async () => {
        await queryClient.invalidateQueries();
        await queryClient.refetchQueries();
    }, [queryClient]);

    const status: OfflineStatus = {
        isOnline,
        isOfflineMode: !isOnline,
        lastSyncTime: lastSyncTimestamp ? new Date(lastSyncTimestamp) : null,
        cacheAge: formatCacheAge(lastSyncTimestamp),
    };

    return {
        status,
        saveToCache,
        loadFromCache,
        clearCache,
        forceRefresh,
    };
}

/**
 * Hook simplificado para apenas verificar status online
 */
export function useIsOnline(): boolean {
    const [isOnline, setIsOnline] = useState(true);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const checkNetwork = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(CONNECTIVITY_CHECK_URL, {
                    method: "HEAD",
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                setIsOnline(response.ok);
            } catch {
                setIsOnline(false);
            }
        };

        checkNetwork();
        pollingRef.current = setInterval(checkNetwork, 15000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    return isOnline;
}
