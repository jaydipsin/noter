import type { Request, Response } from "express";
import {
  insertNote,
  getNotes,
  deleteNoteByID,
} from "../database/db-operations.ts";

const createNote = async (req: Request, res: Response) => {
  const { title, content } = req.body;

  try {
    const result = await insertNote(title, content);
    res
      .status(201)
      .json({ message: "Note created successfully", noteId: result });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Error creating note" });
  }
};

const getAllNotes = async (req: Request, res: Response) => {
  try {
    const result = await getNotes();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Error fetching notes" });
  }
};

const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    const result = await deleteNoteByID(parseInt(id));
    res
      .status(200)
      .json({ message: "Note deleted successfully", noteId: result });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Error deleting note" });
  }
};

const updateNote = async (req: Request, res: Response) => {
    // try{} cathch (error) {
}

export default {
  createNote,
  getAllNotes,
  deleteNote,
};
