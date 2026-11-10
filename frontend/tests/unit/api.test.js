import { describe, expect, it, vi } from "vitest";
import { API_URL, request } from "../../src/services/api";
import { jsonResponse, mockFetch } from "../helpers";

describe("request", () => {
  it("envia JSON e devolve a resposta", async () => {
    const fetchMock = mockFetch(jsonResponse({ id: 1 }, 201));

    await expect(
      request("/rooms/", { method: "POST", body: { name: "Lab" } }),
    ).resolves.toEqual({ id: 1 });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/rooms/`);
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(options.body)).toEqual({ name: "Lab" });
  });

  it("usa o detail da API nos erros", async () => {
    mockFetch(
      jsonResponse({ detail: "Já existe uma sala com esse nome" }, 409),
    );
    await expect(request("/rooms/")).rejects.toThrow(
      "Já existe uma sala com esse nome",
    );
  });

  it("devolve null em respostas 204", async () => {
    mockFetch(jsonResponse(null, 204));
    await expect(request("/rooms/1", { method: "DELETE" })).resolves.toBeNull();
  });

  it("avisa quando a API está fora do ar", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("falhou")));
    await expect(request("/rooms/")).rejects.toThrow(
      "Não foi possível conectar à API.",
    );
  });
});
