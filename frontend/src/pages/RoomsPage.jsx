import { useCallback, useEffect, useState } from "react";
import { RoomForm } from "../components/RoomForm";
import { RoomList } from "../components/RoomList";
import {
  createRoom,
  deleteRoom,
  listRooms,
  updateRoom,
} from "../services/rooms";
import { ROOM_KINDS } from "../validation";

export function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [kind, setKind] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRooms(await listRooms(kind));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  async function handleCreate(values) {
    await createRoom(values);
    setMessage(`Sala "${values.name}" cadastrada.`);
    await loadRooms();
  }

  async function handleUpdate(values) {
    await updateRoom(editing.id, values);
    setMessage(`Sala "${values.name}" atualizada.`);
    setEditing(null);
    await loadRooms();
  }

  async function handleDelete(room) {
    setMessage("");
    try {
      await deleteRoom(room.id);
      setMessage(`Sala "${room.name}" excluída.`);
      await loadRooms();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <div className="space-y-6">
      {editing ? (
        <RoomForm
          key={editing.id}
          room={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <RoomForm onSubmit={handleCreate} />
      )}

      <section aria-labelledby="rooms-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="rooms-heading" className="text-xl font-semibold">
            Salas cadastradas
          </h2>
          <label className="flex items-center gap-2 text-sm">
            Exibir
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value)}
              className="rounded border border-slate-300 bg-white p-1"
            >
              <option value="">Todos</option>
              {Object.entries(ROOM_KINDS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
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
          <p className="text-slate-500">Carregando salas...</p>
        ) : (
          <RoomList
            rooms={rooms}
            onEdit={(room) => {
              setMessage("");
              setEditing(room);
            }}
            onDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
}
