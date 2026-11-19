import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ReservationsPage } from "../../src/pages/ReservationsPage";
import { jsonResponse, LAB, mockFetch } from "../helpers";

const RESERVATION = {
  id: 7,
  room_id: 1,
  requester_name: "Maria",
  purpose: "Aula de Redes",
  attendees: 20,
  start_at: "2099-11-20T13:00:00Z",
  end_at: "2099-11-20T15:00:00Z",
  room: { id: 1, name: "Lab Redes" },
};

async function fillReservation(user, attendees = "10") {
  await user.type(screen.getByLabelText("Responsável"), "Joao");
  await user.type(screen.getByLabelText("Finalidade"), "Monitoria");
  await user.type(screen.getByLabelText("Participantes"), attendees);
  await user.clear(screen.getByLabelText("Data"));
  await user.type(screen.getByLabelText("Data"), "2099-11-20");
  await user.type(screen.getByLabelText("Início"), "10:00");
  await user.type(screen.getByLabelText("Término"), "12:00");
  await user.click(screen.getByRole("button", { name: "Reservar" }));
}

describe("ReservationsPage", () => {
  it("pede para cadastrar uma sala quando não há salas", async () => {
    mockFetch(jsonResponse([]), jsonResponse([]));
    render(<ReservationsPage />);

    expect(
      await screen.findByText("Cadastre uma sala antes de fazer reservas."),
    ).toBeInTheDocument();
  });

  it("lista as reservas com o nome da sala", async () => {
    mockFetch(jsonResponse([LAB]), jsonResponse([RESERVATION]));
    render(<ReservationsPage />);

    expect(await screen.findByText(/Aula de Redes/)).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("Lab Redes");
  });

  it("mostra o conflito de horário vindo da API", async () => {
    const user = userEvent.setup();
    mockFetch(
      jsonResponse([LAB]),
      jsonResponse([]),
      jsonResponse({ detail: "A sala já está reservada nesse horário" }, 409),
    );
    render(<ReservationsPage />);
    await screen.findByText("Nenhuma reserva encontrada.");

    await fillReservation(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A sala já está reservada nesse horário",
    );
  });

  it("bloqueia participantes acima da capacidade sem chamar a API", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(jsonResponse([LAB]), jsonResponse([]));
    render(<ReservationsPage />);
    await screen.findByText("Nenhuma reserva encontrada.");

    await fillReservation(user, "50");

    expect(
      screen.getByText("A sala comporta no máximo 30 pessoas."),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
