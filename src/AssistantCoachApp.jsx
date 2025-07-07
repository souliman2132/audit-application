import React, { useState, useEffect } from "react";
import Objectifs from "./Objectifs";
import PlanningDuJour from "./PlanningDuJour";
import Calendrier from "./Calendrier";
import Routines from "./Routines";

const INIT_GOALS = [
  {
    cat: "Trouver un emploi",
    urgency: 4,
    deadline: "2025-07-07",
    done: 0,
    subtasks: [
      {
        label: "Envoyer 5 candidatures",
        urgency: 4,
        benefit: "Plus tu postules, plus tu as de chances !",
        danger: "Tu retardes ta recherche et risques de manquer des offres.",
        done: false,
        deadline: "2025-07-07"
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
    console.log("[DEBUG] useEffect déclenché");
    const now = new Date();
    const dayIdx = now.getDay();
    const todayStr = now.toISOString().slice(0, 10);

    // 1. Extraire toutes les routines du jour pour tous les objectifs
    const routinesList = [];
    goals.forEach((goal, gi) => {
      if (!goal.routines) return;
      goal.routines.forEach((r, ri) => {
        if (r.jours && r.jours.includes(dayIdx)) {
          routinesList.push({
            label: r.label,
            heure: r.heure,
            done: r.doneJours?.[dayIdx] || false,
            isRoutine: true,
            goalIndex: gi,
            routineIndex: ri,
            jourIndex: dayIdx,
          });
        }
      });
    });

    // 2. Extraire les sous-tâches du jour (deadline aujourd'hui)
    const todaySubtasks = [];
    goals.forEach((goal, gi) => {
      (goal.subtasks || []).forEach((st, si) => {
        console.log(
  "[DEBUG] Sous-tâche:",
  st.label,
  "| deadline:", st.deadline,
  "| todayStr:", todayStr,
  "| EQUALS ?", st.deadline === todayStr
);

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

    setTasks([...routinesList, ...todaySubtasks]);
  }, [goals]);

  return (
    <div style={{ padding: 40 }}>
      <div className="navbar">
        <button
          className={`nav-btn${view === 0 ? " active" : ""}`}
          onClick={() => setView(0)}
        >Objectifs</button>
        <button
          className={`nav-btn${view === 1 ? " active" : ""}`}
          onClick={() => setView(1)}
        >Planning du jour</button>
        <button
          className={`nav-btn${view === 2 ? " active" : ""}`}
          onClick={() => setView(2)}
        >Calendrier</button>
        <button
          className={`nav-btn${view === 3 ? " active" : ""}`}
          onClick={() => setView(3)}
        >Routines</button>
      </div>
      {view === 0 && <Objectifs goals={goals} setGoals={setGoals} />}
      {view === 1 && <PlanningDuJour tasks={tasks} setTasks={setTasks} goals={goals} setGoals={setGoals} />}
      {view === 2 && <Calendrier goals={goals} setGoals={setGoals} />}
      {view === 3 && <Routines goals={goals} setGoals={setGoals} />}
    </div>
  );
}
