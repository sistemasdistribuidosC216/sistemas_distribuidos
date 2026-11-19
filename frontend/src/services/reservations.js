import { request } from "./api";

export function listReservations({ roomId, day } = {}) {
  const params = new URLSearchParams();
  if (roomId) params.set("room_id", roomId);
  if (day) params.set("day", day);
  const query = params.toString() ? `?${params}` : "";
  return request(`/reservations/${query}`, {}, "Erro ao carregar as reservas.");
}

export function createReservation(reservation) {
  return request(
    "/reservations/",
    { method: "POST", body: reservation },
    "Erro ao cadastrar a reserva.",
  );
}

export function updateReservation(id, reservation) {
  return request(
    `/reservations/${id}`,
    { method: "PUT", body: reservation },
    "Erro ao atualizar a reserva.",
  );
}

export function deleteReservation(id) {
  return request(
    `/reservations/${id}`,
    { method: "DELETE" },
    "Erro ao excluir a reserva.",
  );
}
