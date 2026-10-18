import express from "express";
import notesController from "../controllers/notes.controller.ts";
const router = express.Router();

router.post("/create", notesController.createNote);
router.get("/all", notesController.getAllNotes);
router.delete("/delete/:id", notesController.deleteNote);
router.put("/update/:id", notesController.updateNote);

export default router;
