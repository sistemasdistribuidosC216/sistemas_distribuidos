import { useState } from "react";
import { formatDay, formatTime } from "../dates";

export function ReservationList({ reservations, onEdit, onDelete }) {
  const [confirmingId, setConfirmingId] = useState(null);

  if (reservations.length === 0) {
    return <p className="text-slate-500">Nenhuma reserva encontrada.</p>;
  }

  return (
    <ul className="space-y-2">
      {reservations.map((reservation) => (
        <li
          key={reservation.id}
          className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">
              {reservation.room.name} · {formatDay(reservation.start_at)},{" "}
              {formatTime(reservation.start_at)}–
              {formatTime(reservation.end_at)}
            </p>
            <p className="text-sm text-slate-600">
              {reservation.purpose} · {reservation.requester_name} ·{" "}
              {reservation.attendees} participantes
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(reservation)}
              className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
            >
              Editar
            </button>
            {confirmingId === reservation.id ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmingId(null);
                  onDelete(reservation);
                }}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Confirmar cancelamento
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingId(reservation.id)}
                className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
              >
                Cancelar reserva
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
