import React, { useState, useEffect } from "react";
import Objectifs from "./Objectifs";
import PlanningDuJour from "./PlanningDuJour";
import Calendrier from "./Calendrier";
import Routines from "./Routines";

const INIT_GOALS = [
  {
    cat: "Trouver un emploi",
    urgency: 4,
    deadline: "",
    done: 0,
    subtasks: [
      {
        label: "Envoyer 5 candidatures",
        urgency: 4,
        benefit: "Plus tu postules, plus tu as de chances !",
        danger: "Tu retardes ta recherche et risques de manquer des offres.",
        done: false,
        deadline: ""
      }
    ]
  }
];

export default function AssistantCoachApp() {
  const [goals, setGoals] = useState(INIT_GOALS);
  const [routines, setRoutines] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState(0);

  // Ajoute routines du jour et sous-tâches deadline = aujourd'hui au planning du jour
  useEffect(() => {
    const now = new Date();
    const dayIdx = now.getDay();

    const todayRoutines = routines
      .filter(r => r.jours && r.jours.includes(dayIdx))
      .map((r, i) => ({
        label: r.label,
        done: r.doneJours ? (r.doneJours[dayIdx] || false) : false,
        isRoutine: true,
        routineIndex: i,
        heure: r.heure || "",
        jourIndex: dayIdx,
        goalIndex: r.goalIndex
      }));

    const today = now.toISOString().slice(0, 10);
    const todaySubtasks = goals.flatMap((g, gi) =>
      (g.subtasks || [])
        .map((st, si) => ({ ...st, goalIndex: gi, subIndex: si }))
        .filter(st => st.deadline === today)
        .map(st => ({
          ...st,
          isSubtask: true,
          goalIndex: st.goalIndex,
          subIndex: st.subIndex,
          done: st.done
        }))
    );

    setTasks([...todayRoutines, ...todaySubtasks]);
  }, [routines, goals]);

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 30 }}>
        <button onClick={() => setView(0)}>Objectifs</button>
        <button onClick={() => setView(1)}>Planning du jour</button>
        <button onClick={() => setView(2)}>Calendrier</button>
        <button onClick={() => setView(3)}>Routines</button>
      </div>
      {view === 0 && (
        <Objectifs
          goals={goals}
          setGoals={setGoals}
          routines={routines}
          setRoutines={setRoutines}
        />
      )}
      {view === 1 && (
        <PlanningDuJour
          tasks={tasks}
          setTasks={setTasks}
          goals={goals}
          setGoals={setGoals}
          routines={routines}
          setRoutines={setRoutines}
        />
      )}
      {view === 2 && (
        <Calendrier
          goals={goals}
          setGoals={setGoals}
          routines={routines}
          setRoutines={setRoutines}
          tasks={tasks}
          setTasks={setTasks}
        />
      )}
      {view === 3 && <Routines routines={routines} setRoutines={setRoutines} />}
    </div>
  );
}
