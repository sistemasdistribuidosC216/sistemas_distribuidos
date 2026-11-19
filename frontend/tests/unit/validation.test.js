import { describe, expect, it } from "vitest";
import { validateReservation, validateRoom } from "../../src/validation";

const ROOMS = [{ id: 1, name: "Lab", capacity: 10 }];
const NOW = new Date(2026, 10, 10, 12, 0);

function reservationForm(changes = {}) {
  return {
    roomId: "1",
    requesterName: "Maria",
    purpose: "Aula",
    attendees: "5",
    day: "2026-11-20",
    start: "10:00",
    end: "12:00",
    ...changes,
  };
}

describe("validateRoom", () => {
  it("aceita uma sala válida e converte a capacidade", () => {
    const result = validateRoom({
      name: " Lab ",
      kind: "laboratorio",
      capacity: "30",
      location: "Bloco A",
    });
    expect(result.errors).toEqual({});
    expect(result.values).toEqual({
      name: "Lab",
      kind: "laboratorio",
      capacity: 30,
      location: "Bloco A",
    });
  });

  it("aponta campos obrigatórios e capacidade inválida", () => {
    const { errors } = validateRoom({
      name: "  ",
      kind: "sala",
      capacity: "0",
      location: "",
    });
    expect(errors.name).toBe("O nome é obrigatório.");
    expect(errors.capacity).toMatch(/maior que zero/);
    expect(errors.location).toBe("A localização é obrigatória.");
  });
});

describe("validateReservation", () => {
  it("monta o JSON da API com datas em ISO", () => {
    const { errors, values } = validateReservation(
      reservationForm(),
      ROOMS,
      NOW,
    );
    expect(errors).toEqual({});
    expect(values.room_id).toBe(1);
    expect(values.attendees).toBe(5);
    expect(new Date(values.start_at)).toEqual(new Date(2026, 10, 20, 10, 0));
  });

  it("recusa término antes do início", () => {
    const { errors } = validateReservation(
      reservationForm({ end: "09:00" }),
      ROOMS,
      NOW,
    );
    expect(errors.period).toBe(
      "O horário de término deve ser depois do início.",
    );
  });

  it("recusa horário no passado", () => {
    const { errors } = validateReservation(
      reservationForm({ day: "2026-11-01" }),
      ROOMS,
      NOW,
    );
    expect(errors.period).toBe(
      "Não é possível reservar um horário no passado.",
    );
  });

  it("recusa participantes acima da capacidade", () => {
    const { errors } = validateReservation(
      reservationForm({ attendees: "11" }),
      ROOMS,
      NOW,
    );
    expect(errors.attendees).toBe("A sala comporta no máximo 10 pessoas.");
  });
});
