import { exec$, fetch$ } from "../../database.js";

export const name = "setup";
export const description = "Setup a markov chain";

/** @param {import("discord.js").ChatInputCommandInteraction} i */
export async function run (i) {
  if (await fetch$("select from user_settings where uid=$1", [i.user.id])) {
    return await i.reply({
      content: "You already have a markov chain!",
      ephemeral: true
    });
  }

  await exec$("insert into user_settings values ($1, true)", [i.user.id]);
  await i.reply({
    content: "TODO",
    ephemeral: true
  });
}
