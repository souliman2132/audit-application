import React, { useState } from "react";

const urgencesTxt = ["faible", "modérée", "normale", "haute", "critique"];
const urgencesColor = ["#80bfff", "#a0c96b", "#ffd766", "#ffb347", "#e05c5c"];
const urgencesEmoji = ["🟦", "🟩", "🟨", "🟧", "🟥"];

const joursAbrev = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function Calendrier({ goals, setGoals, routines, setRoutines, tasks, setTasks }) {
  const today = new Date();
  const [mois, setMois] = useState(today.getMonth());
  const [annee, setAnnee] = useState(today.getFullYear());

  const [modalListEvents, setModalListEvents] = useState(null);
  const [modalEditEvent, setModalEditEvent] = useState(null);

  const [editedLabel, setEditedLabel] = useState("");
  const [editedUrgency, setEditedUrgency] = useState(3);
  const [editedDeadline, setEditedDeadline] = useState("");
  const [editedHeure, setEditedHeure] = useState("");
  const [editedDone, setEditedDone] = useState(false);
  const [editedJourIndex, setEditedJourIndex] = useState(null);

  const eventsByDate = {};
  goals.forEach((g, gi) => {
    if (g.deadline) {
      const d = g.deadline;
      if (!eventsByDate[d]) eventsByDate[d] = [];
      const doneGoal = g.done || false;
      const doneTask = tasks?.find(t => t.isGoal && t.goalIndex === gi)?.done ?? doneGoal;
      eventsByDate[d].push({
        type: "goal",
        label: g.cat,
        urgence: g.urgency || 3,
        goalIndex: gi,
        done: doneTask
      });
    }
    (g.subtasks || []).forEach((st, si) => {
      if (st.deadline) {
        const d = st.deadline;
        if (!eventsByDate[d]) eventsByDate[d] = [];
        const doneSubtask = st.done || false;
        const doneTask = tasks?.find(t => t.isSubtask && t.goalIndex === gi && t.subIndex === si)?.done ?? doneSubtask;
        eventsByDate[d].push({
          type: "subtask",
          label: st.label,
          urgence: st.urgency || 3,
          goalIndex: gi,
          subIndex: si,
          done: doneTask
        });
      }
    });
  });

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  const daysInMonth = getDaysInMonth(annee, mois);

  routines.forEach((r, ri) => {
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateObj = new Date(annee, mois, dayNum);
      const dayOfWeek = dateObj.getDay();

      if (r.jours.includes(dayOfWeek)) {
        const dateKey = `${annee}-${(mois + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;

        if (r.startDate && dateKey < r.startDate) continue;
        if (r.endDate && dateKey > r.endDate) continue;

        if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
        const doneRoutine = r.doneDates ? (r.doneDates[dateKey] || false) : false;
        eventsByDate[dateKey].push({
          type: "routine",
          label: r.label,
          urgence: 3,
          routineIndex: ri,
          done: doneRoutine,
          heure: r.heure || "",
          jourIndex: dayOfWeek
        });
      }
    }
  });

  function handlePrev() {
    if (mois === 0) {
      setMois(11);
      setAnnee(a => a - 1);
    } else {
      setMois(m => m - 1);
    }
  }
  function handleNext() {
    if (mois === 11) {
      setMois(0);
      setAnnee(a => a + 1);
    } else {
      setMois(m => m + 1);
    }
  }

  function openModalList(events) {
    setModalListEvents(events);
    setModalEditEvent(null);
  }

  function openModalEdit(event) {
    setModalEditEvent(event);
    setEditedLabel(event.label || "");
    setEditedUrgency(event.urgence || 3);
    setEditedDeadline(
      event.type === "routine" ? "" : event.deadline || ""
    );
    setEditedHeure(event.type === "routine" ? event.heure || "" : "");
    setEditedDone(event.done || false);
    setEditedJourIndex(event.jourIndex ?? null);
  }

  function closeModals() {
    setModalListEvents(null);
    setModalEditEvent(null);
    setEditedLabel("");
    setEditedUrgency(3);
    setEditedDeadline("");
    setEditedHeure("");
    setEditedDone(false);
    setEditedJourIndex(null);
  }

  function saveModal() {
    if (!editedLabel.trim()) return alert("Le nom ne peut pas être vide.");
    if (!modalEditEvent) return;

    if (modalEditEvent.type === "goal") {
      setGoals(gs => gs.map((g, i) => i === modalEditEvent.goalIndex
        ? { ...g, cat: editedLabel, urgency: editedUrgency, deadline: editedDeadline, done: editedDone }
        : g
      ));
      if (tasks && setTasks) {
        setTasks(ts => ts.map(t => (t.isGoal && t.goalIndex === modalEditEvent.goalIndex)
          ? { ...t, done: editedDone }
          : t
        ));
      }
    }
    else if (modalEditEvent.type === "subtask") {
      setGoals(gs => gs.map((g, gi) => {
        if (gi !== modalEditEvent.goalIndex) return g;
        return {
          ...g,
          subtasks: g.subtasks.map((st, si) => si === modalEditEvent.subIndex
            ? { ...st, label: editedLabel, urgency: editedUrgency, deadline: editedDeadline, done: editedDone }
            : st
          )
        };
      }));
      if (tasks && setTasks) {
        setTasks(ts => ts.map(t => (t.isSubtask && t.goalIndex === modalEditEvent.goalIndex && t.subIndex === modalEditEvent.subIndex)
          ? { ...t, done: editedDone }
          : t
        ));
      }
    }
    else if (modalEditEvent.type === "routine") {
      setRoutines(rs => rs.map((r, i) => {
        if (i !== modalEditEvent.routineIndex) return r;
        const newDoneJours = {...(r.doneJours || {})};
        if (editedJourIndex !== null) {
          newDoneJours[editedJourIndex] = editedDone;
        }
        return { ...r, label: editedLabel, heure: editedHeure, doneJours: newDoneJours };
      }));
      if (tasks && setTasks) {
        setTasks(ts => ts.map(t => (t.isRoutine && t.routineIndex === modalEditEvent.routineIndex)
          ? { ...t, done: editedDone, heure: editedHeure }
          : t
        ));
      }
    }

    closeModals();
  }

  function deleteItem() {
    if (!window.confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
    if (!modalEditEvent) return;

    if (modalEditEvent.type === "goal") {
      setGoals(gs => gs.filter((_, i) => i !== modalEditEvent.goalIndex));
      if (tasks && setTasks) {
        setTasks(ts => ts.filter(t => !(t.isGoal && t.goalIndex === modalEditEvent.goalIndex)));
      }
    }
    else if (modalEditEvent.type === "subtask") {
      setGoals(gs => gs.map((g, gi) => {
        if (gi !== modalEditEvent.goalIndex) return g;
        return {
          ...g,
          subtasks: g.subtasks.filter((_, si) => si !== modalEditEvent.subIndex)
        };
      }));
      if (tasks && setTasks) {
        setTasks(ts => ts.filter(t => !(t.isSubtask && t.goalIndex === modalEditEvent.goalIndex && t.subIndex === modalEditEvent.subIndex)));
      }
    }
    else if (modalEditEvent.type === "routine") {
      setRoutines(rs => rs.filter((_, i) => i !== modalEditEvent.routineIndex));
      if (tasks && setTasks) {
        setTasks(ts => ts.filter(t => !(t.isRoutine && t.routineIndex === modalEditEvent.routineIndex)));
      }
    }

    closeModals();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Calendrier</h2>
      <div style={{ marginBottom: 16 }}>
        <button onClick={handlePrev}>&lt;</button>
        <span style={{ margin: "0 12px", fontWeight: "bold" }}>
          {new Date(annee, mois).toLocaleString("fr-FR", { month: "long", year: "numeric" })}
        </span>
        <button onClick={handleNext}>&gt;</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {joursAbrev.map(j => (
              <th key={j} style={{ padding: 4, fontSize: 13, color: "#333" }}>{j}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, weekIdx) => (
            <tr key={weekIdx}>
              {Array.from({ length: 7 }).map((_, dow) => {
                const firstDay = new Date(annee, mois, 1).getDay();
                const dayNum = weekIdx * 7 + dow - firstDay + 1;
                const dateISO = dayNum > 0 && dayNum <= daysInMonth
                  ? `${annee}-${(mois + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`
                  : null;
                const events = dateISO ? eventsByDate[dateISO] : [];
                return (
                  <td key={dow}
                    style={{
                      border: "1px solid #eee",
                      minWidth: 85,
                      height: 75,
                      verticalAlign: "top",
                      background: events && events.length ? "#f6faff" : "#fff",
                      opacity: dayNum > 0 && dayNum <= daysInMonth ? 1 : 0.45,
                      padding: 6,
                      cursor: events && events.length ? "pointer" : "default"
                    }}
                    onClick={() => events && events.length && openModalList(events)}
                  >
                    <div style={{
                      fontWeight: 600,
                      marginBottom: 2,
                      color: today.getDate() === dayNum && today.getMonth() === mois && today.getFullYear() === annee ? "#2186eb" : "#333"
                    }}>
                      {dayNum > 0 && dayNum <= daysInMonth ? dayNum : ""}
                    </div>
                    {events && events.map((ev, k) => (
                      <div key={k} style={{
                        marginTop: 2,
                        background: urgencesColor[ev.urgence - 1] || "#eee",
                        color: "#fff",
                        borderRadius: 8,
                        fontSize: 12,
                        padding: "1px 6px",
                        opacity: ev.done ? 0.35 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 1
                      }}>
                        <span>{urgencesEmoji[ev.urgence - 1] || "⚪"}</span>
                        <span style={{
                          textDecoration: ev.done ? "line-through" : "none",
                          fontWeight: ev.type === "goal" ? "bold" : "normal"
                        }}>{ev.label}</span>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {modalListEvents && !modalEditEvent && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, minWidth: 320, maxHeight: "80vh", overflowY: "auto" }}>
            <h3>Tâches du jour</h3>
            <ul style={{ padding: 0, listStyle: "none" }}>
              {modalListEvents.map((ev, i) => (
                <li key={i} style={{ padding: 8, marginBottom: 6, borderRadius: 8, background: ev.done ? "#d0f0d0" : "#f9f9f9", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                  onClick={() => openModalEdit(ev)}
                >
                  <span style={{ fontSize: 16 }}>{urgencesEmoji[ev.urgence - 1] || "⚪"}</span>
                  <span style={{ textDecoration: ev.done ? "line-through" : "none", fontWeight: ev.type === "goal" ? "bold" : "normal", flexGrow: 1 }}>
                    {ev.label}
                  </span>
                </li>
              ))}
            </ul>
            <button onClick={closeModals} style={{ marginTop: 12 }}>Fermer</button>
          </div>
        </div>
      )}

      {modalEditEvent && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, minWidth: 320 }}>
            <h3>Modifier {modalEditEvent.type}</h3>

            <label style={{ fontWeight: "bold" }}>Nom</label>
            <input
              type="text"
              value={editedLabel}
              onChange={e => setEditedLabel(e.target.value)}
              style={{ width: "100%", marginBottom: 12, padding: 6 }}
            />

            {(modalEditEvent.type === "goal" || modalEditEvent.type === "subtask") && (
              <>
                <label style={{ fontWeight: "bold" }}>Urgence</label>
                <select
                  value={editedUrgency}
                  onChange={e => setEditedUrgency(Number(e.target.value))}
                  style={{ width: "100%", marginBottom: 12, padding: 6 }}
                >
                  {urgencesTxt.map((txt, i) => (
                    <option key={i} value={i + 1}>{txt}</option>
                  ))}
                </select>

                <label style={{ fontWeight: "bold" }}>Deadline</label>
                <input
                  type="date"
                  value={editedDeadline}
                  onChange={e => setEditedDeadline(e.target.value)}
                  style={{ width: "100%", marginBottom: 12, padding: 6 }}
                />
              </>
            )}

            {modalEditEvent.type === "routine" && (
              <>
                <label style={{ fontWeight: "bold" }}>Heure</label>
                <input
                  type="time"
                  value={editedHeure}
                  onChange={e => setEditedHeure(e.target.value)}
                  style={{ width: "100%", marginBottom: 12, padding: 6 }}
                />
              </>
            )}

            {modalEditEvent.type === "routine" && editedJourIndex !== null && (
              <p style={{ fontWeight: "bold" }}>Jour : {joursAbrev[editedJourIndex]}</p>
            )}

            <label style={{ fontWeight: "bold" }}>
              <input
                type="checkbox"
                checked={editedDone}
                onChange={e => setEditedDone(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Marqué comme fait
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button
                onClick={saveModal}
                style={{ background: "#2186eb", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer" }}
              >
                Enregistrer
              </button>
              <button
                onClick={deleteItem}
                style={{ background: "#d13a3a", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer" }}
              >
                Supprimer
              </button>
              <button
                onClick={() => setModalEditEvent(null)}
                style={{ background: "#fbb", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
