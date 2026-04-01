import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/journals.json");

export default function handler(req, res) {
  if (req.method === "GET") {
    const data = JSON.parse(fs.readFileSync(filePath));
    res.status(200).json(data);
  } else if (req.method === "POST") {
    const journals = JSON.parse(fs.readFileSync(filePath));
    
    // Check if this is an update (contains id) or new journal
    if (req.body.id) {
      // Update existing journal
      const index = journals.findIndex(j => j.id === req.body.id);
      if (index !== -1) {
        journals[index] = req.body;
        fs.writeFileSync(filePath, JSON.stringify(journals, null, 2));
        res.status(200).json(req.body);
      } else {
        res.status(404).json({ message: "Journal not found" });
      }
    } else {
      // Create new journal
      const newJournal = { 
        id: Date.now().toString(), 
        createdAt: new Date().toISOString(),
        ...req.body 
      };
      journals.push(newJournal);
      fs.writeFileSync(filePath, JSON.stringify(journals, null, 2));
      res.status(201).json(newJournal);
    }
  } else if (req.method === "DELETE") {
    const { id } = req.body;
    let journals = JSON.parse(fs.readFileSync(filePath));
    
    const initialLength = journals.length;
    journals = journals.filter(journal => journal.id !== id);
    
    if (journals.length < initialLength) {
      fs.writeFileSync(filePath, JSON.stringify(journals, null, 2));
      res.status(200).json({ message: "Journal deleted successfully", deletedId: id });
    } else {
      res.status(404).json({ message: "Journal not found" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}