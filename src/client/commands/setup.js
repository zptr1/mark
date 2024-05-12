import { exec$, fetch$ } from "../../database.js";
import { mentionCommand } from "../../util.js";

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
    content: `Your markov chain has been created! It is enabled by default, but you can use ${
      mentionCommand(i.client, "config")
    } if you want to change that`,
    ephemeral: true
  });
}
