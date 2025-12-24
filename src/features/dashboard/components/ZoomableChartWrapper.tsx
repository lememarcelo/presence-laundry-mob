/**
 * ZoomableChartWrapper - Container com scroll horizontal e indicador de zoom
 * Permite visualizar gráficos longos com scroll suave
 */

import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/shared/theme/ThemeProvider";

interface ZoomableChartWrapperProps {
  children: React.ReactNode;
  /** Largura do conteúdo do gráfico (maior que a tela para scroll) */
  contentWidth?: number;
  /** Altura do container */
  height?: number;
  /** Mostrar indicador de scroll */
  showScrollHint?: boolean;
  /** Callback quando scroll muda */
  onScroll?: (scrollX: number) => void;
}

export function ZoomableChartWrapper({
  children,
  contentWidth,
  height = 220,
  showScrollHint = true,
  onScroll,
}: ZoomableChartWrapperProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [showHint, setShowHint] = useState(showScrollHint);
  const [containerWidth, setContainerWidth] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Verifica se precisa de scroll
  const needsScroll = contentWidth ? contentWidth > containerWidth : false;

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;

    // Esconde hint após primeiro scroll
    if (showHint && scrollX > 10) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowHint(false));
    }

    onScroll?.(scrollX);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={[styles.container, { height }]} onLayout={handleLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={true}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={[
          styles.scrollContent,
          contentWidth ? { width: contentWidth } : undefined,
        ]}
        bounces={true}
        decelerationRate="fast"
      >
        {children}
      </ScrollView>

      {/* Indicador de scroll */}
      {needsScroll && showHint && (
        <Animated.View
          style={[
            styles.scrollHint,
            { backgroundColor: colors.accent + "E0", opacity: fadeAnim },
          ]}
        >
          <MaterialCommunityIcons
            name="gesture-swipe-horizontal"
            size={16}
            color="#FFF"
          />
          <Text style={styles.scrollHintText}>Deslize para ver mais</Text>
        </Animated.View>
      )}

      {/* Fade gradient nas bordas quando há scroll */}
      {needsScroll && (
        <View
          style={[styles.fadeRight, { backgroundColor: colors.surface }]}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  scrollContent: {
    paddingRight: 40,
  },
  scrollHint: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  scrollHintText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },
  fadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    opacity: 0.8,
  },
});
