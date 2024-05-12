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
    content: "### Your markov chain has been created!\n"
      + `Use ${mentionCommand(i.client, "generate")} to generate a message from your chain after you've sent some messages!\n\n`
      + `Please note that by default your markov chain is enabled everywhere! Use ${
        mentionCommand(i.client, "config")
      } if you want to enable or disable it on specific servers`,
    ephemeral: true
  });
}
