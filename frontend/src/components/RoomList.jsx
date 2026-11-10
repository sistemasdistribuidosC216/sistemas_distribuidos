import { useState } from "react";
import { ROOM_KINDS } from "../validation";

export function RoomList({ rooms, onEdit, onDelete }) {
  const [confirmingId, setConfirmingId] = useState(null);

  if (rooms.length === 0) {
    return <p className="text-slate-500">Nenhuma sala cadastrada.</p>;
  }

  return (
    <ul className="space-y-2">
      {rooms.map((room) => (
        <li
          key={room.id}
          className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">{room.name}</p>
            <p className="text-sm text-slate-600">
              {ROOM_KINDS[room.kind]} · {room.capacity} lugares ·{" "}
              {room.location}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(room)}
              className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
            >
              Editar
            </button>
            {confirmingId === room.id ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmingId(null);
                  onDelete(room);
                }}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Confirmar exclusão
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingId(room.id)}
                className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
              >
                Excluir
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
