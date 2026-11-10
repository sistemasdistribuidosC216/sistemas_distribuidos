import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RoomList } from "../../src/components/RoomList";
import { LAB } from "../helpers";

describe("RoomList", () => {
  it("mostra mensagem quando não há salas", () => {
    render(<RoomList rooms={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Nenhuma sala cadastrada.")).toBeInTheDocument();
  });

  it("só exclui depois da confirmação", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<RoomList rooms={[LAB]} onEdit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Confirmar exclusão" }),
    );
    expect(onDelete).toHaveBeenCalledWith(LAB);
  });
});
