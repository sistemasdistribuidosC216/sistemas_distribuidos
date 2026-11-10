import { useState } from "react";
import { toLocalDateInput, toLocalTimeInput } from "../dates";
import { validateReservation } from "../validation";
import { Field, inputClass } from "./Field";

function emptyForm(rooms) {
  return {
    roomId: rooms[0] ? String(rooms[0].id) : "",
    requesterName: "",
    purpose: "",
    attendees: "",
    day: toLocalDateInput(new Date()),
    start: "",
    end: "",
  };
}

function formFromReservation(reservation) {
  const start = new Date(reservation.start_at);
  const end = new Date(reservation.end_at);
  return {
    roomId: String(reservation.room_id),
    requesterName: reservation.requester_name,
    purpose: reservation.purpose,
    attendees: String(reservation.attendees),
    day: toLocalDateInput(start),
    start: toLocalTimeInput(start),
    end: toLocalTimeInput(end),
  };
}

export function ReservationForm({ rooms, reservation, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    reservation ? formFromReservation(reservation) : emptyForm(rooms),
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  function change(field) {
    return (event) => setForm({ ...form, [field]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    const result = validateReservation(form, rooms);
    setErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;

    setSaving(true);
    try {
      await onSubmit(result.values);
      if (!reservation) setForm({ ...emptyForm(rooms), roomId: form.roomId });
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
      aria-label={reservation ? "Editar reserva" : "Nova reserva"}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold">
        {reservation ? "Editar reserva" : "Nova reserva"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="reservation-room" label="Sala" error={errors.roomId}>
          <select
            id="reservation-room"
            value={form.roomId}
            onChange={change("roomId")}
            className={inputClass}
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} ({room.capacity} lugares)
              </option>
            ))}
          </select>
        </Field>
        <Field
          id="reservation-requester"
          label="Responsável"
          error={errors.requesterName}
        >
          <input
            id="reservation-requester"
            value={form.requesterName}
            onChange={change("requesterName")}
            className={inputClass}
          />
        </Field>
        <Field
          id="reservation-purpose"
          label="Finalidade"
          error={errors.purpose}
        >
          <input
            id="reservation-purpose"
            value={form.purpose}
            onChange={change("purpose")}
            className={inputClass}
          />
        </Field>
        <Field
          id="reservation-attendees"
          label="Participantes"
          error={errors.attendees}
        >
          <input
            id="reservation-attendees"
            type="number"
            min="1"
            value={form.attendees}
            onChange={change("attendees")}
            className={inputClass}
          />
        </Field>
        <Field id="reservation-day" label="Data">
          <input
            id="reservation-day"
            type="date"
            value={form.day}
            onChange={change("day")}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field id="reservation-start" label="Início">
            <input
              id="reservation-start"
              type="time"
              value={form.start}
              onChange={change("start")}
              className={inputClass}
            />
          </Field>
          <Field id="reservation-end" label="Término">
            <input
              id="reservation-end"
              type="time"
              value={form.end}
              onChange={change("end")}
              className={inputClass}
            />
          </Field>
        </div>
      </div>
      {errors.period && (
        <p role="alert" className="text-sm text-red-700">
          {errors.period}
        </p>
      )}
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
            : reservation
              ? "Salvar alterações"
              : "Reservar"}
        </button>
        {reservation && (
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
