import { expect, test } from "@playwright/test";

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

async function createRoom(page, name) {
  const form = page.getByRole("form", { name: "Nova sala" });
  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Tipo").selectOption("laboratorio");
  await form.getByLabel("Capacidade").fill("20");
  await form.getByLabel("Localização").fill("Bloco E2E");
  await form.getByRole("button", { name: "Cadastrar sala" }).click();
  await expect(page.getByRole("status")).toHaveText(
    `Sala "${name}" cadastrada.`,
  );
}

async function reserve(page, roomName, start, end) {
  const form = page.getByRole("form", { name: "Nova reserva" });
  await form
    .getByLabel("Sala")
    .selectOption({ label: `${roomName} (20 lugares)` });
  await form.getByLabel("Responsável").fill("Maria");
  await form.getByLabel("Finalidade").fill("Aula de Redes");
  await form.getByLabel("Participantes").fill("15");
  await form.getByLabel("Data").fill(tomorrow());
  await form.getByLabel("Início").fill(start);
  await form.getByLabel("Término").fill(end);
  await form.getByRole("button", { name: "Reservar" }).click();
}

test("cadastra sala e reserva, e os dados persistem após recarregar", async ({
  page,
}) => {
  const roomName = `Lab E2E ${Date.now()}`;
  await page.goto("/");
  await createRoom(page, roomName);

  await page.getByRole("button", { name: "Reservas" }).click();
  await reserve(page, roomName, "10:00", "11:00");
  await expect(page.getByRole("status")).toHaveText("Reserva cadastrada.");

  const reservation = page.getByRole("listitem").filter({ hasText: roomName });
  await expect(reservation).toContainText("10:00–11:00");

  await page.reload();
  await page.getByRole("button", { name: "Reservas" }).click();
  await expect(reservation).toContainText("10:00–11:00"); // veio do PostgreSQL
});

test("bloqueia reserva com conflito de horário", async ({ page }) => {
  const roomName = `Lab Conflito ${Date.now()}`;
  await page.goto("/");
  await createRoom(page, roomName);

  await page.getByRole("button", { name: "Reservas" }).click();
  await reserve(page, roomName, "14:00", "16:00");
  await expect(page.getByRole("status")).toHaveText("Reserva cadastrada.");

  await reserve(page, roomName, "15:00", "17:00");
  await expect(page.getByRole("alert")).toHaveText(
    "A sala já está reservada nesse horário",
  );
});
