"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: number;
  name: string;
  email: string;
  monthlyFee?: number;
  status?: string;
};

type Artikel = {
  id: number;
  nummer: string;
  bezeichnung: string;
  preis: number;
  kachel: boolean;
};

type CartLine = { id: number; bezeichnung: string; preis: number; qty: number };

export default function KassePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [artikel, setArtikel] = useState<Artikel[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then(setMembers)
      .catch(console.error);

    fetch("/api/artikel")
      .then((res) => res.json())
      .then(setArtikel)
      .catch(console.error);
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.name.toLowerCase().includes(memberQuery.toLowerCase())
    );
  }, [members, memberQuery]);

  function addToCart(a: Artikel) {
    setCart((prev) => {
      const existing = prev.find((line) => line.id === a.id);
      if (existing) {
        return prev.map((line) =>
          line.id === a.id ? { ...line, qty: line.qty + 1 } : line
        );
      }
      return [...prev, { id: a.id, bezeichnung: a.bezeichnung, preis: a.preis, qty: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((line) => line.id !== id));
  }

  const total = useMemo(
    () => cart.reduce((sum, line) => sum + line.preis * line.qty, 0),
    [cart]
  );

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Kasse</h1>

      <section>
        <input
          value={memberQuery}
          onChange={(e) => setMemberQuery(e.target.value)}
          placeholder="Mitglied suchen..."
          className="border px-3 py-1 rounded w-64"
        />
        <button
          onClick={() => setShowMemberModal(true)}
          className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
        >
          Mitglieder anzeigen
        </button>

        {showMemberModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md w-96">
              <h2 className="text-xl mb-4">Mitglieder</h2>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {filteredMembers.map((m) => (
                  <li
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setShowMemberModal(false);
                    }}
                    className="p-2 border rounded hover:bg-gray-100 cursor-pointer"
                  >
                    {m.name}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowMemberModal(false)}
                className="mt-4 bg-gray-300 px-3 py-1 rounded"
              >
                Schließen
              </button>
            </div>
          </div>
        )}

        {selectedMember && (
          <div className="mt-4 p-3 border rounded">
            <strong>Mitglied:</strong> {selectedMember.name}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Artikel</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {artikel
            .filter((a) => a.kachel)
            .map((a) => (
              <button
                key={a.id}
                onClick={() => addToCart(a)}
                className="p-4 border rounded shadow hover:bg-gray-100"
              >
                <div className="font-semibold">{a.bezeichnung}</div>
                <div>{a.preis.toFixed(2)} €</div>
              </button>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Warenkorb</h2>
        {cart.length === 0 ? (
          <p>Keine Artikel im Warenkorb.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Artikel</th>
                <th className="p-2">Menge</th>
                <th className="p-2">Preis</th>
                <th className="p-2">Gesamt</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((line) => (
                <tr key={line.id} className="border-t">
                  <td className="p-2">{line.bezeichnung}</td>
                  <td className="p-2 text-center">{line.qty}</td>
                  <td className="p-2 text-right">{line.preis.toFixed(2)} €</td>
                  <td className="p-2 text-right">
                    {(line.preis * line.qty).toFixed(2)} €
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => removeFromCart(line.id)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td colSpan={3} className="p-2 text-right">
                  Gesamt:
                </td>
                <td className="p-2 text-right">{total.toFixed(2)} €</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>
    </main>
  );
}
