import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemList } from "../../src/components/ItemList";

describe("ItemList", () => {
  it("mostra mensagem quando não há itens", () => {
    render(<ItemList items={[]} />);
    expect(screen.getByText("Nenhum item cadastrado.")).toBeInTheDocument();
  });

  it("renderiza um listitem para cada item", () => {
    const items = [
      { id: "1", name: "Notebook", description: "14 polegadas" },
      { id: "2", name: "Mouse", description: "" },
    ];
    render(<ItemList items={items} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Notebook")).toBeInTheDocument();
    expect(screen.getByText("14 polegadas")).toBeInTheDocument();
    expect(screen.getByText("Mouse")).toBeInTheDocument();
  });
});
