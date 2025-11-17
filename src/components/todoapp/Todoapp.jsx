import React, { useEffect, useState, useRef } from "react";
import "./App.css";

export default function TodoApp() {
  // Todo shape: { id, text, completed }
  const [todos, setTodos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fm-todos")) || [];
    } catch (e) {
      return [];
    }
  });
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("fm-theme") || "dark";
  });
  const draggedIndex = useRef(null);

  useEffect(() => {
    localStorage.setItem("fm-todos", JSON.stringify(todos));
  }, [todos]);
  useEffect(() => {
    localStorage.setItem("fm-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function addTodo(e) {
    e?.preventDefault?.();
    const val = text.trim();
    if (!val) return;
    setTodos((prev) => [
      { id: Date.now(), text: val, completed: false },
      ...prev,
    ]);
    setText("");
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }
  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }
  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  function handleDragStart(e, index) {
    draggedIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  }
  function handleDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const dragFrom = draggedIndex.current;
    const dragTo = index;
    if (dragFrom === null || dragFrom === dragTo) return;
    // Reorder visually while dragging
    setTodos((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(dragFrom, 1);
      copy.splice(dragTo, 0, moved);
      draggedIndex.current = dragTo;
      return copy;
    });
  }
  function handleDragEnd(e) {
    e.currentTarget.classList.remove("dragging");
    draggedIndex.current = null;
  }

  return (
    <div className="app-wrap">
      <div className="hero">
        <div
          className="top-hero"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#6d28d9,#0ea5a4)"
                : "linear-gradient(135deg,#7c3aed,#06b6d4)",
          }}
        >
          <div className="brand">TODO</div>
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        <div className="input-card">
          <form onSubmit={addTodo} className="new-todo">
            <div
              className="checkbox"
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                border: "2px solid rgba(0,0,0,0.06)",
              }}
            ></div>
            <input
              className="new-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Create a new todo..."
            />
          </form>

          <div className="todo-list" role="list" aria-label="Todo list">
            {filtered.length === 0 && (
              <div style={{ padding: "1rem 1rem", color: "var(--muted)" }}>
                No todos
              </div>
            )}
            {filtered.map((t, idx) => (
              <div
                key={t.id}
                className={"todo-item" + (t.completed ? " completed" : "")}
                draggable
                onDragStart={(e) => handleDragStart(e, todos.indexOf(t))}
                onDragOver={(e) => handleDragOver(e, todos.indexOf(t))}
                onDragEnd={handleDragEnd}
                role="listitem"
              >
                <div
                  className="checkbox"
                  onClick={() => toggleTodo(t.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {t.completed ? "✔️" : ""}
                </div>
                <div
                  className="text"
                  style={{
                    textDecoration: t.completed ? "line-through" : "none",
                    color: "var(--muted)",
                  }}
                >
                  {t.text}
                </div>
                <button
                  className="delete"
                  aria-label={`Delete ${t.text}`}
                  onClick={() => deleteTodo(t.id)}
                >
                  ✖
                </button>
              </div>
            ))}

            <div className="filters">
              <div style={{ fontSize: ".9rem" }}>
                {todos.filter((x) => !x.completed).length} items left
              </div>
              <div className="filter-tabs">
                <button
                  className={"filter-btn" + (filter === "all" ? " active" : "")}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  className={
                    "filter-btn" + (filter === "active" ? " active" : "")
                  }
                  onClick={() => setFilter("active")}
                >
                  Active
                </button>
                <button
                  className={
                    "filter-btn" + (filter === "completed" ? " active" : "")
                  }
                  onClick={() => setFilter("completed")}
                >
                  Completed
                </button>
              </div>
              <div className="controls">
                <button className="filter-btn" onClick={clearCompleted}>
                  Clear Completed
                </button>
              </div>
            </div>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "1rem",
            color: "var(--muted)",
          }}
        >
          Drag and drop to reorder list
        </p>
      </div>
    </div>
  );
}
