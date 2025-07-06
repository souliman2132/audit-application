import { useState } from "react";

export default function AjoutObjectif({ onAdd }) {
  const [cat, setCat] = useState("");
  const [urgency, setUrgency] = useState(3);
  const [deadline, setDeadline] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!cat.trim()) return;
    onAdd({
      cat,
      urgency,
      deadline: deadline || null,
      subtasks: []
    });
    setCat("");
    setUrgency(3);
    setDeadline("");
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: "flex", gap: 10, marginBottom: 24, background: "#eaf2fc",
      borderRadius: 8, padding: 12, alignItems: "center"
    }}>
      <input value={cat} onChange={e => setCat(e.target.value)} placeholder="Nom de l'objectif" style={{ flex: 2, padding: 8 }} required />
      <select value={urgency} onChange={e => setUrgency(Number(e.target.value))} style={{ width: 110, padding: 8 }}>
        <option value={1}>Faible</option>
        <option value={2}>Modérée</option>
        <option value={3}>Normale</option>
        <option value={4}>Haute</option>
        <option value={5}>Critique</option>
      </select>
      <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: 160, padding: 8 }} placeholder="Deadline (optionnel)" />
      <button type="submit" style={{
        fontWeight: "bold", background: "#2186eb", color: "#fff", border: "none",
        padding: "0 16px", borderRadius: 6, cursor: "pointer"
      }}>
        + Ajouter
      </button>
    </form>
  );
}
