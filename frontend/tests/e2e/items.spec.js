import { expect, test } from "@playwright/test";

function uniqueName(prefix) {
  return `${prefix} ${Date.now()}`;
}

async function addItem(page, name) {
  await page.getByLabel("Nome").fill(name);
  await page.getByRole("button", { name: "Adicionar" }).click();
}

test("cadastra um item e ele persiste após recarregar a página", async ({
  page,
}) => {
  const name = uniqueName("Notebook");
  await page.goto("/");
  await addItem(page, name);

  const item = page.getByRole("listitem").filter({ hasText: name });
  await expect(item).toBeVisible();

  await page.reload();
  await expect(item).toBeVisible(); // veio do PostgreSQL
});

test("mostra erro ao cadastrar um nome repetido", async ({ page }) => {
  const name = uniqueName("Mouse");
  await page.goto("/");
  await addItem(page, name);
  await expect(
    page.getByRole("listitem").filter({ hasText: name }),
  ).toBeVisible();

  await addItem(page, name);

  await expect(page.getByRole("alert")).toHaveText(
    "Já existe um item com esse nome",
  );
  await expect(page.getByLabel("Nome")).toHaveValue(name);
});

test("mostra erro ao tentar cadastrar com nome vazio", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByRole("alert")).toHaveText("O nome é obrigatório.");
});
