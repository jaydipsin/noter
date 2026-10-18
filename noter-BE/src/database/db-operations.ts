import { connection } from "../config/db.config.ts";

// INSERT DATA INTO THE DATABASE
export const insertNote = async (title: string, content: string) => {
  const [result] = await connection.execute(
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

// DELETE NOTE FROM THE DATABASE

export const deleteNoteByID = async (id: number) => {
  const [result] = await connection.execute("DELETE FROM notes WHERE id = ?", [
    id,
  ]);
  return result;
};
