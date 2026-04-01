import { useEffect, useState } from "react";
import DailyPrompt from "../components/DailyPrompt";
import JournalCard from "../components/JournalCard";
import CreateModal from "../components/CreateModal";
import DailyQuote from "../components/DailyQuote";
import StreakBadge from "../components/StreakBadge";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  const [journals, setJournals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({
    wordCount: 0,
    longestStreak: 0,
    totalEntries: 0,
    totalJournals: 0,
    totalTodos: 0
  });
  const [activeSection, setActiveSection] = useState("streak");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchJournals();
    fetchStreak();
    fetchStats();
  }, []);

  const fetchJournals = () => {
    fetch("/api/journals")
      .then(res => res.json())
      .then(data => setJournals(data));
  };

  const fetchStreak = () => {
    fetch("/api/streak")
      .then(res => res.json())
      .then(data => setStreak(data.streak));
  };

  const fetchStats = () => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {
        // Fallback stats calculation
        const wordCount = journals.reduce((sum, journal) => {
          if (journal.type === "journal" && journal.entries) {
            return sum + journal.entries.reduce((entrySum, entry) => 
              entrySum + (entry.content?.split(/\s+/).length || 0), 0
            );
          }
          return sum;
        }, 0);
        
        const totalEntries = journals.reduce((sum, journal) => 
          sum + (journal.entries?.length || 0), 0
        );
        
        setStats({
          wordCount,
          longestStreak: streak,
          totalEntries,
          totalJournals: journals.filter(j => j.type === "journal").length,
          totalTodos: journals.filter(j => j.type === "todo").length
        });
      });
  };

  const handleCreate = (newItem) => {
    setJournals([...journals, newItem]);
    fetchStats(); // Refresh stats
  };

  const handleDeleteJournal = async (journalId) => {
    if (!window.confirm("Are you sure you want to delete this? This action cannot be undone.")) return;

    const response = await fetch("/api/journals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: journalId })
    });

    if (response.ok) {
      // Remove from local state
      setJournals(journals.filter(j => j.id !== journalId));
      fetchStats(); // Refresh stats
    }
  };

  const filteredJournals = (type) => {
    let filtered = journals.filter(j => j.type === type);
    
    if (searchTerm) {
      filtered = filtered.filter(journal => 
        journal.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Function to generate dynamic calendar based on current date
  const generateCalendar = () => {
    const today = new Date();
    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const calendarDays = [];
    
    // Get the day of week for today (0 = Sunday, 1 = Monday, etc.)
    const todayDayOfWeek = today.getDay(); // 0-6
    
    // Convert to our system where Monday = 0
    // Sunday (0) becomes 6, Monday (1) becomes 0, Tuesday (2) becomes 1, etc.
    const mondayBasedDay = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
    
    // Generate days for the current week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      // Calculate date for this position in the calendar
      // i=0 is Monday, i=6 is Sunday
      date.setDate(today.getDate() - mondayBasedDay + i);
      const dayNumber = date.getDate();
      
      // Check if this date has any journal entries
      const hasEntry = journals.some(journal => {
        if (journal.type === "journal" && journal.entries) {
          return journal.entries.some(entry => {
            try {
              const entryDate = new Date(entry.date);
              return entryDate.toDateString() === date.toDateString();
            } catch {
              return false;
            }
          });
        }
        return false;
      });
      
      const isToday = date.toDateString() === today.toDateString();
      
      calendarDays.push({
        label: daysOfWeek[i],
        number: dayNumber,
        active: hasEntry,
        today: isToday
      });
    }
    
    return calendarDays;
  };

  const calendarDays = generateCalendar();

  const renderContent = () => {
    switch(activeSection) {
      case "streak":
        return (
          <div className="content-section">
            <h2>Streak & Stats</h2>
            <div className="streak-container">
              <div className="streak-calendar">
                <div className="streak-count">{streak} Days</div>
                <div className="calendar">
                  {calendarDays.map((day, index) => (
                    <div key={index} className="day-label">{day.label}</div>
                  ))}
                  {calendarDays.map((day, index) => (
                    <div 
                      key={index} 
                      className={`day ${day.active ? 'active' : ''} ${day.today ? 'today' : ''}`}
                      title={day.active ? "Has journal entry" : "No entry"}
                    >
                      {day.number}
                    </div>
                  ))}
                </div>
                <div className="calendar-legend">
                  <div className="legend-item">
                    <div className="legend-color active"></div>
                    <span>Has Entry</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color today"></div>
                    <span>Today</span>
                  </div>
                </div>
                <StreakBadge streak={streak} />
              </div>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.wordCount}</div>
                  <div className="stat-label">Word Count</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.longestStreak}</div>
                  <div className="stat-label">Longest Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalEntries}</div>
                  <div className="stat-label">Total Entries</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalJournals}</div>
                  <div className="stat-label">Journals</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalTodos}</div>
                  <div className="stat-label">To-Do Lists</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{journals.length}</div>
                  <div className="stat-label">Total Items</div>
                </div>
              </div>
            </div>
          </div>
        );
      case "prompts":
        return (
          <div className="content-section">
            <DailyPrompt />
          </div>
        );
      case "quotes":
        return (
          <div className="content-section">
            <DailyQuote />
          </div>
        );
      case "journals":
        return (
          <div className="content-section">
            <div className="journals-header">
              <h2>My Journals</h2>
              <div className="header-controls">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search journals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="create-journal-btn" onClick={() => setIsModalOpen(true)}>
                  <span>+</span> Create Journal
                </button>
              </div>
            </div>
            <div className="journals-grid">
              {filteredJournals("journal").length === 0 ? (
                <div className="empty-state">
                  {searchTerm 
                    ? "No journals found matching your search." 
                    : "No journals yet. Create your first one!"
                  }
                </div>
              ) : (
                filteredJournals("journal").map(journal => (
                  <JournalCard 
                    key={journal.id} 
                    journal={journal} 
                    onDelete={handleDeleteJournal}
                  />
                ))
              )}
            </div>
          </div>
        );
      case "todo":
        return (
          <div className="content-section">
            <div className="journals-header">
              <h2>To-Do Lists</h2>
              <div className="header-controls">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search to-do lists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="create-journal-btn" onClick={() => setIsModalOpen(true)}>
                  <span>+</span> Create To-Do List
                </button>
              </div>
            </div>
            <div className="journals-grid">
              {filteredJournals("todo").length === 0 ? (
                <div className="empty-state">
                  {searchTerm 
                    ? "No to-do lists found matching your search." 
                    : "No to-do lists yet. Create your first one!"
                  }
                </div>
              ) : (
                filteredJournals("todo").map(journal => (
                  <JournalCard 
                    key={journal.id} 
                    journal={journal} 
                    onDelete={handleDeleteJournal}
                  />
                ))
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Journal App</h1>
          <div className="date">{new Date().toLocaleDateString()}</div>
        </div>
        
        <ul className="sidebar-nav">
          <li 
            className={`sidebar-item ${activeSection === 'streak' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('streak');
              setSearchTerm('');
            }}
          >
            <span className="sidebar-icon">🔥</span>
            <span>Streak & Stats</span>
          </li>
          <li 
            className={`sidebar-item ${activeSection === 'prompts' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('prompts');
              setSearchTerm('');
            }}
          >
            <span className="sidebar-icon">💡</span>
            <span>Daily Prompts</span>
          </li>
          <li 
            className={`sidebar-item ${activeSection === 'quotes' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('quotes');
              setSearchTerm('');
            }}
          >
            <span className="sidebar-icon">🌟</span>
            <span>Daily Quotes</span>
          </li>
          <li 
            className={`sidebar-item ${activeSection === 'journals' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('journals');
              setSearchTerm('');
            }}
          >
            <span className="sidebar-icon">📓</span>
            <span>Journals</span>
            <span className="sidebar-badge">{stats.totalJournals}</span>
          </li>
          <li 
            className={`sidebar-item ${activeSection === 'todo' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('todo');
              setSearchTerm('');
            }}
          >
            <span className="sidebar-icon">✓</span>
            <span>To-Do Lists</span>
            <span className="sidebar-badge">{stats.totalTodos}</span>
          </li>
        </ul>
        
        <div className="sidebar-footer">
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="quick-stat-label">Current</span>
              <span className="quick-stat-value">{streak}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-label">Total</span>
              <span className="quick-stat-value">{journals.length}</span>
            </div>
          </div>
          <div className="theme-toggle">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderContent()}
      </div>

      <CreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}