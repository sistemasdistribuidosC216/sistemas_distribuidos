import { vi } from "vitest";

export function jsonResponse(data, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function mockFetch(...responses) {
  const fetchMock = vi.fn();
  for (const response of responses) {
    fetchMock.mockResolvedValueOnce(response);
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export const LAB = {
  id: 1,
  name: "Lab Redes",
  kind: "laboratorio",
  capacity: 30,
  location: "Bloco A",
};

export const SALA = {
  id: 2,
  name: "Sala 101",
  kind: "sala",
  capacity: 40,
  location: "Bloco B",
};
