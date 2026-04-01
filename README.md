
# Journal / Diary Web Application

## Overview

This is a **Next.js-based Journal Web Application** that allows users to create, view, and manage daily journal entries, prompts, quotes, and personal reflections in a clean and interactive interface.

The project is designed to encourage consistent journaling through a minimal, engaging UI with features like daily prompts, streak tracking, and motivational quotes.

No authentication is required in this version, as login functionality is intended for future enhancement.

---

## Features

### Core Journal Features

* Create, view, and manage journal entries
* Individual journal entry pages (`/journal/[id]`)
* Entry organization and structured storage using JSON

### Productivity & Engagement

* Daily prompts to inspire writing
* Daily motivational quotes
* Streak tracking system to encourage consistency
* Todo-style journaling support (reflection + tasks)

###  UI / UX Features

* Reusable component-based architecture
* Modal-based entry creation (`CreateModal`)
* Theme switching (light/dark mode)
* Clean and responsive design
* Header navigation and intuitive layout

---

## Tech Stack

* **Framework:** Next.js (Pages Router)
* **Language:** JavaScript
* **Styling:** CSS (global styles)
* **State Management:** React Context API
* **Data Storage:** JSON files (file-based storage)
* **Utilities:** Custom helper functions (e.g., confetti effects)

---

## 📂 Project Structure

```
components/
├── CreateModal.js
├── DailyPrompt.js
├── DailyQuote.js
├── EntryCard.js
├── Header.js
├── JournalCard.js
├── StreakBadge.js
├── ThemeToggle.js

contexts/
├── (React context providers for global state)

data/
├── journals.json
├── prompts.json
├── quotes.json
├── streak.json

pages/
├── index.js
├── _app.js
│
├── api/
│   ├── journals.js
│   ├── prompts.js
│   ├── quotes.js
│   ├── stats.js
│   ├── streak.js
│
├── journal/
│   ├── [id].js
│
├── todo/
│   ├── [id].js

public/

src/

styles/
├── globals.css

utils/
├── confetti.js

node_modules/
```

---

## ⚙️ How to Run the Project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/my_journal.git
cd my_journal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

### 4. Open in browser

```
http://localhost:3000
```

---

## Key Learning Outcomes

This project demonstrates:

* Building a full-featured **Next.js application**
* Creating reusable React components
* Managing application state using Context API
* Working with **API routes in Next.js**
* Handling JSON-based persistent data storage
* Designing modular and scalable frontend architecture
* Enhancing UX with motivational and gamified features (streaks, quotes, prompts)

---

## Future Improvements

* Add user authentication (login/signup system)
* Migrate JSON storage to a database (MongoDB/PostgreSQL)
* Improve mobile responsiveness and PWA support
* Add search and filtering for journal entries
* Add tags, categories, and mood tracking
* Add analytics dashboard for writing habits

---

## Author

**Lisa Adisa Magada**


---

## 📄 License

This project is for educational and portfolio purposes.


