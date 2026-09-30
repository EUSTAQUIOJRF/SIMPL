import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { idiomas } from "../i18n/translations";
import { obterHistorico, obterFavoritos, removerDoHistorico, removerFavorito } from "../historico";

export default function HistoricoScreen({ route, navigation }) {
  const idioma = route.params?.idioma || "pt";
  const t = idiomas[idioma];

  const [aba, setAba] = useState("favoritos"); // "favoritos" | "historico"
  const [lista, setLista] = useState([]);

  const carregar = useCallback(async () => {
    const dados = aba === "favoritos" ? await obterFavoritos() : await obterHistorico();
    setLista(dados);
  }, [aba]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function abrirItem(item) {
    navigation.navigate("Resultados", { contexto: item.contexto, dadosPreCarregados: item.dados });
  }

  function confirmarRemover(item) {
    Alert.alert(
      t.confirmarExclusaoTitulo,
      t.confirmarExclusaoTexto,
      [
        { text: t.cancelar, style: "cancel" },
        {
          text: t.apagar,
          style: "destructive",
          onPress: async () => {
            if (aba === "favoritos") {
              await removerFavorito(item.id);
            } else {
              await removerDoHistorico(item.id);
            }
            carregar();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.abas}>
        <TouchableOpacity
          style={[styles.aba, aba === "favoritos" && styles.abaAtiva]}
          onPress={() => setAba("favoritos")}
        >
          <Text style={[styles.abaTexto, aba === "favoritos" && 
styles.abaTextoAtivo]}>{t.abaFavoritos}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.aba, aba === "historico" && styles.abaAtiva]}
          onPress={() => setAba("historico")}
        >
          <Text style={[styles.abaTexto, aba === "historico" && 
styles.abaTextoAtivo]}>{t.abaHistorico}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.avisoExpiracao}>{t.avisoExpiracao}</Text>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vazio}>{t.listaVazia}</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity style={styles.itemConteudo} onPress={() => abrirItem(item)}>
              <Text style={styles.itemDestino}>{item.dados?.destino || item.contexto.cidade}</Text>
              <Text style={styles.itemData}>{new Date(item.timestamp).toLocaleDateString(idioma)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoApagar} onPress={() => confirmarRemover(item)}>
              <Text style={styles.iconeApagar}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.botaoVoltarTexto}>{t.voltar}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingTop: 60, paddingHorizontal: 20 },
  abas: { flexDirection: "row", marginBottom: 8, gap: 8 },
  aba: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: 
"#1e293b" },
  abaAtiva: { backgroundColor: "#38bdf8" },
  abaTexto: { color: "#94a3b8", fontWeight: "600" },
  abaTextoAtivo: { color: "#0f172a" },
  avisoExpiracao: { color: "#64748b", fontSize: 11, fontStyle: "italic", marginBottom: 16, textAlign: 
"center" },
  lista: { flexGrow: 1, gap: 10 },
  vazio: { color: "#64748b", textAlign: "center", marginTop: 40 },
  item: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  itemConteudo: {
    flex: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemDestino: { color: "#fff", fontSize: 16, fontWeight: "600", flexShrink: 1 },
  itemData: { color: "#64748b", fontSize: 12 },
  botaoApagar: { paddingHorizontal: 16, paddingVertical: 16 },
  iconeApagar: { fontSize: 18 },
  botaoVoltar: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  botaoVoltarTexto: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
});
