import React, { useState } from "react";

const urgencesTxt = ["faible", "modérée", "normale", "haute", "critique"];
const urgencesColor = ["#80bfff", "#a0c96b", "#ffd766", "#ffb347", "#e05c5c"];
const emojis = ["🎯", "🔥", "💪", "⭐", "🚀", "🎉"];

const IconEdit = () => <span style={{ cursor: "pointer", color: "#2186eb", fontWeight: "bold" }}>✏️</span>;
const IconDelete = () => <span style={{ cursor: "pointer", color: "#d13a3a", fontWeight: "bold" }}>🗑️</span>;

export default function SousTacheEditable({ subtask, onUpdate, onDelete, onToggleDone }) {
  const [editMode, setEditMode] = useState(false);
  const [label, setLabel] = useState(subtask.label);
  const [urgency, setUrgency] = useState(subtask.urgency || 3);
  const [deadline, setDeadline] = useState(subtask.deadline || "");
  const [benefit, setBenefit] = useState(subtask.benefit || "");
  const [danger, setDanger] = useState(subtask.danger || "");
  const [emoji, setEmoji] = useState(subtask.emoji || "🎯");

  function save() {
    if (!label.trim()) return alert("Le label ne peut pas être vide");
    onUpdate({ label, urgency, deadline, benefit, danger, emoji });
    setEditMode(false);
  }
  function cancel() {
    setLabel(subtask.label);
    setUrgency(subtask.urgency || 3);
    setDeadline(subtask.deadline || "");
    setBenefit(subtask.benefit || "");
    setDanger(subtask.danger || "");
    setEmoji(subtask.emoji || "🎯");
    setEditMode(false);
  }

  if (!editMode) {
    return (
      <div
        style={{
          borderLeft: `4px solid ${urgencesColor[urgency - 1] || "#e0e0e0"}`,
          background: "#fff",
          borderRadius: 6,
          padding: 10,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
          userSelect: "none"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <input 
            type="checkbox" 
            checked={subtask.done} 
            onChange={onToggleDone} 
            style={{ transform: "scale(1.3)" }}
          />
          <span style={{
            fontSize: 18,
            userSelect: "none",
            textDecoration: subtask.done ? "line-through" : "none",
            color: subtask.done ? "#888" : "#000"
          }}>{emoji}</span>
          <div style={{ 
            flex: 1, 
            userSelect: "none",
            textDecoration: subtask.done ? "line-through" : "none",
            color: subtask.done ? "#888" : "#000"
          }}>
            <div style={{ fontWeight: "bold", fontSize: 15 }}>{label}</div>
            {deadline && <div style={{ fontSize: 12, fontStyle: "italic" }}>📅 {new Date(deadline).toLocaleDateString("fr-FR")}</div>}
            <div style={{ fontSize: 12, color: "#555" }}>Urgence : {urgencesTxt[urgency - 1]}</div>
            {benefit && <div style={{ fontSize: 12, color: "#2186eb" }}>👍 {benefit}</div>}
            {danger && <div style={{ fontSize: 12, color: "#d13a3a" }}>⚠️ {danger}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <span onClick={() => setEditMode(true)} title="Modifier sous-tâche"><IconEdit /></span>
          <span onClick={onDelete} title="Supprimer sous-tâche"><IconDelete /></span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        save();
      }}
      style={{
        borderLeft: `4px solid ${urgencesColor[urgency - 1] || "#e0e0e0"}`,
        background: "#f7faff",
        borderRadius: 6,
        padding: 10,
        marginBottom: 8,
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      <select value={emoji} onChange={e => setEmoji(e.target.value)} style={{ fontSize: 18, padding: 2 }}>
        {emojis.map(em => (
          <option key={em} value={em}>{em}</option>
        ))}
      </select>
      <input
        type="text"
        value={label}
        onChange={e => setLabel(e.target.value)}
        style={{ flexGrow: 1, minWidth: 120, padding: 4 }}
        required
      />
      <select value={urgency} onChange={e => setUrgency(Number(e.target.value))}>
        {urgencesTxt.map((txt, i) => (
          <option key={i} value={i + 1}>{txt}</option>
        ))}
      </select>
      <input
        type="date"
        value={deadline}
        onChange={e => setDeadline(e.target.value)}
        style={{ minWidth: 130 }}
      />
      <input
        placeholder="Bénéfice"
        value={benefit}
        onChange={e => setBenefit(e.target.value)}
        style={{ flex: "1 1 120px" }}
      />
      <input
        placeholder="Danger"
        value={danger}
        onChange={e => setDanger(e.target.value)}
        style={{ flex: "1 1 120px" }}
      />
      <button type="submit" style={{ fontWeight: "bold", background: "#2186eb", color: "#fff", border: "none", borderRadius: 6, padding: "0 20px", cursor: "pointer" }}>
        Enregistrer
      </button>
      <button
        type="button"
        onClick={cancel}
        style={{ marginLeft: 6, background: "#fbb", border: "none", borderRadius: 6, cursor: "pointer", padding: "0 20px", fontWeight: "bold" }}
      >
        Annuler
      </button>
    </form>
  );
}
