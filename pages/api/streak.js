import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/streak.json");

export default function handler(req, res) {
  let streakData = JSON.parse(fs.readFileSync(filePath));

  if (req.method === "GET") {
    res.status(200).json(streakData);
  } else if (req.method === "POST") {
    const { date } = req.body; // date in YYYY-MM-DD format
    const lastDate = streakData.lastEntryDate;

    let streak = streakData.streak;

    if (!lastDate) {
      streak = 1; // first entry
    } else {
      const last = new Date(lastDate);
      const current = new Date(date);
      const diff = (current - last) / (1000 * 60 * 60 * 24);

      if (diff === 1) streak += 1;       // consecutive day
      else if (diff > 1) streak = 1;     // missed days, reset streak
      // diff < 1 (same day) → streak unchanged
    }

    streakData = { lastEntryDate: date, streak };
    fs.writeFileSync(filePath, JSON.stringify(streakData, null, 2));
    res.status(200).json(streakData);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
