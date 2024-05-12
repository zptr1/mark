import { tokenIdMap, tokenValueMap, tokenize } from "./tokens.js";
import { exec$, fetch$ } from "../database.js";

export async function addToken(token) {
  const { id } = await fetch$(`insert into tokens (value) values ($1) returning id`, [token]);

  tokenIdMap.set(id, token);
  tokenValueMap.set(token, id);
  
  return id;
}

export async function addPair(userId, currentToken, nextToken) {
  // Since all messages start with the separator token, which is guaranteed to exist in the database,
  // we do not need to check if currentToken exists because it is the previous nextToken
  if (!tokenValueMap.has(nextToken)) await addToken(nextToken);

  await exec$(`
    insert into pairs values (
      default, $1, $2, $3, 1
    ) on conflict (
      uid, current_token, next_token
    ) do update set freq=pairs.freq + 1
  `, [
    userId, tokenValueMap.get(currentToken), tokenValueMap.get(nextToken)
  ]);
}

export async function addMessage(userId, message) {
  const tokens = tokenize(message);

  // every message starts and ends with SEPARATOR_TOKEN, so empty messages are 2 tokens long.
  if (tokens.length <= 2) return;

  for (let i = 0; i < tokens.length - 1; i++) {
    await addPair(userId, tokens[i], tokens[i + 1]);
  }
}

/** @returns {Promise<number>} */
export async function nextToken(userId, currentToken, cache=new Map()) {
  if (!cache.has(currentToken)) {
    cache.set(
      currentToken, await exec$(
        `select next_token, freq from pairs where uid=$1 and current_token=$2`,
        [userId, currentToken]
      )
    );
  }

  const pairs = cache.get(currentToken);  
  const rand = Math.random() * pairs.reduce((p, c) => p + c.freq, 0);
  let val = 0;

  for (const pair of pairs) {
    val += pair.freq;
    
    if (val >= rand) {
      return pair.next_token;
    }
  }

  return 0;
}

export async function generateMessage(userId) {
  const cache = new Map();
  const sentence = [
    await nextToken(userId, 0, cache)
  ];

  while (sentence.length < 75) {
    const next = await nextToken(userId, sentence.at(-1), cache);
    if (!next) break;
    sentence.push(next);
  }

  cache.clear(); // justin case
  return sentence.map((x) => tokenIdMap.get(x)).join(" ").slice(0, 750);
}
