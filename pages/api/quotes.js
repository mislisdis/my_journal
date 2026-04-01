import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/quotes.json");

export default function handler(req, res) {
  const quotes = JSON.parse(fs.readFileSync(filePath));
  res.status(200).json(quotes);
}
