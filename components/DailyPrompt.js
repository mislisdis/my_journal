import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function DailyPrompt() {
  const [prompt, setPrompt] = useState("");
  const [usedPrompts, setUsedPrompts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadNewPrompt();
  }, []);

  const loadNewPrompt = () => {
    fetch("/api/prompts")
      .then(res => res.json())
      .then(data => {
        // Filter out recently used prompts
        const availablePrompts = data.filter(p => !usedPrompts.includes(p));
        
        // If all prompts have been used, reset the used prompts list
        let randomPrompt;
        if (availablePrompts.length === 0) {
          setUsedPrompts([]);
          randomPrompt = data[Math.floor(Math.random() * data.length)];
        } else {
          randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
        }
        
        setPrompt(randomPrompt);
        
        // Add to used prompts (keep only last 10)
        setUsedPrompts(prev => {
          const newUsed = [...prev, randomPrompt];
          return newUsed.length > 10 ? newUsed.slice(1) : newUsed;
        });
      });
  };

  const shufflePrompt = () => {
    loadNewPrompt();
  };

  const usePrompt = () => {
    if (!prompt) return;

    // Format the prompt as a first sentence
    const promptAsSentence = formatPromptAsSentence(prompt);
    
    // Store the formatted prompt in localStorage for the journal page to use
    localStorage.setItem('currentPrompt', promptAsSentence);
    
    // Check if there are existing journals
    fetch("/api/journals")
      .then(res => res.json())
      .then(journals => {
        const journalList = journals.filter(j => j.type === "journal");
        
        if (journalList.length === 0) {
          // No journals exist, ask to create one first
          if (window.confirm("No journals found. Would you like to create a new journal first?")) {
            router.push("/?createJournal=true");
          }
        } else if (journalList.length === 1) {
          // Only one journal exists, use it
          const journal = journalList[0];
          router.push(`/journal/${journal.id}?prompt=${encodeURIComponent(promptAsSentence)}&asFirstSentence=true`);
        } else {
          // Multiple journals exist, show selection
          showJournalSelection(journalList, promptAsSentence);
        }
      });
  };

  // Helper function to format prompt as a proper first sentence
  const formatPromptAsSentence = (promptText) => {
    // If it's already a question or ends with punctuation, keep it as is
    if (promptText.trim().endsWith('?') || promptText.trim().endsWith('!') || promptText.trim().endsWith('.')) {
      return promptText;
    }
    
    // Otherwise, format it as a complete sentence
    // Check if it starts with a common prompt phrase
    const lowerPrompt = promptText.toLowerCase();
    if (lowerPrompt.startsWith('write about') || 
        lowerPrompt.startsWith('describe') ||
        lowerPrompt.startsWith('what') ||
        lowerPrompt.startsWith('how') ||
        lowerPrompt.startsWith('why') ||
        lowerPrompt.startsWith('when')) {
      // These are usually complete thoughts
      if (!promptText.endsWith('.')) {
        return promptText + '.';
      }
      return promptText;
    }
    
    // Default: add ellipsis to indicate continuation
    return promptText + '...';
  };

  const showJournalSelection = (journals, formattedPrompt) => {
    const journalListHTML = journals.map((journal, index) => 
      `<div class="journal-option" data-index="${index}">
        <strong>${journal.title}</strong><br>
        <small>${journal.entries?.length || 0} entries</small>
      </div>`
    ).join('');
    
    const modalHTML = `
      <div class="custom-modal-overlay">
        <div class="custom-modal">
          <h3>Select a Journal</h3>
          <p>Choose where to write your entry:</p>
          <div class="journal-list">${journalListHTML}</div>
          <div class="modal-buttons">
            <button class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    modalContainer.querySelectorAll('.journal-option').forEach(option => {
      option.addEventListener('click', () => {
        const index = parseInt(option.dataset.index);
        const journal = journals[index];
        router.push(`/journal/${journal.id}?prompt=${encodeURIComponent(formattedPrompt)}&asFirstSentence=true`);
        document.body.removeChild(modalContainer);
      });
    });
    
    modalContainer.querySelector('.cancel-btn').addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
    
    // Close when clicking overlay
    modalContainer.querySelector('.custom-modal-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('custom-modal-overlay')) {
        document.body.removeChild(modalContainer);
      }
    });
  };

  return (
    <div className="prompt-card">
      <h2>Daily Prompt</h2>
      <div className="prompt-content">
        {prompt || "Loading prompt..."}
      </div>
      <div className="action-buttons">
        <button className="use-prompt-btn" onClick={usePrompt}>
          ✍️ Use This Prompt
        </button>
        <button className="shuffle-btn" onClick={shufflePrompt}>
          🔄 New Prompt
        </button>
      </div>
      <div className="prompt-tip">
        Tip: This prompt will become the first sentence of your journal entry
      </div>
    </div>
  );
}