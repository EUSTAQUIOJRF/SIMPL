// Histórico e favoritos ficam salvos localmente no aparelho (AsyncStorage), por usuário.
// Guardamos o resultado completo já buscado, assim reabrir um item do histórico ou dos
// favoritos NÃO consome uma busca nova (não gasta o limite mensal).
//
// Itens (dos dois, histórico e favoritos) expiram sozinhos depois de 5 dias, a menos
// que a pessoa volte lá antes disso — nesse caso, ela pode apagar manualmente também.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { obterSessaoSalva } from "./authApi";

const MAX_HISTORICO = 20;
const DIAS_EXPIRACAO = 5;
const MS_EXPIRACAO = DIAS_EXPIRACAO * 24 * 60 * 60 * 1000;

async function chaveDoUsuario(prefixo) {
  const sessao = await obterSessaoSalva();
  const uid = sessao?.uid || "anonimo";
  return `${prefixo}:${uid}`;
}

async function lerLista(prefixo) {
  const chave = await chaveDoUsuario(prefixo);
  const bruto = await AsyncStorage.getItem(chave);
  const lista = bruto ? JSON.parse(bruto) : [];

  // Remove sozinho qualquer item com mais de 5 dias, e já salva a lista limpa de volta
  const agora = Date.now();
  const listaValida = lista.filter((item) => agora - item.timestamp < MS_EXPIRACAO);
  if (listaValida.length !== lista.length) {
    await salvarLista(prefixo, listaValida);
  }
  return listaValida;
}

async function salvarLista(prefixo, lista) {
  const chave = await chaveDoUsuario(prefixo);
  await AsyncStorage.setItem(chave, JSON.stringify(lista));
}

function idDoItem(contexto) {
  return `${contexto.cidade}|${contexto.pais}`.toLowerCase();
}

// ---------- HISTÓRICO ----------

export async function salvarNoHistorico(contexto, dados) {
  const lista = await lerLista("historico");
  const id = idDoItem(contexto);
  const semODuplicado = lista.filter((item) => idDoItem(item.contexto) !== id);
  const novaLista = [{ id, contexto, dados, timestamp: Date.now() }, ...semODuplicado].slice(0, 
MAX_HISTORICO);
  await salvarLista("historico", novaLista);
}

export async function obterHistorico() {
  return lerLista("historico");
}

export async function removerDoHistorico(id) {
  const lista = await lerLista("historico");
  await salvarLista("historico", lista.filter((item) => item.id !== id));
}

// ---------- FAVORITOS ----------

export async function obterFavoritos() {
  return lerLista("favoritos");
}

export async function ehFavorito(contexto) {
  const lista = await obterFavoritos();
  const id = idDoItem(contexto);
  return lista.some((item) => item.id === id);
}

export async function alternarFavorito(contexto, dados) {
  const lista = await obterFavoritos();
  const id = idDoItem(contexto);
  const jaEsta = lista.some((item) => item.id === id);

  const novaLista = jaEsta
    ? lista.filter((item) => item.id !== id)
    : [{ id, contexto, dados, timestamp: Date.now() }, ...lista];

  await salvarLista("favoritos", novaLista);
  return !jaEsta;
}

export async function removerFavorito(id) {
  const lista = await obterFavoritos();
  await salvarLista("favoritos", lista.filter((item) => item.id !== id));
}
