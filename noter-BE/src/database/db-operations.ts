import { connection } from "../config/db.config.ts";
import type { ResultSetHeader } from "mysql2";

// INSERT DATA INTO THE DATABASE
export const insertNote = async (title: string, content: string) => {
  const [result] = await connection.execute<ResultSetHeader>(
    "INSERT INTO notes (title, content) VALUES (?,?)",
    [title, content],
  );
  return result;
};

// GET ALL NOTES FROM THE DATABASE

export const getNotes = async () => {
  const [rows] = await connection.execute("SELECT * FROM notes");
  return rows;
};

export const getNoteByID = async (id: number) => {
  const [rows] = await connection.execute("SELECT * FROM notes WHERE id = ?", [
    id,
  ]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

// update note in the database
export const updateNoteByID = async (id: number, title: string, content: string) => {
  const [result] = await connection.execute<ResultSetHeader>(
    "UPDATE notes SET title = ?, content = ? WHERE id = ?",
    [title, content, id],
  );
  return result;
};

// DELETE NOTE FROM THE DATABASE

export const deleteNoteByID = async (id: number) => {
  const [result] = await connection.execute<ResultSetHeader>("DELETE FROM notes WHERE id = ?", [
    id,
  ]);
  return result;
};
