import { useCallback, useEffect, useState } from "react";
import { ReservationForm } from "../components/ReservationForm";
import { ReservationList } from "../components/ReservationList";
import {
  createReservation,
  deleteReservation,
  listReservations,
  updateReservation,
} from "../services/reservations";
import { listRooms } from "../services/rooms";

export function ReservationsPage() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState({ roomId: "", day: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [roomList, reservationList] = await Promise.all([
        listRooms(),
        listReservations(filters),
      ]);
      setRooms(roomList);
      setReservations(reservationList);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  function changeFilter(field) {
    return (event) => setFilters({ ...filters, [field]: event.target.value });
  }

  async function handleCreate(values) {
    await createReservation(values);
    setMessage("Reserva cadastrada.");
    await loadReservations();
  }

  async function handleUpdate(values) {
    await updateReservation(editing.id, values);
    setMessage("Reserva atualizada.");
    setEditing(null);
    await loadReservations();
  }

  async function handleDelete(reservation) {
    setMessage("");
    try {
      await deleteReservation(reservation.id);
      setMessage("Reserva cancelada.");
      await loadReservations();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  let form = null;
  if (editing) {
    form = (
      <ReservationForm
        key={editing.id}
        rooms={rooms}
        reservation={editing}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(null)}
      />
    );
  } else if (rooms.length > 0) {
    form = <ReservationForm rooms={rooms} onSubmit={handleCreate} />;
  } else if (!loading && !error) {
    form = (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        Cadastre uma sala antes de fazer reservas.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {form}

      <section aria-labelledby="reservations-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="reservations-heading" className="text-xl font-semibold">
            Reservas
          </h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2">
              Sala
              <select
                value={filters.roomId}
                onChange={changeFilter("roomId")}
                className="rounded border border-slate-300 bg-white p-1"
              >
                <option value="">Todas</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              Dia
              <input
                type="date"
                value={filters.day}
                onChange={changeFilter("day")}
                className="rounded border border-slate-300 bg-white p-1"
              />
            </label>
          </div>
        </div>
        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-slate-500">Carregando reservas...</p>
        ) : (
          <ReservationList
            reservations={reservations}
            onEdit={(reservation) => {
              setMessage("");
              setEditing(reservation);
            }}
            onDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
}
