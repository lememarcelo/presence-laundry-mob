/**
 * OnboardingTour - Tutorial de primeira utilização
 * Apresenta os principais recursos do dashboard para novos usuários
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "@/shared/theme/ThemeProvider";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ONBOARDING_COMPLETE_KEY = "presence_dashboard_onboarding_v1";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  highlight?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Dashboard! 👋",
    description:
      "Acompanhe os indicadores da sua lavanderia em tempo real, de qualquer lugar.",
    icon: "chart-box",
    iconColor: "#3B82F6",
  },
  {
    id: "kpis",
    title: "Indicadores Principais",
    description:
      "Veja faturamento, tickets, peças e muito mais. Toque em qualquer card para ver detalhes.",
    icon: "finance",
    iconColor: "#10B981",
    highlight: "Indicadores",
  },
  {
    id: "charts",
    title: "Gráficos e Tendências",
    description:
      "Analise a evolução do seu negócio com gráficos interativos de faturamento, serviços e pagamentos.",
    icon: "chart-line",
    iconColor: "#8B5CF6",
    highlight: "Gráficos",
  },
  {
    id: "filters",
    title: "Filtros Personalizados",
    description:
      "Filtre por loja e período. Seus filtros são salvos automaticamente entre sessões.",
    icon: "filter-variant",
    iconColor: "#F59E0B",
  },
  {
    id: "ranking",
    title: "Ranking de Lojas",
    description:
      "Compare o desempenho da sua loja com outras unidades da rede. Sua loja é destacada automaticamente.",
    icon: "trophy",
    iconColor: "#EF4444",
    highlight: "Ranking",
  },
  {
    id: "offline",
    title: "Funciona Offline 📴",
    description:
      "Os dados são salvos no seu dispositivo. Você pode consultar mesmo sem conexão!",
    icon: "cloud-off-outline",
    iconColor: "#6B7280",
  },
];

interface OnboardingTourProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export function OnboardingTour({
  onComplete,
  forceShow = false,
}: OnboardingTourProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Verifica se deve mostrar o onboarding
  useEffect(() => {
    async function checkOnboarding() {
      if (forceShow) {
        setVisible(true);
        return;
      }

      try {
        const completed = await SecureStore.getItemAsync(
          ONBOARDING_COMPLETE_KEY
        );
        if (!completed) {
          setVisible(true);
        }
      } catch (error) {
        console.error("Erro ao verificar onboarding:", error);
      }
    }

    checkOnboarding();
  }, [forceShow]);

  // Animação de entrada
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // Animação de transição entre steps
  const animateToStep = (newStep: number) => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 30,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(newStep);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      animateToStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      animateToStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, "true");
    } catch (error) {
      console.error("Erro ao salvar onboarding:", error);
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onComplete?.();
    });
  };

  if (!visible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
          },
        ]}
      >
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          {/* Skip button */}
          {!isLastStep && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.skipText}>Pular</Text>
            </TouchableOpacity>
          )}

          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Icon */}
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: step.iconColor + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name={step.icon as any}
                size={64}
                color={step.iconColor}
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>{step.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{step.description}</Text>

            {/* Highlight tab hint */}
            {step.highlight && (
              <View
                style={[
                  styles.highlightHint,
                  { backgroundColor: colors.accent + "30" },
                ]}
              >
                <MaterialCommunityIcons
                  name="gesture-tap"
                  size={16}
                  color={colors.accent}
                />
                <Text style={[styles.highlightText, { color: colors.accent }]}>
                  Toque em "{step.highlight}" na barra inferior
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Progress dots */}
          <View style={styles.dotsContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep
                    ? styles.dotActive
                    : { backgroundColor: "rgba(255,255,255,0.3)" },
                ]}
              />
            ))}
          </View>

          {/* Navigation buttons */}
          <View style={styles.buttonContainer}>
            {!isFirstStep && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handlePrevious}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color="#FFF"
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                { backgroundColor: step.iconColor },
                isFirstStep && { flex: 1 },
              ]}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>
                {isLastStep ? "Começar!" : "Próximo"}
              </Text>
              {!isLastStep && (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#FFF"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

// Hook para resetar o onboarding (útil para testes/configurações)
export async function resetOnboarding(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ONBOARDING_COMPLETE_KEY);
  } catch (error) {
    console.error("Erro ao resetar onboarding:", error);
  }
}

// Hook para verificar status do onboarding
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const completed = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY);
    return completed === "true";
  } catch {
    return false;
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  highlightHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#FFF",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 40,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: 56,
  },
  buttonSecondary: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  buttonPrimary: {
    flex: 2,
    gap: 4,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
