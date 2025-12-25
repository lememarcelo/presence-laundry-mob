/**
 * Store para gerenciar ordem dos KPI cards
 * Persiste a ordem customizada pelo usuário no AsyncStorage
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Ordem padrão dos KPIs (IDs)
export const DEFAULT_KPI_ORDER = [
    "faturamento",
    "tickets",
    "ticket-medio",
    "pecas",
    "delivery",
    "ranking",
];

interface KPIOrderState {
    /** Lista de IDs dos KPIs na ordem customizada */
    order: string[];
    /** Define uma nova ordem para os KPIs */
    setOrder: (order: string[]) => void;
    /** Reseta para a ordem padrão */
    resetOrder: () => void;
    /** Move um KPI de uma posição para outra */
    moveKPI: (fromIndex: number, toIndex: number) => void;
}

export const useKPIOrderStore = create<KPIOrderState>()(
    persist(
        (set, get) => ({
            order: DEFAULT_KPI_ORDER,

            setOrder: (order: string[]) => {
                set({ order });
            },

            resetOrder: () => {
                set({ order: DEFAULT_KPI_ORDER });
            },

            moveKPI: (fromIndex: number, toIndex: number) => {
                const currentOrder = [...get().order];
                const [removed] = currentOrder.splice(fromIndex, 1);
                currentOrder.splice(toIndex, 0, removed);
                set({ order: currentOrder });
            },
        }),
        {
            name: "kpi-order-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

/**
 * Hook helper para ordenar KPIs baseado na ordem salva
 */
export function useOrderedKPIs<T extends { id: string }>(kpis: T[]): T[] {
    const { order } = useKPIOrderStore();

    // Cria um mapa de KPIs por ID para acesso rápido
    const kpiMap = new Map(kpis.map((kpi) => [kpi.id, kpi]));

    // Ordena baseado na ordem salva
    const orderedKPIs: T[] = [];

    // Primeiro adiciona na ordem salva
    for (const id of order) {
        const kpi = kpiMap.get(id);
        if (kpi) {
            orderedKPIs.push(kpi);
            kpiMap.delete(id);
        }
    }

    // Depois adiciona qualquer KPI novo que não estava na ordem salva
    for (const kpi of kpiMap.values()) {
        orderedKPIs.push(kpi);
    }

    return orderedKPIs;
}
