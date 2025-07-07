import React, { useState, useEffect } from "react";
import AjoutObjectif from "./AjoutObjectif";
import SousTacheEditable from "./SousTacheEditable";

const urgencesTxt = ["faible", "modérée", "normale", "haute", "critique"];
const urgencesColor = ["#80bfff", "#a0c96b", "#ffd766", "#ffb347", "#e05c5c"];
const joursAbrev = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const recurrenceTypes = [
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "toutes_les_semaines", label: "Toutes les semaines" },
  { value: "toutes_les_2_semaines", label: "Toutes les 2 semaines" },
  { value: "mensuelle", label: "Mensuelle" },
  { value: "autre", label: "Autre" },
];

// Calcul automatique du nombre de récurrences selon startDate, endDate, jours et intervalle
function calculNombreRecurrences(startDate, endDate, jours, recurrenceInterval) {
  if (!startDate || !endDate || jours.length === 0) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) return 0;

  let count = 0;
  // Compte combien de jours sélectionnés entre start et end
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (jours.includes(d.getDay())) {
      count++;
    }
  }
  // Ajuste selon l'intervalle de semaines (ex: toutes les 2 semaines divise par 2)
  const weeks = Math.ceil((end - start) / (7 * 24 * 3600 * 1000));
  const adjustedCount = Math.floor(count / recurrenceInterval);
  return adjustedCount > 0 ? adjustedCount : 0;
}

