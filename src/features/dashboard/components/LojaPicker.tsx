/**
 * LojaPicker - Modal de seleção de lojas
 * Permite selecionar uma ou múltiplas lojas com busca
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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

  const renderLojaItem = useCallback(
    ({ item }: { item: Loja }) => {
      const selected = isSelected(item.codigo);
      return (
        <TouchableOpacity
          style={[
            styles.lojaItem,
            {
              backgroundColor: selected ? colors.accent + "15" : "transparent",
              borderBottomColor: colors.cardBorder,
            },
          ]}
          onPress={() => handleToggleLoja(item.codigo)}
          activeOpacity={0.7}
        >
          <View style={styles.lojaInfo}>
            <View
              style={[
                styles.lojaCodigoContainer,
                {
                  backgroundColor: selected ? colors.accent : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.lojaCodigo,
                  { color: selected ? "#FFF" : colors.mutedText },
                ]}
              >
                {item.codigo}
              </Text>
            </View>
            <View style={styles.lojaTextContainer}>
              <Text
                style={[styles.lojaNome, { color: colors.textPrimary }]}
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
          </View>
          <MaterialCommunityIcons
            name={
              selected
                ? "checkbox-marked-circle"
                : "checkbox-blank-circle-outline"
            }
            size={24}
            color={selected ? colors.accent : colors.mutedText}
          />
        </TouchableOpacity>
      );
    },
    [colors, isSelected, handleToggleLoja]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: colors.cardBorder },
            ]}
          >
            <View>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Selecionar Lojas
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.mutedText }]}>
                {selectionCount}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: colors.cardBorder },
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Busca */}
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: colors.background },
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
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color={colors.mutedText}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Ações rápidas */}
          <View
            style={[
              styles.quickActions,
              { borderBottomColor: colors.cardBorder },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.quickActionButton,
                {
                  backgroundColor:
                    tempSelecionadas.length === lojas.length && lojas.length > 0
                      ? colors.accent
                      : "transparent",
                  borderColor: colors.accent,
                },
              ]}
              onPress={handleSelectAll}
            >
              <MaterialCommunityIcons
                name="checkbox-multiple-marked"
                size={16}
                color={
                  tempSelecionadas.length === lojas.length && lojas.length > 0
                    ? "#FFF"
                    : colors.accent
                }
              />
              <Text
                style={[
                  styles.quickActionText,
                  {
                    color:
                      tempSelecionadas.length === lojas.length &&
                      lojas.length > 0
                        ? "#FFF"
                        : colors.accent,
                  },
                ]}
              >
                Selecionar Todas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionButton,
                {
                  backgroundColor:
                    tempSelecionadas.length === 0
                      ? colors.danger
                      : "transparent",
                  borderColor: colors.danger,
                },
              ]}
              onPress={handleClearAll}
            >
              <MaterialCommunityIcons
                name="checkbox-multiple-blank-outline"
                size={16}
                color={tempSelecionadas.length === 0 ? "#FFF" : colors.danger}
              />
              <Text
                style={[
                  styles.quickActionText,
                  {
                    color:
                      tempSelecionadas.length === 0 ? "#FFF" : colors.danger,
                  },
                ]}
              >
                Limpar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista de lojas */}
          <FlatList
            data={filteredLojas}
            keyExtractor={(item) => item.codigo}
            renderItem={renderLojaItem}
            style={styles.lojasList}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name={lojas.length === 0 ? "loading" : "store-off"}
                  size={48}
                  color={colors.mutedText}
                />
                <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                  {lojas.length === 0
                    ? "Carregando lojas..."
                    : "Nenhuma loja encontrada"}
                </Text>
              </View>
            }
          />

          {/* Footer */}
          <View
            style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}
          >
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.cardBorder }]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: colors.textSecondary },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.accent }]}
              onPress={handleAplicar}
            >
              <MaterialCommunityIcons name="check" size={18} color="#FFF" />
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  lojasList: {
    flex: 1,
  },
  lojaItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  lojaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  lojaCodigoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  lojaCodigo: {
    fontSize: 12,
    fontWeight: "700",
  },
  lojaTextContainer: {
    flex: 1,
  },
  lojaNome: {
    fontSize: 15,
    fontWeight: "500",
  },
  lojaUf: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
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
    fontWeight: "600",
  },
});
