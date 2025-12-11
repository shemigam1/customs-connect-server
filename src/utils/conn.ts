import { Connection, connect, connection } from "mongoose";
import { config } from "./config";
//create connection and export as a singleton
connect(config.DATABASE_URL, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

const conn: Connection = connection;

export default conn;
