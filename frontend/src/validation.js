import { combineDateTime } from "./dates";

export const ROOM_KINDS = {
  sala: "Sala de aula",
  laboratorio: "Laboratório",
};

export function validateRoom({ name, kind, capacity, location }) {
  const errors = {};
  const values = {
    name: name.trim(),
    kind,
    capacity: Number(capacity),
    location: location.trim(),
  };

  if (!values.name) errors.name = "O nome é obrigatório.";
  else if (values.name.length > 100)
    errors.name = "O nome deve ter no máximo 100 caracteres.";

  if (!ROOM_KINDS[values.kind]) errors.kind = "Escolha o tipo.";

  if (!Number.isInteger(values.capacity) || values.capacity < 1) {
    errors.capacity = "A capacidade deve ser um número inteiro maior que zero.";
  } else if (values.capacity > 500) {
    errors.capacity = "A capacidade máxima é 500.";
  }

  if (!values.location) errors.location = "A localização é obrigatória.";

  return { errors, values };
}

export function validateReservation(form, rooms, now = new Date()) {
  const errors = {};
  const room = rooms.find((item) => String(item.id) === String(form.roomId));
  const attendees = Number(form.attendees);
  const start =
    form.day && form.start ? combineDateTime(form.day, form.start) : null;
  const end = form.day && form.end ? combineDateTime(form.day, form.end) : null;

  if (!room) errors.roomId = "Escolha a sala.";
  if (!form.requesterName.trim())
    errors.requesterName = "Informe o responsável.";
  if (!form.purpose.trim()) errors.purpose = "Informe a finalidade.";

  if (!Number.isInteger(attendees) || attendees < 1) {
    errors.attendees = "Informe um número de participantes maior que zero.";
  } else if (room && attendees > room.capacity) {
    errors.attendees = `A sala comporta no máximo ${room.capacity} pessoas.`;
  }

  if (!start || !end) {
    errors.period = "Informe a data e os horários.";
  } else if (end <= start) {
    errors.period = "O horário de término deve ser depois do início.";
  } else if (start < now) {
    errors.period = "Não é possível reservar um horário no passado.";
  }

  return {
    errors,
    values: {
      room_id: Number(form.roomId),
      requester_name: form.requesterName.trim(),
      purpose: form.purpose.trim(),
      attendees,
      start_at: start?.toISOString(),
      end_at: end?.toISOString(),
    },
  };
}
