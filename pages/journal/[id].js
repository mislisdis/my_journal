import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

export default function JournalPage() {
  const router = useRouter();
  const { id } = router.query;
  const [journal, setJournal] = useState(null);
  const [entryText, setEntryText] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetch("/api/journals")
      .then(res => res.json())
      .then(data => {
        const found = data.find(j => j.id === id);
        setJournal(found);
      });
    
    // Check for prompt in URL or localStorage
    const urlPrompt = router.query.prompt;
    const asFirstSentence = router.query.asFirstSentence === "true";
    const storedPrompt = localStorage.getItem('currentPrompt');
    
    if (urlPrompt) {
      const decodedPrompt = decodeURIComponent(urlPrompt);
      if (asFirstSentence) {
        // Set as first sentence in the text area
        setEntryText(decodedPrompt + " ");
      } else {
        setEntryText(decodedPrompt + "\n\n");
      }
      // Clear the URL parameters
      router.replace(`/journal/${id}`, undefined, { shallow: true });
    } else if (storedPrompt) {
      setEntryText(storedPrompt + " ");
      localStorage.removeItem('currentPrompt');
    }
  }, [id, router.query]);

  // Focus textarea when entryText changes (for when prompt is loaded)
  useEffect(() => {
    if (entryText && textareaRef.current) {
      // Set cursor at the end of the text
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(entryText.length, entryText.length);
    }
  }, [entryText]);

  const addEntry = async () => {
    if (!entryText.trim()) {
      alert("Please write something in your entry!");
      return;
    }

    const today = new Date().toISOString();
    const newEntry = { 
      id: Date.now().toString(), 
      date: today, 
      content: entryText,
      wordCount: entryText.trim().split(/\s+/).length
    };
    const updatedJournal = { 
      ...journal, 
      entries: [...(journal?.entries || []), newEntry] 
    };

    // Update JSON
    await fetch("/api/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedJournal)
    });

    setJournal(updatedJournal);
    setEntryText("");

    // Update streak
    await fetch("/api/streak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today.slice(0, 10) })
    });
    
    // Show success message
    alert("Entry saved successfully!");
  };

  const deleteEntry = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    
    const updatedEntries = journal.entries.filter(entry => entry.id !== entryId);
    const updatedJournal = { ...journal, entries: updatedEntries };

    await fetch("/api/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedJournal)
    });

    setJournal(updatedJournal);
  };

  const deleteJournal = async () => {
    if (!window.confirm("Are you sure you want to delete this entire journal? This action cannot be undone.")) {
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

  const filteredEntries = journal?.entries?.filter(entry => {
    // Apply search filter
    if (searchTerm && !entry.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply date filter
    if (filter !== "all") {
      const entryDate = new Date(entry.date);
      const today = new Date();
      const timeDiff = today - entryDate;
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      switch(filter) {
        case "today":
          return daysDiff === 0;
        case "week":
          return daysDiff <= 7;
        case "month":
          return daysDiff <= 30;
        default:
          return true;
      }
    }
    
    return true;
  });

  if (!journal) return <div className="loading">Loading...</div>;

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>{journal.title}</h1>
          <div className="date">Journal</div>
        </div>
        
        <ul className="sidebar-nav">
          <li className="sidebar-item active">
            <span className="sidebar-icon">📝</span>
            <span>All Entries</span>
          </li>
          <li className="sidebar-item">
            <span className="sidebar-icon">📊</span>
            <span>Stats</span>
          </li>
          <li className="sidebar-item delete-item" onClick={() => setShowDeleteConfirm(true)}>
            <span className="sidebar-icon">🗑️</span>
            <span>Delete Journal</span>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="journal-header">
          <h2>{journal.title}</h2>
          <div className="journal-actions">
            <button className="add-entry-btn" onClick={() => textareaRef.current?.focus()}>
              + New Entry
            </button>
          </div>
        </div>

        {/* Prompt Header if using a prompt */}
        {entryText && entryText.trim() && (
          <div className="prompt-header">
            <div className="prompt-label">✨ Writing from Prompt</div>
            <div className="prompt-text">
              Your prompt has been added as the first sentence. Continue writing...
            </div>
          </div>
        )}

        <div className="filter-search-container">
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <input
            type="text"
            className="search-input"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="entries-list">
          {filteredEntries?.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? "No entries found matching your search." : "No entries yet. Write your first one!"}
            </div>
          ) : (
            filteredEntries?.map(entry => (
              <div key={entry.id} className="entry-item">
                <div className="entry-header">
                  <div className="entry-date">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                  <button 
                    className="delete-entry-btn"
                    onClick={() => deleteEntry(entry.id)}
                    title="Delete entry"
                  >
                    ×
                  </button>
                </div>
                <div className="entry-content">
                  {entry.content}
                </div>
                <div className="entry-meta">
                  <span>{entry.wordCount} words</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="content-section new-entry-section">
          <h3>Write New Entry</h3>
          
          <textarea
            id="new-entry"
            ref={textareaRef}
            placeholder="Start writing your thoughts here..."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            rows="8"
          />
          
          <div className="entry-actions">
            <button className="use-prompt-btn" onClick={addEntry}>
              Save Entry
            </button>
            <div className="entry-stats">
              <span className="word-count">
                {entryText.trim().split(/\s+/).filter(word => word.length > 0).length} words
              </span>
              {entryText.trim().length > 0 && (
                <span className="writing-tip">✍️ Keep writing!</span>
              )}
            </div>
          </div>
          
          {/* Quick action buttons */}
          <div className="quick-actions">
            <button 
              className="quick-action-btn"
              onClick={() => setEntryText(prev => prev + "\n\nToday I felt... ")}
            >
              + Feeling
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => setEntryText(prev => prev + "\n\nI'm grateful for... ")}
            >
              + Gratitude
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => setEntryText(prev => prev + "\n\nTomorrow I want to... ")}
            >
              + Goal
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Delete Journal</h2>
              <p>Are you sure you want to delete "{journal.title}"? This will permanently delete all {journal.entries?.length || 0} entries.</p>
              <p className="warning-text">This action cannot be undone!</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="delete-confirm-btn" onClick={deleteJournal}>
                  Delete Journal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}