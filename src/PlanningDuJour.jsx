import React from "react";

export default function PlanningDuJour({ tasks, setTasks, goals, setGoals, routines, setRoutines }) {
  const today = new Date();
  const todayDay = today.getDay();

  // Évite doublons : on affiche une seule entrée par routine/jour aujourd’hui
  const routineTasks = [];
  const seenRoutines = new Set();

  routines.forEach((r, ri) => {
    if (r.nombreRecurrences > 0 && r.jours.includes(todayDay)) {
      const key = `${ri}-${todayDay}`;
      if (!seenRoutines.has(key)) {
        routineTasks.push({
          isRoutine: true,
          routineIndex: ri,
          label: r.label,
          heure: r.heure,
          jourIndex: todayDay,
          done: r.doneJours?.[todayDay] || false,
        });
        seenRoutines.add(key);
      }
    }
  });

  const allTasks = [...tasks, ...routineTasks];

  function toggleDone(idx) {
    const t = allTasks[idx];
    if (!t) return;

    if (t.isRoutine) {
      setRoutines(rs => {
        const r = rs[t.routineIndex];
        if (!r) return rs;
        const newDoneJours = { ...(r.doneJours || {}) };
        const currentlyDone = !!newDoneJours[t.jourIndex];
        newDoneJours[t.jourIndex] = !currentlyDone;

        let newNombreRecurrences = r.nombreRecurrences ?? 0;

        if (!currentlyDone) {
          newNombreRecurrences = Math.max(0, newNombreRecurrences - 1);
        } else {
          newNombreRecurrences = newNombreRecurrences + 1;
        }

        let newRoutines = [...rs];
        if (newNombreRecurrences === 0) {
          newRoutines = rs.filter((_, i) => i !== t.routineIndex);
        } else {
          const newRoutine = {
            ...r,
            doneJours: newDoneJours,
            nombreRecurrences: newNombreRecurrences,
          };
          newRoutines[t.routineIndex] = newRoutine;
        }
        return newRoutines;
      });
    } else {
      setTasks(ts => ts.map((task, i) => i === idx ? { ...task, done: !task.done } : task));
      if (t.isGoal && goals && setGoals) {
        const { goalIndex } = t;
        setGoals(gs => gs.map((g, gi) => gi === goalIndex ? { ...g, done: !g.done } : g));
      } else if (t.isSubtask && goals && setGoals) {
        const { goalIndex, subIndex } = t;
        setGoals(gs => gs.map((g, gi) => {
          if (gi !== goalIndex) return g;
          return {
            ...g,
            subtasks: (g.subtasks || []).map((st, si) => si === subIndex ? { ...st, done: !st.done } : st)
          };
        }));
      }
    }
  }

  function editLabel(idx, newLabel) {
    const t = allTasks[idx];
    if (!t) return;

    if (t.isRoutine) {
      setRoutines(rs => rs.map((r, i) => i === t.routineIndex ? { ...r, label: newLabel } : r));
    } else {
      setTasks(ts => ts.map((task, i) => i === idx ? { ...task, label: newLabel } : task));
      if (t.isGoal && goals && setGoals) {
        const { goalIndex } = t;
        setGoals(gs => gs.map((g, gi) => gi === goalIndex ? { ...g, cat: newLabel } : g));
      } else if (t.isSubtask && goals && setGoals) {
        const { goalIndex, subIndex } = t;
        setGoals(gs => gs.map((g, gi) => {
          if (gi !== goalIndex) return g;
          return {
            ...g,
            subtasks: (g.subtasks || []).map((st, si) => si === subIndex ? { ...st, label: newLabel } : st)
          };
        }));
      }
    }
  }

  function deleteTask(idx) {
    const t = allTasks[idx];
    if (!t) return;

    if (t.isRoutine) {
      setRoutines(rs => rs.filter((_, i) => i !== t.routineIndex));
    } else {
      if (t.isGoal && goals && setGoals) {
        const { goalIndex } = t;
        setGoals(gs => gs.filter((_, i) => i !== goalIndex));
      } else if (t.isSubtask && goals && setGoals) {
        const { goalIndex, subIndex } = t;
        setGoals(gs => gs.map((g, gi) => {
          if (gi !== goalIndex) return g;
          return {
            ...g,
            subtasks: (g.subtasks || []).filter((_, si) => si !== subIndex)
          };
        }));
      }
      setTasks(ts => ts.filter((_, i) => i !== idx));
    }
  }

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.done).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2 style={{ marginBottom: 12 }}>Planning du jour</h2>

      <div style={{ marginBottom: 20 }}>
        <div style={{ background: "#e8e8e8", borderRadius: 10, overflow: "hidden", height: 18 }}>
          <div
            style={{
              width: `${progressPercent}%`,
              background: "#2186eb",
              height: "100%",
              borderRadius: 10,
              transition: "width 0.3s"
            }}
          />
        </div>
        <p style={{ textAlign: "right", margin: "4px 0 0 0", fontWeight: "bold", color: "#2186eb" }}>
          {doneTasks} / {totalTasks} tâches complétées ({progressPercent}%)
        </p>
      </div>

      <ul style={{ padding: 0, listStyle: "none" }}>
        {allTasks.length === 0 && <p>Aucune tâche aujourd'hui.</p>}
        {allTasks.map((task, i) => (
          <li key={i} style={{
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 10,
            borderRadius: 8,
            background: task.done ? "#d0f0d0" : "#f9f9f9",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            userSelect: "none"
          }}>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleDone(i)}
              style={{ transform: "scale(1.3)" }}
            />
            <input
              type="text"
              value={task.label}
              onChange={e => editLabel(i, e.target.value)}
              style={{
                flexGrow: 1,
                fontSize: 16,
                textDecoration: task.done ? "line-through" : "none",
                background: "transparent",
                border: "none",
                outline: "none",
                userSelect: "text",
                color: task.done ? "#4a7f4a" : "#222"
              }}
            />
            <button
              onClick={() => deleteTask(i)}
              style={{
                background: "none",
                border: "none",
                color: "#d13a3a",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: 14
              }}
              title="Supprimer la tâche"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
