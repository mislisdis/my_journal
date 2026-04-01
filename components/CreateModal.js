import { useState } from "react";

export default function CreateModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("journal");

  if (!isOpen) return null; // <-- Important: prevents overlay from existing when closed

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    const newItem = {
      title,
      type,
      entries: type === "journal" ? [] : undefined,
      todos: type === "todo" ? [] : undefined,
    };

    const res = await fetch("/api/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    const data = await res.json();
    onCreate(data);
    setTitle("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal show">
        <h2>Create New {type === "journal" ? "Journal" : "To-Do List"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Type:
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="journal">Journal</option>
              <option value="todo">To-Do List</option>
            </select>
          </label>
          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </label>
          <button type="submit">Create</button>
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
