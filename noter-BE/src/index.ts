import express from "express";
import { connectToDatabase } from "./config/db.config.ts";

const app = express();

app.listen(3000, () => {
  connectToDatabase();
  console.log("Server is running on port 3000");
});
