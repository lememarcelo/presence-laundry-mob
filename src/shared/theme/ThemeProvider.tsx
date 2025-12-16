/**
 * Presence Laundry Mobile - Theme Provider
 * Gerencia o tema (light/dark) da aplicação
 */

import { Appearance } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  getThemeTokens,
  type ThemeMode,
  type ThemePalette,
  type ThemeTokens,
} from "./theme";

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemePalette;
  tokens: ThemeTokens;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Provider que gerencia o tema da aplicação
 * Inicializa com o tema do sistema e permite alternar entre light/dark
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  // Inicializa com o tema do sistema operacional
  const [mode, setMode] = useState<ThemeMode>(() =>
    Appearance.getColorScheme() === "dark" ? "dark" : "light"
  );

  const toggleMode = useCallback(() => {
    setMode((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const themeTokens = getThemeTokens(mode);
    return {
      mode,
      tokens: themeTokens,
      colors: themeTokens.palette,
      setMode,
      toggleMode,
    };
  }, [mode, toggleMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook para acessar o tema atual
 * Deve ser usado dentro de um ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}
