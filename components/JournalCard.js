import { useState } from "react";

export default function JournalCard({ journal, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${journal.title}"? This action cannot be undone.`)) {
      onDelete(journal.id);
    }
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking delete button
    if (e.target.closest('.delete-journal-btn')) {
      return;
    }
    
    const path = journal.type === "journal" ? `/journal/${journal.id}` : `/todo/${journal.id}`;
    window.location.href = path;
  };

  return (
    <div className="journal-item" onClick={handleCardClick}>
      <div className="journal-header">
        <h3 className="journal-title">{journal.title}</h3>
        <button 
          className="delete-journal-btn"
          onClick={handleDelete}
          onMouseEnter={() => setShowDelete(true)}
          onMouseLeave={() => setShowDelete(false)}
          title="Delete"
        >
          {showDelete ? "🗑️" : "×"}
        </button>
      </div>
      
      <div className="journal-meta">
        <span className="journal-type">
          {journal.type === "journal" ? "📓 Journal" : "✓ To-Do List"}
        </span>
        <span>
          {journal.type === "journal" 
            ? `${journal.entries?.length || 0} entries`
            : `${journal.todos?.filter(t => t?.completed).length || 0}/${journal.todos?.length || 0} completed`
          }
        </span>
      </div>
      
      <div className="journal-date">
        {journal.createdAt ? new Date(journal.createdAt).toLocaleDateString() : "Recently"}
      </div>
    </div>
  );
}