import mysql from "mysql2";
import dotenv from "dotenv";
import { exit } from "process";
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST_NAME || "localhost",
  user: process.env.DB_USER_NAME || "root",
  password: process.env.DB_PASSWORD || "Jaydip@93",
  database: process.env.DB_NAME || "noter-DB",
});

export const connectToDatabase = () => {
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      exit(1); // Exit the process with an error code
    }
    console.log("Connected to the database");
  });
};
