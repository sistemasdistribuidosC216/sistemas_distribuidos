export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function errorMessage(body, fallback) {
  if (typeof body?.detail === "string") return body.detail;
  if (Array.isArray(body?.detail) && body.detail.length > 0) {
    return "Dados inválidos. Confira os campos e tente novamente.";
  }
  return fallback;
}

export async function request(
  path,
  options = {},
  fallback = "Erro inesperado.",
) {
  const { body, ...rest } = options;
  const init = { ...rest };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error("Não foi possível conectar à API.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(errorMessage(data, fallback));
  }

  if (response.status === 204) return null;
  return response.json();
}
