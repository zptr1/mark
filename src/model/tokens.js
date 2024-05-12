import { exec$ } from "../database.js";

export const SEPARATOR_TOKEN = "<|separator|>";

export const tokenIdMap = new Map();
export const tokenValueMap = new Map();

export async function loadTokens(){
  for (const token of await exec$(`select * from tokens`)) {
    tokenIdMap.set(token.id, token.value);
    tokenValueMap.set(token.value, token.id);
  }

  console.log("Loaded", tokenIdMap.size, "tokens");
}

export function tokenize(message) {
  return [SEPARATOR_TOKEN].concat(
    message
      .replace(/<\|separator\|>/g, "")
      .replace(/[()\[\]{}]/g, "")
      .replace(/[\x00-\x20\x7F-\xA0\u1680\u180E\u2000-\u200D\u2060\u2028-\u2029\u202F\u205F\u3000\uFEFF]/g, " ")
      .split(/\s+/g).filter((x) => x.length <= 255),
    SEPARATOR_TOKEN
  );
}