export default function Objectifs({ goals, setGoals, routines, setRoutines }) {
  const [editIdx, setEditIdx] = useState(null);
  const [editData, setEditData] = useState({ cat: "", urgency: 3, deadline: "", type: "temporaire" });

  const [newRoutineLabel, setNewRoutineLabel] = useState("");
  const [newRoutineHeure, setNewRoutineHeure] = useState("");
  const [newRoutineJours, setNewRoutineJours] = useState([]);
  const [newRoutineStartDate, setNewRoutineStartDate] = useState("");
  const [newRoutineEndDate, setNewRoutineEndDate] = useState("");
  const [newRoutineRecurrenceType, setNewRoutineRecurrenceType] = useState("hebdomadaire");
  const [newRoutineRecurrenceInterval, setNewRoutineRecurrenceInterval] = useState(1);

  const [editRoutineIdx, setEditRoutineIdx] = useState(null);
  const [editRoutineLabel, setEditRoutineLabel] = useState("");
  const [editRoutineHeure, setEditRoutineHeure] = useState("");
  const [editRoutineJours, setEditRoutineJours] = useState([]);
  const [editRoutineStartDate, setEditRoutineStartDate] = useState("");
  const [editRoutineEndDate, setEditRoutineEndDate] = useState("");
  const [editRoutineRecurrenceType, setEditRoutineRecurrenceType] = useState("hebdomadaire");
  const [editRoutineRecurrenceInterval, setEditRoutineRecurrenceInterval] = useState(1);

  const [openAddRoutineForGoal, setOpenAddRoutineForGoal] = useState(null);

  if (!goals || !Array.isArray(goals)) return <div>Chargement…</div>;

  function addGoal(newGoal) {
    setGoals(gs => [...gs, newGoal]);
  }

  function removeGoal(idx) {
    if (!window.confirm("Supprimer cet objectif ?")) return;
    setGoals(gs => gs.filter((_, i) => i !== idx));
  }

  function openEdit(idx) {
    const g = goals[idx];
    setEditData({ cat: g.cat, urgency: g.urgency, deadline: g.deadline || "", type: g.type || "temporaire" });
    setEditIdx(idx);
  }

  function saveEdit() {
    if (!editData.cat.trim()) return alert("Le nom de l'objectif est obligatoire");
    setGoals(gs =>
      gs.map((g, i) =>
        i === editIdx ? { ...g, ...editData, deadline: editData.type === "temporaire" ? editData.deadline : "" } : g
      )
    );
    setEditIdx(null);
  }

  function cancelEdit() {
    setEditIdx(null);
  }

  function toggleSubDone(goalIndex, subIndex) {
    setGoals(gs =>
      gs.map((g, gi) => {
        if (gi !== goalIndex) return g;
        return {
          ...g,
          subtasks: (g.subtasks || []).map((st, si) => (si !== subIndex ? st : { ...st, done: !st.done })),
        };
      })
    );
  }

  // GESTION ROUTINES

  function toggleRoutineJourDone(routineIndex, jour) {
    setRoutines(rs => {
      const r = rs[routineIndex];
      if (!r) return rs;
      const newDoneJours = { ...(r.doneJours || {}) };
      const currentlyDone = !!newDoneJours[jour];
      newDoneJours[jour] = !currentlyDone;

      // Ajuste le nombre de récurrences restantes seulement si on coche (done -> true)
      let newNombreRecurrences = r.nombreRecurrences ?? calculNombreRecurrences(r.startDate, r.endDate, r.jours, r.recurrenceInterval);

      if (!currentlyDone) {
        // on coche = on consomme une récurrence restante
        newNombreRecurrences = Math.max(0, newNombreRecurrences - 1);
      } else {
        // on décoche = on restitue une récurrence restante
        newNombreRecurrences = newNombreRecurrences + 1;
      }

      let newRoutines = [...rs];
      if (newNombreRecurrences === 0) {
        // Supprime la routine si plus de récurrences
        newRoutines = rs.filter((_, i) => i !== routineIndex);
      } else {
        const newRoutine = { ...r, doneJours: newDoneJours, nombreRecurrences: newNombreRecurrences };
        newRoutines[routineIndex] = newRoutine;
      }
      return newRoutines;
    });
  }

  function toggleRoutineJourSelected(day, jours, setJours) {
    if (jours.includes(day)) setJours(jours.filter(d => d !== day));
    else setJours([...jours, day]);
  }

  // Calcul automatique du nombre de récurrences restantes à la création/modification
  function calculNombreRecurrencesForRoutine(jours, startDate, endDate, recurrenceInterval) {
    return calculNombreRecurrences(startDate, endDate, jours, recurrenceInterval);
  }

  function addRoutine(goalIndex) {
    if (!newRoutineLabel.trim() || newRoutineJours.length === 0) {
      alert("Nom + au moins un jour requis");
      return;
    }
    const doneJoursInit = {};
    newRoutineJours.forEach(j => {
      doneJoursInit[j] = false;
    });

    const nombreRecurrences = calculNombreRecurrencesForRoutine(newRoutineJours, newRoutineStartDate, newRoutineEndDate, newRoutineRecurrenceInterval);

    setRoutines(rs => [
      ...rs,
      {
        label: newRoutineLabel,
        heure: newRoutineHeure,
        jours: newRoutineJours,
        doneJours: doneJoursInit,
        startDate: newRoutineStartDate,
        endDate: newRoutineEndDate,
        recurrenceType: newRoutineRecurrenceType,
        recurrenceInterval: newRoutineRecurrenceInterval,
        nombreRecurrences,
        goalIndex
      }
    ]);
    setNewRoutineLabel("");
    setNewRoutineHeure("");
    setNewRoutineJours([]);
    setNewRoutineStartDate("");
    setNewRoutineEndDate("");
    setNewRoutineRecurrenceType("hebdomadaire");
    setNewRoutineRecurrenceInterval(1);
    setOpenAddRoutineForGoal(null);
  }

  function startEditRoutine(routineIndex) {
    const r = routines[routineIndex];
    if (!r) return;
    setEditRoutineIdx(routineIndex);
    setEditRoutineLabel(r.label);
    setEditRoutineHeure(r.heure || "");
    setEditRoutineJours(r.jours);
    setEditRoutineStartDate(r.startDate || "");
    setEditRoutineEndDate(r.endDate || "");
    setEditRoutineRecurrenceType(r.recurrenceType || "hebdomadaire");
    setEditRoutineRecurrenceInterval(r.recurrenceInterval || 1);
  }

  function saveEditRoutine() {
    if (!editRoutineLabel.trim() || editRoutineJours.length === 0) {
      alert("Nom + au moins un jour requis");
      return;
    }
    const doneJoursInit = {};
    editRoutineJours.forEach(j => {
      doneJoursInit[j] = false;
    });

    const nombreRecurrences = calculNombreRecurrencesForRoutine(editRoutineJours, editRoutineStartDate, editRoutineEndDate, editRoutineRecurrenceInterval);

    setRoutines(rs =>
      rs.map((r, i) =>
        i === editRoutineIdx
          ? {
              ...r,
              label: editRoutineLabel,
              heure: editRoutineHeure,
              jours: editRoutineJours,
              doneJours: doneJoursInit,
              startDate: editRoutineStartDate,
              endDate: editRoutineEndDate,
              recurrenceType: editRoutineRecurrenceType,
              recurrenceInterval: editRoutineRecurrenceInterval,
              nombreRecurrences,
            }
          : r
      )
    );
    cancelEditRoutine();
  }

  function cancelEditRoutine() {
    setEditRoutineIdx(null);
    setEditRoutineLabel("");
    setEditRoutineHeure("");
    setEditRoutineJours([]);
    setEditRoutineStartDate("");
    setEditRoutineEndDate("");
    setEditRoutineRecurrenceType("hebdomadaire");
    setEditRoutineRecurrenceInterval(1);
  }

  function removeRoutine(routineIndex) {
    setRoutines(rs => rs.filter((_, i) => i !== routineIndex));
  }

  function routineIndexFromGlobal(routine) {
    return routines.findIndex(r => r === routine);
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Mes objectifs</h2>
      <AjoutObjectif onAdd={addGoal} />
      {goals.length === 0 && <p>Aucun objectif pour l’instant.</p>}
      {goals.map((g, i) => {
        const total = (g.subtasks || []).length;
        const doneCount = (g.subtasks || []).filter(st => st.done).length;
        const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

        const routinesForGoal = routines.filter(r => r.goalIndex === i);

        return (
          <div key={i} style={{ position: "relative", marginBottom: 24 }}>
            <div
              style={{
                marginBottom: 10,
                border: "1px solid #e0e0e0",
                borderRadius: 12,
                padding: 20,
                background: "#fafdff",
                boxShadow: "0 2px 8px #e5eaf3",
              }}
            >
              {/* Objectif header */}
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 8,
                  color: "#235aa6",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {g.cat}
                <span
                  style={{
                    background: urgencesColor[g.urgency - 1] || "#e0e0e0",
                    color: "#fff",
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: 14,
                    fontWeight: "600",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Urgence : {urgencesTxt[g.urgency - 1] || "normale"}
                </span>
                <span
                  style={{
                    background: g.type === "temporaire" ? "#4caf50" : "#2196f3",
                    color: "#fff",
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: 14,
                    fontWeight: "600",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    marginLeft: 12,
                  }}
                >
                  {g.type === "temporaire" ? "Temporaire" : "Récurrent"}
                </span>
                {g.deadline && g.type === "temporaire" && (
                  <span style={{ marginLeft: 12, fontStyle: "italic", color: "#555", fontSize: 14 }}>
                    📅 {new Date(g.deadline).toLocaleDateString("fr-FR")}
                  </span>
                )}

                {(g.type === "temporaire" || g.type === "recurrent") && (
                  <button
                    onClick={() => setOpenAddRoutineForGoal(openAddRoutineForGoal === i ? null : i)}
                    style={{
                      marginLeft: "auto",
                      fontWeight: "bold",
                      background: "#4caf50",
                      color: "#fff",
                      border: "none",
                      padding: "6px 16px",
                      borderRadius: 6,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    aria-label="Ajouter une routine"
                  >
                    + Ajouter une routine
                  </button>
                )}

                <button
                  onClick={() => openEdit(i)}
                  title="Modifier objectif"
                  style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
                  aria-label="Modifier objectif"
                >
                  ✏️
                </button>
                <button
                  onClick={() => removeGoal(i)}
                  title="Supprimer objectif"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#d13a3a" }}
                  aria-label="Supprimer objectif"
                >
                  🗑️
                </button>
              </div>

              {/* Barre de progression des sous-tâches */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 200,
                    height: 12,
                    background: "#e8e8e8",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "#2186eb",
                      borderRadius: 8,
                      transition: "width 0.4s",
                    }}
                  />
                </div>
                <span style={{ fontSize: 13, color: "#2186eb" }}>
                  {doneCount} / {total} sous-tâches réalisées
                </span>
              </div>

              {/* Liste des sous-tâches (temporaire uniquement) */}
              {g.type === "temporaire" && (
                <ul style={{ padding: 0, marginTop: 12, listStyle: "none" }}>
                  {(g.subtasks || []).map((st, j) => (
                    <li
                      key={j}
                      style={{
                        marginBottom: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        borderLeft: `4px solid ${urgencesColor[st.urgency - 1] || "#e0e0e0"}`,
                        background: st.done ? "#d9f0ff" : "#fff",
                        padding: "8px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                        textDecoration: st.done ? "line-through" : "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={st.done}
                        onChange={() => toggleSubDone(i, j)}
                        aria-label={`Marquer la sous-tâche "${st.label}" comme réalisée`}
                      />
                      <SousTacheEditable
                        subtask={st}
                        onUpdate={(updated) =>
                          setGoals((gs) =>
                            gs.map((goal, gi) => {
                              if (gi !== i) return goal;
                              return {
                                ...goal,
                                subtasks: (goal.subtasks || []).map((subt, si) =>
                                  si !== j ? subt : { ...subt, ...updated }
                                ),
                              };
                            })
                          )
                        }
                        onDelete={() => {
                          if (!window.confirm("Supprimer cette sous-tâche ?")) return;
                          setGoals((gs) =>
                            gs.map((goal, gi) => {
                              if (gi !== i) return goal;
                              return {
                                ...goal,
                                subtasks: (goal.subtasks || []).filter((_, si) => si !== j),
                              };
                            })
                          );
                        }}
                            onToggleDone={() => toggleSubDone(i, j)}
                      />
                    </li>
                  ))}
                  <AddSousTache goalIndex={i} setGoals={setGoals} />
                </ul>
              )}

              {/* Liste routines */}
              <ul style={{ padding: 0, listStyle: "none", marginTop: g.type === "temporaire" ? 20 : 12 }}>
                {routinesForGoal.map((r, ri) => (
                  <li
                    key={ri}
                    style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10, userSelect: "none" }}
                  >
                    <input
                      type="checkbox"
                      checked={r.doneJours?.[r.jours[0]] || false}
                      onChange={() => toggleRoutineJourDone(routineIndexFromGlobal(r), r.jours[0])}
                      title={`Récurrences restantes: ${r.nombreRecurrences}`}
                    />
                    <span
                      style={{
                        flexGrow: 1,
                        fontWeight: "bold",
                        textDecoration: r.doneJours?.[r.jours[0]] ? "line-through" : "none",
                      }}
                    >
                      {r.label} ({r.heure}) — Récurrences restantes : {r.nombreRecurrences}
                    </span>
                    <span>{r.jours.map((d) => joursAbrev[d]).join(", ")}</span>

                    <span style={{ marginLeft: 12, fontSize: 12, color: "#555", userSelect: "none" }}>
                      Déb. : {r.startDate || "—"} | Fin : {r.endDate || "—"}
                    </span>
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#555", userSelect: "none" }}>
                      Récurrence : {r.recurrenceType} (tous les {r.recurrenceInterval || 1} semaines)
                    </span>

                    <button
                      onClick={() => startEditRoutine(routineIndexFromGlobal(r))}
                      style={{
                        marginLeft: 10,
                        background: "none",
                        border: "none",
                        color: "#2186eb",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      title="Modifier routine"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => {
                        if (!window.confirm("Supprimer cette routine ?")) return;
                        removeRoutine(routineIndexFromGlobal(r));
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#d13a3a",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      title="Supprimer routine"
                    >
                      ✖
                    </button>
                  </li>
                ))}
              </ul>

              {(g.type === "temporaire" || g.type === "recurrent") && openAddRoutineForGoal === i && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addRoutine(i);
                  }}
                  style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
                >
                  <input
                    type="text"
                    placeholder="Nouvelle routine"
                    value={newRoutineLabel}
                    onChange={(e) => setNewRoutineLabel(e.target.value)}
                    style={{ flex: "1 1 180px" }}
                    required
                  />
                  <input
                    type="time"
                    value={newRoutineHeure}
                    onChange={(e) => setNewRoutineHeure(e.target.value)}
                    style={{ width: 90 }}
                  />

                  <input
                    type="date"
                    value={newRoutineStartDate}
                    onChange={(e) => setNewRoutineStartDate(e.target.value)}
                    style={{ width: 140 }}
                    placeholder="Date début"
                    required
                  />
                  <input
                    type="date"
                    value={newRoutineEndDate}
                    onChange={(e) => setNewRoutineEndDate(e.target.value)}
                    style={{ width: 140 }}
                    placeholder="Date fin"
                    required
                  />

                  <select
                    value={newRoutineRecurrenceType}
                    onChange={(e) => setNewRoutineRecurrenceType(e.target.value)}
                    style={{ width: 160 }}
                  >
                    {recurrenceTypes.map((rt) => (
                      <option key={rt.value} value={rt.value}>
                        {rt.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={newRoutineRecurrenceInterval}
                    onChange={(e) => setNewRoutineRecurrenceInterval(Number(e.target.value))}
                    style={{ width: 90 }}
                    title="Intervalle de récurrence (en semaines)"
                  />

                  <div style={{ display: "inline-flex", gap: 5 }}>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleRoutineJourSelected(day, newRoutineJours, setNewRoutineJours)}
                        style={{
                          padding: 6,
                          background: newRoutineJours.includes(day) ? "#2186eb" : "#eee",
                          color: newRoutineJours.includes(day) ? "#fff" : "#000",
                          borderRadius: 4,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {joursAbrev[day]}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    style={{
                      fontWeight: "bold",
                      background: "#2186eb",
                      color: "#fff",
                      border: "none",
                      padding: "6px 16px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Ajouter routine
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenAddRoutineForGoal(null)}
                    style={{ marginLeft: 10, padding: "6px 12px", cursor: "pointer" }}
                  >
                    Annuler
                  </button>
                </form>
              )}

              {/* Formulaire édition routine */}
{editRoutineIdx !== null && (
  <div style={{ marginTop: 12, border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
    <h4>Modifier la routine</h4>
    {/* ...inputs... */}
    {/* ...select... */}
    {/* BLOc jours à coller ici */}
    <div style={{ display: "inline-flex", gap: 5, marginBottom: 10 }}>
      {[0,1,2,3,4,5,6].map(day => (
        <button
          key={day}
          type="button"
          onClick={() =>
            setEditRoutineJours(
              editRoutineJours.includes(day)
                ? editRoutineJours.filter(d => d !== day)
                : [...editRoutineJours, day]
            )
          }
          style={{
            padding: 6,
            background: editRoutineJours.includes(day) ? "#2186eb" : "#eee",
            color: editRoutineJours.includes(day) ? "#fff" : "#000",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
          }}
        >
          {joursAbrev[day]}
        </button>
      ))}
    </div>
    <div>
      <button onClick={saveEditRoutine} style={{ marginRight: 10, padding: "6px 12px", cursor: "pointer" }}>
        Sauvegarder
      </button>
      <button onClick={cancelEditRoutine} style={{ padding: "6px 12px", cursor: "pointer" }}>
        Annuler
      </button>
    </div>
  </div>
)}
            </div>
          </div>
        );
      })}

      {/* Modale édition objectif */}
      {editIdx !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, minWidth: 320 }}>
            <h3>Modifier Objectif</h3>
            <input
              type="text"
              value={editData.cat}
              onChange={(e) => setEditData((d) => ({ ...d, cat: e.target.value }))}
              style={{ width: "100%", marginBottom: 10, fontSize: 16, padding: 6 }}
            />
            <select
              value={editData.urgency}
              onChange={(e) => setEditData((d) => ({ ...d, urgency: Number(e.target.value) }))}
              style={{ width: "100%", marginBottom: 10, fontSize: 16, padding: 6 }}
            >
              {urgencesTxt.map((txt, i) => (
                <option key={i} value={i + 1}>
                  {txt}
                </option>
              ))}
            </select>

            <select
              value={editData.type}
              onChange={(e) => setEditData((d) => ({ ...d, type: e.target.value }))}
              style={{ width: "100%", marginBottom: 10, fontSize: 16, padding: 6 }}
            >
              <option value="temporaire">Temporaire</option>
              <option value="recurrent">Récurrent</option>
            </select>

            {editData.type === "temporaire" && (
              <input
                type="date"
                value={editData.deadline}
                onChange={(e) => setEditData((d) => ({ ...d, deadline: e.target.value }))}
                style={{ width: "100%", marginBottom: 10, fontSize: 16, padding: 6 }}
              />
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={saveEdit}
                style={{ background: "#2186eb", color: "#fff", padding: "6px 20px", border: "none", borderRadius: 6, cursor: "pointer" }}
              >
                Enregistrer
              </button>
              <button
                onClick={cancelEdit}
                style={{ background: "#fbb", border: "none", padding: "6px 20px", borderRadius: 6, cursor: "pointer" }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddSousTache({ goalIndex, setGoals }) {
  const [label, setLabel] = React.useState("");
  const [urgency, setUrgency] = React.useState(3);
  const [deadline, setDeadline] = React.useState("");
  const [benefit, setBenefit] = React.useState("");
  const [danger, setDanger] = React.useState("");
  const [emoji, setEmoji] = React.useState("🎯");

  function handleAdd(e) {
    e.preventDefault();
    if (!label.trim()) return;
    setGoals((gs) =>
      gs.map((g, gi) => {
        if (gi !== goalIndex) return g;
        return {
          ...g,
          subtasks: [...(g.subtasks || []), { label, urgency, deadline, benefit, danger, emoji, done: false }],
        };
      })
    );
    setLabel("");
    setUrgency(3);
    setDeadline("");
    setBenefit("");
    setDanger("");
    setEmoji("🎯");
  }

  return (
    <form
      onSubmit={handleAdd}
      style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, background: "#eaf2fc", padding: 10, borderRadius: 8 }}
    >
      <input
        placeholder="Nouvelle sous-tâche"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        style={{ flex: "1 1 180px" }}
        required
      />
      <select value={urgency} onChange={(e) => setUrgency(Number(e.target.value))}>
        {urgencesTxt.map((txt, i) => (
          <option key={i} value={i + 1}>
            {txt}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        style={{ minWidth: 120, fontSize: 12, border: "1px solid #eee", borderRadius: 4, padding: 3 }}
      />
      <input
        placeholder="Bénéfice"
        value={benefit}
        onChange={(e) => setBenefit(e.target.value)}
        style={{ flex: "1 1 120px" }}
      />
      <input
        placeholder="Danger"
        value={danger}
        onChange={(e) => setDanger(e.target.value)}
        style={{ flex: "1 1 120px" }}
      />
      <select value={emoji} onChange={(e) => setEmoji(e.target.value)} style={{ fontSize: 18, padding: 2 }}>
        {["🎯", "🔥", "💪", "⭐", "🚀", "🎉"].map((em) => (
          <option key={em} value={em}>
            {em}
          </option>
        ))}
      </select>
      <button
        type="submit"
        style={{ fontWeight: "bold", background: "#2186eb", color: "#fff", border: "none", padding: "0 20px", borderRadius: 6, cursor: "pointer" }}
      >
        Ajouter sous-tâche
      </button>
    </form>
  );
}
