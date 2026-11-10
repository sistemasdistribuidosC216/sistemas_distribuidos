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
