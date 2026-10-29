import { describe, expect, it } from "vitest";
import { NAME_MAX_LENGTH, validateItem } from "../../src/validation";

describe("validateItem", () => {
  it("rejeita nome vazio ou só com espaços", () => {
    const { errors } = validateItem({ name: "   ", description: "" });
    expect(errors.name).toBe("O nome é obrigatório.");
  });

  it("rejeita nome com mais de 100 caracteres", () => {
    const { errors } = validateItem({
      name: "a".repeat(NAME_MAX_LENGTH + 1),
      description: "",
    });
    expect(errors.name).toBe("O nome deve ter no máximo 100 caracteres.");
  });

  it("aceita nome com exatamente 100 caracteres", () => {
    const { errors } = validateItem({
      name: "a".repeat(NAME_MAX_LENGTH),
      description: "",
    });
    expect(errors).toEqual({});
  });

  it("remove espaços extras de nome e descrição", () => {
    const { errors, values } = validateItem({
      name: "  Notebook  ",
      description: "  14 polegadas ",
    });
    expect(errors).toEqual({});
    expect(values).toEqual({ name: "Notebook", description: "14 polegadas" });
  });
});
