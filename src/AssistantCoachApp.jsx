import React, { useState, useEffect } from "react";
import Objectifs from "./Objectifs";
import PlanningDuJour from "./PlanningDuJour";
import Calendrier from "./Calendrier";
import Routines from "./Routines";

const INIT_GOALS = [
  {
    cat: "Trouver un emploi",
    urgency: 4,
    deadline: "2025-07-05",
    done: 0,
    subtasks: [
      {
        label: "Envoyer 5 candidatures",
        urgency: 4,
        benefit: "Plus tu postules, plus tu as de chances !",
        danger: "Tu retardes ta recherche et risques de manquer des offres.",
        done: false,
        deadline: "2025-07-02"
      }
    ],
    routines: [
      {
        label: "Faire du sport",
        jours: [1, 3, 5],
        heure: "18:00",
        doneJours: { 1: false, 3: false, 5: false }
      }
    ]
  }
];

export default function AssistantCoachApp() {
  const [goals, setGoals] = useState(INIT_GOALS);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState(0);

  useEffect(() => {
    const now = new Date();
    const dayIdx = now.getDay();
    const todayStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // Extraire routines de chaque objectif, filtrer par jour, construire tâches routines du jour
    const todayRoutines = goals.flatMap((goal, gi) => {
      if (!goal.routines) return [];
      return goal.routines.flatMap((r, ri) => {
        if (r.jours.includes(dayIdx)) {
          return {
            label: r.label,
            heure: r.heure,
            done: r.doneJours?.[dayIdx] || false,
            isRoutine: true,
            goalIndex: gi,
            routineIndex: ri,
            jourIndex: dayIdx
          };
        }
        return [];
      });
    });

    // Sous-tâches du jour
    const todaySubtasks = [];
    goals.forEach((goal, gi) => {
      (goal.subtasks || []).forEach((st, si) => {
        if (st.deadline === todayStr) {
          todaySubtasks.push({
            label: st.label,
            urgence: st.urgency,
            done: st.done,
            goalIndex: gi,
            subIndex: si,
            isSubtask: true,
          });
        }
      });
    });

    setTasks(ts => {
      const labels = ts.map(t => t.label + (t.heure || ""));
      const toAddRoutines = todayRoutines.filter(rt => !labels.includes(rt.label + rt.heure));
      const toAddSubtasks = todaySubtasks.filter(tsk => !labels.includes(tsk.label));
      return [...ts, ...toAddRoutines, ...toAddSubtasks];
    });
  }, [goals]);

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 30 }}>
        <button onClick={() => setView(0)}>Objectifs</button>
        <button onClick={() => setView(1)}>Planning du jour</button>
        <button onClick={() => setView(2)}>Calendrier</button>
        <button onClick={() => setView(3)}>Routines</button>
      </div>
      {view === 0 && <Objectifs goals={goals} setGoals={setGoals} />}
      {view === 1 && <PlanningDuJour tasks={tasks} setTasks={setTasks} goals={goals} setGoals={setGoals} />}
      {view === 2 && <Calendrier goals={goals} setGoals={setGoals} />}
      {view === 3 && <Routines goals={goals} setGoals={setGoals} />}
    </div>
  );
}
