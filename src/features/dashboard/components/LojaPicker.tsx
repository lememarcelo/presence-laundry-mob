/**
 * LojaPicker - Modal de seleção de lojas (redesigned)
 * Design moderno com lista ampla e visual clean
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Dimensions,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { Loja } from "../api/dashboard.service";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface LojaPickerProps {
  visible: boolean;
  onClose: () => void;
  lojas: Loja[];
  selectedLojas: string[];
  onApply: (lojas: string[]) => void;
}

export function LojaPicker({
  visible,
  onClose,
  lojas,
  selectedLojas,
  onApply,
}: LojaPickerProps) {
  const { colors, tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [tempSelecionadas, setTempSelecionadas] = useState<string[]>([]);

  // Sincroniza estado local quando o modal abre
  useEffect(() => {
    if (visible) {
      setTempSelecionadas(selectedLojas);
      setSearchText("");
    }
  }, [visible, selectedLojas]);

  // Filtra lojas pelo texto de busca
  const filteredLojas = useMemo(() => {
    if (!searchText.trim()) return lojas;
    const search = searchText.toLowerCase();
    return lojas.filter(
      (loja) =>
        loja.nome.toLowerCase().includes(search) ||
        loja.codigo.toLowerCase().includes(search)
    );
  }, [lojas, searchText]);

  // Marcar TODAS as lojas
  const handleSelectAll = useCallback(() => {
    const allCodigos = lojas.map((l) => l.codigo);
    setTempSelecionadas(allCodigos);
  }, [lojas]);

  // Limpar seleção (= todas as lojas, pois vazio significa todas)
  const handleClearAll = useCallback(() => {
    setTempSelecionadas([]);
  }, []);

  // Toggle individual de uma loja
  const handleToggleLoja = useCallback((codigo: string) => {
    setTempSelecionadas((prev) => {
      if (prev.includes(codigo)) {
        return prev.filter((c) => c !== codigo);
      } else {
        return [...prev, codigo];
      }
    });
  }, []);

  // Verifica se uma loja está selecionada
  const isSelected = useCallback(
    (codigo: string) => tempSelecionadas.includes(codigo),
    [tempSelecionadas]
  );

  // Aplicar filtro e fechar modal
  const handleAplicar = useCallback(() => {
    onApply(tempSelecionadas);
    onClose();
  }, [tempSelecionadas, onApply, onClose]);

  // Quantidade selecionada para exibição
  const selectionCount = useMemo(() => {
    if (tempSelecionadas.length === 0) {
      return `Todas as lojas (${lojas.length})`;
    }
    return `${tempSelecionadas.length} de ${lojas.length} selecionada(s)`;
  }, [tempSelecionadas.length, lojas.length]);

  const allSelected =
    tempSelecionadas.length === lojas.length && lojas.length > 0;
  const noneSelected = tempSelecionadas.length === 0;

  const renderLojaItem = useCallback(
    ({ item, index }: { item: Loja; index: number }) => {
      const selected = isSelected(item.codigo);
      return (
        <TouchableOpacity
          style={[
            styles.lojaItem,
            {
              backgroundColor: selected ? colors.accent + "12" : colors.surface,
            },
            index === 0 && styles.firstItem,
          ]}
          onPress={() => handleToggleLoja(item.codigo)}
          activeOpacity={0.6}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected }}
          accessibilityLabel={`Loja ${item.nome}`}
        >
          {/* Checkbox visual */}
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: selected ? colors.accent : "transparent",
                borderColor: selected ? colors.accent : colors.cardBorder,
              },
            ]}
          >
            {selected && (
              <MaterialCommunityIcons name="check" size={14} color="#FFF" />
            )}
          </View>

          {/* Badge de código */}
          <View
            style={[
              styles.codigoBadge,
              {
                backgroundColor: selected
                  ? colors.accent + "25"
                  : colors.background,
              },
            ]}
          >
            <Text
              style={[
                styles.codigoText,
                { color: selected ? colors.accent : colors.mutedText },
              ]}
            >
              {item.codigo}
            </Text>
          </View>

          {/* Nome e UF */}
          <View style={styles.lojaTextContainer}>
            <Text
              style={[
                styles.lojaNome,
                {
                  color: colors.textPrimary,
                  fontWeight: selected ? "600" : "400",
                },
              ]}
              numberOfLines={1}
            >
              {item.nome}
            </Text>
            {item.uf && (
              <Text style={[styles.lojaUf, { color: colors.mutedText }]}>
                {item.uf}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [colors, isSelected, handleToggleLoja]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.listHeader}>
        <Text style={[styles.listHeaderText, { color: colors.mutedText }]}>
          {filteredLojas.length}{" "}
          {filteredLojas.length === 1 ? "loja encontrada" : "lojas encontradas"}
        </Text>
      </View>
    ),
    [filteredLojas.length, colors.mutedText]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top,
          },
        ]}
      >
        <StatusBar
          barStyle={tokens.mode === "dark" ? "light-content" : "dark-content"}
        />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Selecionar Lojas
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedText }]}>
              {selectionCount}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAplicar}
            style={[
              styles.applyHeaderButton,
              { backgroundColor: colors.accent },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Aplicar seleção"
          >
            <Text style={styles.applyHeaderButtonText}>OK</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={[styles.searchSection, { backgroundColor: colors.surface }]}
        >
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={colors.mutedText}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Buscar por nome ou código..."
              placeholderTextColor={colors.mutedText}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color={colors.mutedText}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View
          style={[styles.quickActions, { backgroundColor: colors.surface }]}
        >
          <TouchableOpacity
            style={[
              styles.quickButton,
              {
                backgroundColor: allSelected
                  ? colors.accent
                  : colors.background,
                borderColor: allSelected ? colors.accent : colors.cardBorder,
              },
            ]}
            onPress={handleSelectAll}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="checkbox-multiple-marked"
              size={18}
              color={allSelected ? "#FFF" : colors.accent}
            />
            <Text
              style={[
                styles.quickButtonText,
                { color: allSelected ? "#FFF" : colors.accent },
              ]}
            >
              Selecionar Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickButton,
              {
                backgroundColor: noneSelected
                  ? colors.danger
                  : colors.background,
                borderColor: noneSelected ? colors.danger : colors.cardBorder,
              },
            ]}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={18}
              color={noneSelected ? "#FFF" : colors.danger}
            />
            <Text
              style={[
                styles.quickButtonText,
                { color: noneSelected ? "#FFF" : colors.danger },
              ]}
            >
              Limpar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Lojas - Ocupa todo espaço restante */}
        <FlatList
          data={filteredLojas}
          keyExtractor={(item) => item.codigo}
          renderItem={renderLojaItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name={lojas.length === 0 ? "store-clock" : "store-search"}
                size={64}
                color={colors.mutedText}
              />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {lojas.length === 0
                  ? "Carregando lojas..."
                  : "Nenhuma loja encontrada"}
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                {lojas.length === 0
                  ? "Aguarde enquanto buscamos as lojas"
                  : "Tente buscar com outros termos"}
              </Text>
            </View>
          }
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
        />

        {/* Footer Fixo */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.cardBorder,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.cardBorder }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.cancelButtonText, { color: colors.textSecondary }]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.accent }]}
            onPress={handleAplicar}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="check" size={20} color="#FFF" />
            <Text style={styles.applyButtonText}>
              Aplicar{" "}
              {tempSelecionadas.length > 0
                ? `(${tempSelecionadas.length})`
                : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  applyHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyHeaderButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  quickButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  listHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  listHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  lojaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    gap: 12,
  },
  firstItem: {
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  codigoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 44,
    alignItems: "center",
  },
  codigoText: {
    fontSize: 12,
    fontWeight: "700",
  },
  lojaTextContainer: {
    flex: 1,
  },
  lojaNome: {
    fontSize: 15,
  },
  lojaUf: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
