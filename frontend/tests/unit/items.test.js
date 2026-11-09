import { afterEach, describe, expect, it, vi } from "vitest";
import { createItem, listItems } from "../../src/services/items";
import { jsonResponse } from "../helpers";

afterEach(() => vi.unstubAllGlobals());

describe("services/items", () => {
  it("listItems retorna os itens da API", async () => {
    const data = [{ id: 1, name: "Notebook", description: null }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(data)));

    await expect(listItems()).resolves.toEqual(data);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/items/",
      undefined,
    );
  });

  it("createItem envia POST com JSON", async () => {
    const created = { id: 1, name: "Notebook", description: null };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(created, 201)),
    );

    await expect(
      createItem({ name: "Notebook", description: "" }),
    ).resolves.toEqual(created);

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      name: "Notebook",
      description: null,
    });
  });

  it("usa o detail da API quando a resposta é um erro", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ detail: "Já existe um item com esse nome" }, 409),
        ),
    );

    await expect(
      createItem({ name: "Notebook", description: "" }),
    ).rejects.toThrow("Já existe um item com esse nome");
  });

  it("avisa quando a API está inacessível", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("failed")));

    await expect(listItems()).rejects.toThrow(
      "Não foi possível conectar à API.",
    );
  });
});
