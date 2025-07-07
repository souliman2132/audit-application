import React, { useState, useEffect } from "react";
import Objectifs from "./Objectifs";
import PlanningDuJour from "./PlanningDuJour";
import Calendrier from "./Calendrier";
import Routines from "./Routines";
import './App.css';
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

export default function App() {
  const [goals, setGoals] = useState(INIT_GOALS);
  const [routines, setRoutines] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [view, setView] = useState(0);

  // DARK MODE
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);
  // ... après les useState et avant le return

  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // On récupère toutes les sous-tâches dont la deadline est aujourd'hui
    const todaySubtasks = [];
    goals.forEach((goal, gi) => {
      (goal.subtasks || []).forEach((st, si) => {
        if (st.deadline === todayStr) {
          todaySubtasks.push({
            label: st.label,
            done: st.done,
            goalIndex: gi,
            subIndex: si,
            isSubtask: true,
          });
        }
      });
    });

    // (À ce stade, si tu veux debugger ajoute un console.log ici)
    // console.log("Sous-tâches du jour :", todaySubtasks);

    setTasks(todaySubtasks);
  }, [goals]);

  // Ajoute routines du jour et sous-tâches deadline = aujourd'hui au planning du jour
  

  return (
    <div style={{ padding: 40 }}>
      {/* Bouton Dark/Light mode */}
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        style={{
          position: "fixed",
          top: 24,
          right: 36,
          zIndex: 100,
          background: "var(--color-card, #fff)",
          color: "var(--color-primary, #2186eb)",
          border: "none",
          borderRadius: 24,
          padding: "7px 18px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.09)",
          cursor: "pointer",
          fontWeight: 600
        }}
        aria-label="Basculer le thème"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

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
