import config from "../config.json" assert { type: "json" };
import { loadTokens } from "./model/tokens.js";
import { readFileSync } from "fs";
import pg from "pg";

const pool = new pg.Pool(config.database);

/** @returns {Promise<any[]>} */
export async function exec$(query, values=[]) {
  return (await pool.query(query, values)).rows;
}

/** @returns {Promise<any>} */
export async function fetch$(query, values=[]) {
  return (await pool.query(query, values)).rows[0];
}

pool.query(
  readFileSync("data/setup.psql", "utf-8")
).then(() => {
  console.log("Database successfully initialized");
  loadTokens();
});
