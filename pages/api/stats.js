import fs from "fs";
import path from "path";

const journalsPath = path.join(process.cwd(), "data/journals.json");

export default function handler(req, res) {
  const journals = JSON.parse(fs.readFileSync(journalsPath));
  
  let wordCount = 0;
  let totalEntries = 0;
  
  journals.forEach(journal => {
    if (journal.entries) {
      totalEntries += journal.entries.length;
      journal.entries.forEach(entry => {
        wordCount += (entry.content || "").trim().split(/\s+/).length;
      });
    }
  });
  
  // For longest streak, you might want to calculate from streak data
  const stats = {
    wordCount,
    totalEntries,
    longestStreak: 7, // This should be calculated from your streak data
    totalJournals: journals.filter(j => j.type === "journal").length,
    totalTodos: journals.filter(j => j.type === "todo").length
  };
  
  res.status(200).json(stats);
}