/**
 * Navigation Types - Tipos TypeScript para React Navigation
 * Define as estruturas de rotas para Auth e Main
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// Stack de autenticação (não autenticado)
export type AuthStackParamList = {
    Login: undefined;
};

// Bottom Tabs do dashboard (autenticado)
export type MainTabsParamList = {
    KPIs: undefined;
    Charts: undefined;
    Heatmap: undefined;
    Ranking: undefined;
};

// Root Navigator (decide entre Auth e Main)
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabsParamList>;
};

// Tipos para navegação tipada
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
