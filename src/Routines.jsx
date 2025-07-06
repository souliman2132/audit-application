import React, { useState } from "react";

const joursAbrev = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const recurrenceOptions = [
  { value: "weekly", label: "Chaque semaine" },
  { value: "biweekly", label: "Toutes les 2 semaines" },
  { value: "monthly", label: "Chaque mois" },
  { value: "custom", label: "Personnalisé" },
];

export default function Routines({ routines, setRoutines }) {
  const [newLabel, setNewLabel] = useState("");
  const [newJours, setNewJours] = useState([]);
  const [newHeure, setNewHeure] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newRecurrenceType, setNewRecurrenceType] = useState("weekly");
  const [newRecurrenceInterval, setNewRecurrenceInterval] = useState(1);

  const [editingRoutineIndex, setEditingRoutineIndex] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editJours, setEditJours] = useState([]);
  const [editHeure, setEditHeure] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editRecurrenceType, setEditRecurrenceType] = useState("weekly");
  const [editRecurrenceInterval, setEditRecurrenceInterval] = useState(1);

  function toggleJour(day, jours, setJours) {
    if (jours.includes(day)) setJours(jours.filter(d => d !== day));
    else setJours([...jours, day]);
  }

  function addRoutine(e) {
    e.preventDefault();
    if (!newLabel.trim() || newJours.length === 0) return alert("Veuillez saisir un nom et au moins un jour.");
    const doneJoursInit = {};
    newJours.forEach(j => { doneJoursInit[j] = false; });
    setRoutines(rs => [...rs, {
      label: newLabel,
      jours: newJours,
      heure: newHeure,
      doneJours: doneJoursInit,
      startDate: newStartDate,
      endDate: newEndDate,
      recurrenceType: newRecurrenceType,
      recurrenceInterval: newRecurrenceInterval,
      goalIndex: null
    }]);
    setNewLabel("");
    setNewJours([]);
    setNewHeure("");
    setNewStartDate("");
    setNewEndDate("");
    setNewRecurrenceType("weekly");
    setNewRecurrenceInterval(1);
  }

  function removeRoutine(idx) {
    setRoutines(rs => rs.filter((_, i) => i !== idx));
  }

  function startEditRoutine(idx) {
    const r = routines[idx];
    setEditingRoutineIndex(idx);
    setEditLabel(r.label);
    setEditHeure(r.heure || "");
    setEditJours(r.jours);
    setEditStartDate(r.startDate || "");
    setEditEndDate(r.endDate || "");
    setEditRecurrenceType(r.recurrenceType || "weekly");
    setEditRecurrenceInterval(r.recurrenceInterval || 1);
  }

  function cancelEdit() {
    setEditingRoutineIndex(null);
    setEditLabel("");
    setEditHeure("");
    setEditJours([]);
    setEditStartDate("");
    setEditEndDate("");
    setEditRecurrenceType("weekly");
    setEditRecurrenceInterval(1);
  }

  function saveEdit() {
    if (!editLabel.trim() || editJours.length === 0) return alert("Veuillez saisir un nom et au moins un jour.");
    const doneJoursInit = {};
    editJours.forEach(j => { doneJoursInit[j] = false; });
    setRoutines(rs => rs.map((r, i) =>
      i === editingRoutineIndex
        ? {
          ...r,
          label: editLabel,
          heure: editHeure,
          jours: editJours,
          doneJours: doneJoursInit,
          startDate: editStartDate,
          endDate: editEndDate,
          recurrenceType: editRecurrenceType,
          recurrenceInterval: editRecurrenceInterval,
        }
        : r
    ));
    cancelEdit();
  }

  return (
    <div>
      <h2>Routines</h2>
      {!editingRoutineIndex && (
        <form onSubmit={addRoutine} style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Nouvelle routine"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            required
            style={{ marginRight: 10 }}
          />
          <input
            type="time"
            value={newHeure}
            onChange={e => setNewHeure(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            type="date"
            value={newStartDate}
            onChange={e => setNewStartDate(e.target.value)}
            style={{ marginRight: 10 }}
            title="Date de début"
          />
          <input
            type="date"
            value={newEndDate}
            onChange={e => setNewEndDate(e.target.value)}
            style={{ marginRight: 10 }}
            title="Date de fin"
          />
          <select
            value={newRecurrenceType}
            onChange={e => setNewRecurrenceType(e.target.value)}
            style={{ marginRight: 10 }}
            title="Type de récurrence"
          >
            {recurrenceOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {(newRecurrenceType === "custom") && (
            <input
              type="number"
              min={1}
              value={newRecurrenceInterval}
              onChange={e => setNewRecurrenceInterval(Number(e.target.value))}
              style={{ width: 60, marginRight: 10 }}
              title="Intervalle de récurrence"
            />
          )}
          <div style={{ display: "inline-flex", gap: 5, marginRight: 10 }}>
            {[0,1,2,3,4,5,6].map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleJour(day, newJours, setNewJours)}
                style={{
                  padding: 6,
                  background: newJours.includes(day) ? "#2186eb" : "#eee",
                  color: newJours.includes(day) ? "#fff" : "#000",
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                {joursAbrev[day]}
              </button>
            ))}
          </div>
          <button type="submit" style={{ cursor: "pointer" }}>Ajouter</button>
        </form>
      )}

      {editingRoutineIndex !== null && (
        <div style={{ marginBottom: 20, border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
          <h3>Modifier la routine</h3>
          <input
            type="text"
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            style={{ fontSize: 16, padding: 6, marginBottom: 10, width: "100%" }}
          />
          <input
            type="time"
            value={editHeure}
            onChange={e => setEditHeure(e.target.value)}
            style={{ fontSize: 16, padding: 6, marginBottom: 10, width: 120 }}
          />
          <input
            type="date"
            value={editStartDate}
            onChange={e => setEditStartDate(e.target.value)}
            style={{ marginRight: 10, marginBottom: 10 }}
            title="Date de début"
          />
          <input
            type="date"
            value={editEndDate}
            onChange={e => setEditEndDate(e.target.value)}
            style={{ marginRight: 10, marginBottom: 10 }}
            title="Date de fin"
          />
          <select
            value={editRecurrenceType}
            onChange={e => setEditRecurrenceType(e.target.value)}
            style={{ marginRight: 10, marginBottom: 10 }}
            title="Type de récurrence"
          >
            {recurrenceOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {(editRecurrenceType === "custom") && (
            <input
              type="number"
              min={1}
              value={editRecurrenceInterval}
              onChange={e => setEditRecurrenceInterval(Number(e.target.value))}
              style={{ width: 60, marginRight: 10, marginBottom: 10 }}
              title="Intervalle de récurrence"
            />
          )}
          <div style={{ display: "inline-flex", gap: 5, marginBottom: 10 }}>
            {[0,1,2,3,4,5,6].map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleJour(day, editJours, setEditJours)}
                style={{
                  padding: 6,
                  background: editJours.includes(day) ? "#2186eb" : "#eee",
                  color: editJours.includes(day) ? "#fff" : "#000",
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                {joursAbrev[day]}
              </button>
            ))}
          </div>
          <div>
            <button onClick={saveEdit} style={{ marginRight: 10, padding: "6px 12px", cursor: "pointer" }}>
              Sauvegarder
            </button>
            <button onClick={cancelEdit} style={{ padding: "6px 12px", cursor: "pointer" }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {routines.length === 0 && <p>Aucune routine définie.</p>}
      <ul style={{ padding: 0, listStyle: "none" }}>
        {routines.map((r, i) => (
          <li key={i} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              value={r.label}
              onChange={e => setRoutines(rs => rs.map((rt, ri) => ri === i ? { ...rt, label: e.target.value } : rt))}
              style={{ fontSize: 16, padding: 2, flexGrow: 1 }}
            />
            <input
              type="time"
              value={r.heure || ""}
              onChange={e => setRoutines(rs => rs.map((rt, ri) => ri === i ? { ...rt, heure: e.target.value } : rt))}
              style={{ fontSize: 16, padding: 2, width: 90 }}
            />
            <span style={{ userSelect: "none" }}>
              {r.jours.map(d => joursAbrev[d]).join(", ")}
            </span>
            <span style={{ marginLeft: 12, fontSize: 12, color: "#666" }}>
              {r.startDate ? `Début: ${r.startDate}` : ""}
              {r.endDate ? ` | Fin: ${r.endDate}` : ""}
              {r.recurrenceType ? ` | ${recurrenceOptions.find(o => o.value === r.recurrenceType)?.label || ""}` : ""}
              {r.recurrenceType === "custom" && r.recurrenceInterval ? ` (tous les ${r.recurrenceInterval} semaines)` : ""}
            </span>
            <button
              onClick={() => removeRoutine(i)}
              style={{
                marginLeft: 10,
                background: "none",
                border: "none",
                color: "#d13a3a",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              title="Supprimer la routine"
            >
              ✖
            </button>
            <button
              onClick={() => startEditRoutine(i)}
              style={{
                marginLeft: 8,
                background: "none",
                border: "none",
                color: "#2186eb",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              title="Modifier les jours de la routine"
            >
              ✎
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
