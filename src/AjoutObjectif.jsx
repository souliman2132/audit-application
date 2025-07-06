import React, { useState } from "react";

const urgencesTxt = ["faible", "modérée", "normale", "haute", "critique"];

export default function AjoutObjectif({ onAdd }) {
  const [cat, setCat] = useState("");
  const [urgency, setUrgency] = useState(3);
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState("temporaire");

  function handleSubmit(e) {
    e.preventDefault();
    if (!cat.trim()) return;
    onAdd({
      cat,
      urgency,
      deadline: type === "temporaire" ? deadline : "",
      type,
      done: 0,
      subtasks: [],
      routines: [],
    });
    setCat("");
    setUrgency(3);
    setDeadline("");
    setType("temporaire");
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
    >
      <input
        type="text"
        placeholder="Nom de l'objectif"
        value={cat}
        onChange={(e) => setCat(e.target.value)}
        required
        style={{ flex: "1 1 200px" }}
      />
      <select value={urgency} onChange={(e) => setUrgency(Number(e.target.value))}>
        {urgencesTxt.map((txt, i) => (
          <option key={i} value={i + 1}>
            {txt}
          </option>
        ))}
      </select>

      <select value={type} onChange={(e) => setType(e.target.value)} style={{ minWidth: 140 }}>
        <option value="temporaire">Temporaire</option>
        <option value="recurrent">Récurrent</option>
      </select>

      {type === "temporaire" && (
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{ minWidth: 130 }}
          required={type === "temporaire"}
        />
      )}

      <button type="submit" style={{ cursor: "pointer" }}>
        Ajouter objectif
      </button>
    </form>
  );
}
