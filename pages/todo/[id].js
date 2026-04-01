import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function TodoPage() {
  const router = useRouter();
  const { id } = router.query;
  const [todoList, setTodoList] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch("/api/journals")
      .then(res => res.json())
      .then(data => {
        const found = data.find(j => j.id === id);
        if (found) {
          setTodoList(found);
          setTodos(found.todos || []);
        }
      });
  }, [id]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    const newTaskItem = {
      id: Date.now().toString(),
      task: newTask,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedTodos = [...todos, newTaskItem];
    setTodos(updatedTodos);
    
    if (todoList) {
      const updatedList = { 
        ...todoList, 
        todos: updatedTodos,
        updatedAt: new Date().toISOString()
      };
      
      await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      
      setTodoList(updatedList);
    }
    
    setNewTask("");
  };

  const toggleTask = async (taskId) => {
    const updatedTodos = todos.map(todo => 
      todo.id === taskId ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    
    if (todoList) {
      const updatedList = { 
        ...todoList, 
        todos: updatedTodos,
        updatedAt: new Date().toISOString()
      };
      
      await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      
      setTodoList(updatedList);
    }
  };

  const deleteTask = async (taskId) => {
    const updatedTodos = todos.filter(todo => todo.id !== taskId);
    setTodos(updatedTodos);
    
    if (todoList) {
      const updatedList = { 
        ...todoList, 
        todos: updatedTodos,
        updatedAt: new Date().toISOString()
      };
      
      await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      
      setTodoList(updatedList);
    }
  };

  const deleteTodoList = async () => {
    if (!window.confirm("Are you sure you want to delete this to-do list? This will permanently delete all tasks.")) {
      setShowDeleteConfirm(false);
      return;
    }

    await fetch("/api/journals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    router.push("/"); // Redirect to home page
  };

  const filteredTodos = todos.filter(todo => {
    const taskText = todo.task || "";
    if (searchTerm && !taskText.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  if (!todoList) return <div className="loading">Loading To-Do List...</div>;

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>{todoList.title}</h1>
          <div className="date">To-Do List</div>
        </div>
        
        <ul className="sidebar-nav">
          <li 
            className={`sidebar-item ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="sidebar-icon">📋</span>
            <span>All Tasks ({totalCount})</span>
          </li>
          <li 
            className={`sidebar-item ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            <span className="sidebar-icon">⏳</span>
            <span>Active ({totalCount - completedCount})</span>
          </li>
          <li 
            className={`sidebar-item ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            <span className="sidebar-icon">✅</span>
            <span>Completed ({completedCount})</span>
          </li>
          <li className="sidebar-item delete-item" onClick={() => setShowDeleteConfirm(true)}>
            <span className="sidebar-icon">🗑️</span>
            <span>Delete List</span>
          </li>
        </ul>
        
        <div className="stats-sidebar">
          <div className="stat-sidebar">
            <div className="stat-value-sidebar">{totalCount}</div>
            <div className="stat-label-sidebar">Total Tasks</div>
          </div>
          <div className="stat-sidebar">
            <div className="stat-value-sidebar">{completedCount}</div>
            <div className="stat-label-sidebar">Completed</div>
          </div>
          <div className="stat-sidebar">
            <div className="stat-value-sidebar">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </div>
            <div className="stat-label-sidebar">Progress</div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="todo-header">
          <h2>{todoList.title}</h2>
          <div className="todo-stats">
            <span className="todo-stat">{completedCount}/{totalCount} completed</span>
          </div>
        </div>

        <div className="todo-controls">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="add-todo-form">
            <input
              type="text"
              className="todo-input"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <button className="add-todo-btn" onClick={addTask}>
              Add Task
            </button>
          </div>
        </div>

        <div className="todos-container">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? "No tasks found matching your search." : "No tasks yet. Add one above!"}
            </div>
          ) : (
            filteredTodos.map(todo => (
              <div key={todo.id} className="todo-item">
                <div 
                  className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                  onClick={() => toggleTask(todo.id)}
                >
                  {todo.completed ? '✓' : ''}
                </div>
                <div className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                  {todo.task}
                </div>
                <button 
                  className="delete-todo-btn"
                  onClick={() => deleteTask(todo.id)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {totalCount > 0 && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {completedCount} of {totalCount} tasks completed
              ({Math.round((completedCount / totalCount) * 100)}%)
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Delete To-Do List</h2>
              <p>Are you sure you want to delete "{todoList.title}"? This will permanently delete all {totalCount} tasks.</p>
              <p className="warning-text">This action cannot be undone!</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="delete-confirm-btn" onClick={deleteTodoList}>
                  Delete List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}