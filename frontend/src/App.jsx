import { useState } from "react";
import { ReservationsPage } from "./pages/ReservationsPage";
import { RoomsPage } from "./pages/RoomsPage";

const TABS = {
  rooms: "Salas",
  reservations: "Reservas",
};

export default function App() {
  const [tab, setTab] = useState("rooms");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <h1 className="text-2xl font-bold">
            Reserva de Salas e Laboratórios
          </h1>
          <nav aria-label="Seções" className="flex gap-2">
            {Object.entries(TABS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-current={tab === key ? "page" : undefined}
                className={`rounded px-3 py-1 font-medium ${
                  tab === key
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === "rooms" ? <RoomsPage /> : <ReservationsPage />}
      </main>
    </div>
  );
}
