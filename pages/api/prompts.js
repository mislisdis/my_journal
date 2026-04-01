import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/prompts.json");

export default function handler(req, res) {
  const prompts = JSON.parse(fs.readFileSync(filePath));
  res.status(200).json(prompts);
}
