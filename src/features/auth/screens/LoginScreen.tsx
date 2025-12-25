/**
 * LoginScreen - Tela de autenticação
 * Realiza login com Basic Auth no Presence Remote
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useSessionStore } from "../stores/session.store";

export function LoginScreen() {
  const { colors, tokens } = useTheme();

  // Estado do formulário
  const [apiBaseUrl, setApiBaseUrl] = useState("http://192.168.0.136:8081");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados de feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store de sessão
  const setCredentials = useSessionStore((state) => state.setCredentials);

  /**
   * Valida o formulário antes de enviar
   */
  const validateForm = useCallback((): boolean => {
    if (!apiBaseUrl.trim()) {
      setError("Informe a URL do servidor");
      return false;
    }
    if (!username.trim()) {
      setError("Informe o usuário");
      return false;
    }
    if (!password.trim()) {
      setError("Informe a senha");
      return false;
    }
    return true;
  }, [apiBaseUrl, username, password]);

  /**
   * Realiza o login testando conexão com o servidor
   * TODO: Substituir pelo endpoint real do Presence Remote
   */
  const handleLogin = useCallback(async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implementar validação real contra o Presence Remote
      // Exemplo: GET /TServerMethods/ValidarLogin/{usuario}
      // Por enquanto, apenas salva as credenciais para testes de navegação

      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Salva credenciais e marca como autenticado
      await setCredentials({
        apiBaseUrl: apiBaseUrl.trim(),
        username: username.trim(),
        password: password.trim(),
      });
      // A navegação ocorrerá automaticamente pelo RootNavigator
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao conectar com o servidor";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, username, password, validateForm, setCredentials]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header / Logo */}
        <View style={styles.header}>
          <View
            style={[styles.logoContainer, { backgroundColor: colors.accent }]}
          >
            <MaterialCommunityIcons
              name="washing-machine"
              size={48}
              color={colors.accentText}
            />
          </View>
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary, fontSize: tokens.typography.h2 },
            ]}
          >
            Presence Laundry
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary, fontSize: tokens.typography.body },
            ]}
          >
            Dashboard Gerencial
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          {/* Campo URL do Servidor */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.textSecondary,
                  fontSize: tokens.typography.bodySmall,
                },
              ]}
            >
              URL do Servidor
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  borderRadius: tokens.borderRadius.md,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="web"
                size={20}
                color={colors.mutedText}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    fontSize: tokens.typography.body,
                  },
                ]}
                value={apiBaseUrl}
                onChangeText={setApiBaseUrl}
                placeholder="http://servidor:porta/datasnap/rest"
                placeholderTextColor={colors.mutedText}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>
          </View>

          {/* Campo Usuário */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.textSecondary,
                  fontSize: tokens.typography.bodySmall,
                },
              ]}
            >
              Usuário
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  borderRadius: tokens.borderRadius.md,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="account"
                size={20}
                color={colors.mutedText}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    fontSize: tokens.typography.body,
                  },
                ]}
                value={username}
                onChangeText={setUsername}
                placeholder="Digite seu usuário"
                placeholderTextColor={colors.mutedText}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Campo Senha */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.textSecondary,
                  fontSize: tokens.typography.bodySmall,
                },
              ]}
            >
              Senha
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  borderRadius: tokens.borderRadius.md,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="lock"
                size={20}
                color={colors.mutedText}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    fontSize: tokens.typography.body,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.mutedText}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.mutedText}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mensagem de erro */}
          {error && (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: `${colors.danger}15`,
                  borderRadius: tokens.borderRadius.md,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="alert-circle"
                size={20}
                color={colors.danger}
              />
              <Text
                style={[
                  styles.errorText,
                  {
                    color: colors.danger,
                    fontSize: tokens.typography.bodySmall,
                  },
                ]}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Botão Entrar */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isLoading ? colors.disabled : colors.accent,
                borderRadius: tokens.borderRadius.md,
              },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.accentText} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="login"
                  size={22}
                  color={colors.accentText}
                />
                <Text
                  style={[
                    styles.submitButtonText,
                    {
                      color: colors.accentText,
                      fontSize: tokens.typography.body,
                    },
                  ]}
                >
                  Entrar
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: colors.mutedText, fontSize: tokens.typography.caption },
            ]}
          >
            Presence Sistemas © 2025
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.8,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontWeight: "500",
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
  },
  passwordToggle: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  errorText: {
    flex: 1,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    gap: 10,
    marginTop: 8,
  },
  submitButtonText: {
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    opacity: 0.7,
  },
});
