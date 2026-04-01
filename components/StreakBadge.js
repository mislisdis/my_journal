import { useEffect } from "react";
import { launchConfetti } from "../utils/confetti";

export default function StreakBadge({ streak }) {
  let message = "";

  if (streak >= 30) message = "🏆 30-Day Champion!";
  else if (streak >= 14) message = "🎉 2-Week Streak!";
  else if (streak >= 7) message = "🔥 1-Week Streak!";
  else if (streak >= 3) message = "💪 Keep it up!";
  else if (streak >= 1) message = "👍 Good start!";

  // Trigger confetti on milestone
  useEffect(() => {
    if ([3, 7, 14, 30].includes(streak)) {
      launchConfetti();
    }
  }, [streak]);

  if (!message) return null;

  return (
    <div className="streak-badge">
      <p>{message}</p>
    </div>
  );
}
