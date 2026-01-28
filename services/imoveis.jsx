import { api } from "../lib/api";

const resource = "/imoveis";

export async function listarImoveis(params = {}) {
  const { q, page = 1, limit = 10 } = params;
  const search = q ? `q=${encodeURIComponent(q)}` : "";
  const _page = `_page=${page}`;
  const _limit = `_limit=${limit}`;
  const query = [search, _page, _limit].filter(Boolean).join("&");

  const resp = await api.get(`${resource}${query ? `?${query}` : ""}`);
  const total = Number(resp.headers["x-total-count"] || resp.data.length || 0);
  return { data: resp.data || [], total };
}

export async function obterImovel(id) {
  const resp = await api.get(`${resource}/${id}`);
  return resp.data;
}

export async function criarImovel(payload) {
  const now = new Date().toISOString();
  const resp = await api.post(resource, {
    ...payload,
    createdAt: now,
    updatedAt: now,
  });
  return resp.data;
}

export async function atualizarImovel(id, payload) {
  const now = new Date().toISOString();
  const resp = await api.patch(`${resource}/${id}`, {
    ...payload,
    updatedAt: now,
  });
  return resp.data;
}

export async function excluirImovel(id) {
  await api.delete(`${resource}/${id}`);
}

/** Auxiliares (via routes.json) */
export async function listarTipos() {
  const resp = await api.get("/tipos");
  return resp.data || [];
}

export async function listarOpcionais() {
  const resp = await api.get("/opcionais");
  return resp.data || [];
}

export async function listarOpcionaisDoImovel(imovelId) {
  const resp = await api.get(`/imovelOpcionais?imovelId=${imovelId}`);
  return resp.data || [];
}

export async function criarOpcionalDoImovel({ imovelId, opcionalId }) {
  const resp = await api.post("/imovelOpcionais", { imovelId, opcionalId });
  return resp.data;
}

export async function excluirOpcionalDoImovel(vinculoId) {
  await api.delete(`/imovelOpcionais/${vinculoId}`);
}
