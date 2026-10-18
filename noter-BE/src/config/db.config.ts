import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { exit } from "process";
dotenv.config();

export const connection = mysql.createPool({
  host: process.env.DB_HOST_NAME || "localhost",
  user: process.env.DB_USER_NAME || "root",
  password: process.env.DB_PASSWORD || "Jaydip@93",
  database: process.env.DB_NAME || "noter-DB",
});

export const connectToDatabase = () => {
  connection.getConnection()
    .then((conn) => {
      console.log("Connected to the database");
      conn.release();
    })
    .catch((err) => {
      console.error("Error connecting to the database:", err);
      exit(1);
    })
};
