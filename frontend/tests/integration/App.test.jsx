import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { jsonResponse } from "../helpers";

function mockFetch(...responses) {
  const fetchMock = vi.fn();
  for (const response of responses) {
    fetchMock.mockResolvedValueOnce(response);
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("App", () => {
  it("mostra carregando e depois a lista vazia", async () => {
    mockFetch(jsonResponse([]));
    render(<App />);

    expect(screen.getByText("Carregando itens...")).toBeInTheDocument();
    expect(
      await screen.findByText("Nenhum item cadastrado."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Carregando itens...")).not.toBeInTheDocument();
  });

  it("exibe os itens vindos da API", async () => {
    mockFetch(jsonResponse([{ id: 1, name: "Mouse", description: null }]));
    render(<App />);

    expect(await screen.findByText("Mouse")).toBeInTheDocument();
  });

  it("mostra erro quando a API está inacessível", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("failed")));
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível conectar à API.",
    );
  });

  it("envia o POST e adiciona o item criado", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(
      jsonResponse([]),
      jsonResponse({ id: 1, name: "Notebook", description: "14" }, 201),
    );
    render(<App />);
    await screen.findByText("Nenhum item cadastrado.");

    await user.type(screen.getByLabelText("Nome"), "Notebook");
    await user.type(screen.getByLabelText("Descrição"), "14");
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByText("Notebook")).toBeInTheDocument();
    const [, options] = fetchMock.mock.calls[1];
    expect(options.method).toBe("POST");
  });

  it("mostra o erro 409 e mantém o nome digitado", async () => {
    const user = userEvent.setup();
    mockFetch(
      jsonResponse([]),
      jsonResponse({ detail: "Já existe um item com esse nome" }, 409),
    );
    render(<App />);
    await screen.findByText("Nenhum item cadastrado.");

    await user.type(screen.getByLabelText("Nome"), "Notebook");
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Já existe um item com esse nome",
    );
    expect(screen.getByLabelText("Nome")).toHaveValue("Notebook");
  });

  it("não chama a API com nome vazio", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(jsonResponse([]));
    render(<App />);
    await screen.findByText("Nenhum item cadastrado.");

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "O nome é obrigatório.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
