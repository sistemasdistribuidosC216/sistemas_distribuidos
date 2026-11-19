import { useState } from "react";
import { ROOM_KINDS, validateRoom } from "../validation";
import { Field, inputClass } from "./Field";

const EMPTY_ROOM = { name: "", kind: "sala", capacity: "", location: "" };

export function RoomForm({ room, onSubmit, onCancel }) {
  const [values, setValues] = useState(
    room ? { ...room, capacity: String(room.capacity) } : EMPTY_ROOM,
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  function change(field) {
    return (event) => setValues({ ...values, [field]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    const result = validateRoom(values);
    setErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;

    setSaving(true);
    try {
      await onSubmit(result.values);
      if (!room) setValues(EMPTY_ROOM);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={room ? "Editar sala" : "Nova sala"}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold">
        {room ? `Editar ${room.name}` : "Nova sala"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="room-name" label="Nome" error={errors.name}>
          <input
            id="room-name"
            value={values.name}
            onChange={change("name")}
            aria-invalid={errors.name ? "true" : "false"}
            className={inputClass}
          />
        </Field>
        <Field id="room-kind" label="Tipo" error={errors.kind}>
          <select
            id="room-kind"
            value={values.kind}
            onChange={change("kind")}
            className={inputClass}
          >
            {Object.entries(ROOM_KINDS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="room-capacity" label="Capacidade" error={errors.capacity}>
          <input
            id="room-capacity"
            type="number"
            min="1"
            max="500"
            value={values.capacity}
            onChange={change("capacity")}
            aria-invalid={errors.capacity ? "true" : "false"}
            className={inputClass}
          />
        </Field>
        <Field id="room-location" label="Localização" error={errors.location}>
          <input
            id="room-location"
            value={values.location}
            onChange={change("location")}
            aria-invalid={errors.location ? "true" : "false"}
            className={inputClass}
          />
        </Field>
      </div>
      {submitError && (
        <p role="alert" className="text-sm text-red-700">
          {submitError}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving
            ? "Salvando..."
            : room
              ? "Salvar alterações"
              : "Cadastrar sala"}
        </button>
        {room && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
