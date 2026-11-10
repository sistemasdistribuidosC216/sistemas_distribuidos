import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RoomsPage } from "../../src/pages/RoomsPage";
import { jsonResponse, LAB, mockFetch, SALA } from "../helpers";

async function fillRoomForm(user) {
  await user.type(screen.getByLabelText("Nome"), "Sala 101");
  await user.selectOptions(screen.getByLabelText("Tipo"), "sala");
  await user.type(screen.getByLabelText("Capacidade"), "40");
  await user.type(screen.getByLabelText("Localização"), "Bloco B");
  await user.click(screen.getByRole("button", { name: "Cadastrar sala" }));
}

describe("RoomsPage", () => {
  it("mostra carregando e depois as salas da API", async () => {
    mockFetch(jsonResponse([LAB]));
    render(<RoomsPage />);

    expect(screen.getByText("Carregando salas...")).toBeInTheDocument();
    expect(await screen.findByText("Lab Redes")).toBeInTheDocument();
  });

  it("mostra erro quando a API está fora do ar", async () => {
    mockFetch(Promise.reject(new TypeError("falhou")));
    render(<RoomsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível conectar à API.",
    );
  });

  it("cadastra uma sala e recarrega a lista", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(
      jsonResponse([]),
      jsonResponse(SALA, 201),
      jsonResponse([SALA]),
    );
    render(<RoomsPage />);
    await screen.findByText("Nenhuma sala cadastrada.");

    await fillRoomForm(user);

    expect(await screen.findByRole("status")).toHaveTextContent(
      'Sala "Sala 101" cadastrada.',
    );
    expect(screen.getByText("Sala 101")).toBeInTheDocument();
    const [, options] = fetchMock.mock.calls[1];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      name: "Sala 101",
      kind: "sala",
      capacity: 40,
      location: "Bloco B",
    });
  });

  it("mostra o erro 409 e mantém o que foi digitado", async () => {
    const user = userEvent.setup();
    mockFetch(
      jsonResponse([]),
      jsonResponse({ detail: "Já existe uma sala com esse nome" }, 409),
    );
    render(<RoomsPage />);
    await screen.findByText("Nenhuma sala cadastrada.");

    await fillRoomForm(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Já existe uma sala com esse nome",
    );
    expect(screen.getByLabelText("Nome")).toHaveValue("Sala 101");
  });

  it("não chama a API com o formulário vazio", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(jsonResponse([]));
    render(<RoomsPage />);
    await screen.findByText("Nenhuma sala cadastrada.");

    await user.click(screen.getByRole("button", { name: "Cadastrar sala" }));

    expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
