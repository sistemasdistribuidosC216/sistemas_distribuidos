import { request } from "./api";

export function listRooms(kind) {
  const query = kind ? `?kind=${kind}` : "";
  return request(`/rooms/${query}`, {}, "Erro ao carregar as salas.");
}

export function createRoom(room) {
  return request(
    "/rooms/",
    { method: "POST", body: room },
    "Erro ao cadastrar a sala.",
  );
}

export function updateRoom(id, room) {
  return request(
    `/rooms/${id}`,
    { method: "PUT", body: room },
    "Erro ao atualizar a sala.",
  );
}

export function deleteRoom(id) {
  return request(
    `/rooms/${id}`,
    { method: "DELETE" },
    "Erro ao excluir a sala.",
  );
}
