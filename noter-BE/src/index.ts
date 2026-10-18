import express from "express";
import { connectToDatabase } from "./config/db.config.ts";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", (await import("./routes/index.route.ts")).default);

app.listen(3000, () => {
  connectToDatabase();
  console.log("Server is running on port 3000");
});
