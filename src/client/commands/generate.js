import { MIN_PAIR_COUNT, RE_CENSORED_WORDS, RE_DISCORD_SERVER_LINK, RE_LINK } from "../../const.js";
import { ApplicationCommandOptionType as OptionType } from "discord.js";
import { getSettings, mentionCommand } from "../../util.js";
import { generateMessage } from "../../model/index.js";
import { fetch$ } from "../../database.js";

export const name = "generate";
export const description = "Generate a message from your markov chain!";

/** @type {import("discord.js").ApplicationCommandOption[]} */
export const options = [
  {
    name: "user",
    type: OptionType.User,
    description: "Generate a message from someone else's markov chain!",
    required: false,
  }
]

/** @param {import("discord.js").ChatInputCommandInteraction} i */
export async function run (i) {
  const user = i.options.getUser("user", false) || i.user;
  const isSelf = user.id == i.user.id;

  try {
    await i.guild.members.fetch(user.id);
  } catch (err) {
    return await i.reply({
      content: "Unknown user",
      ephemeral: true
    });
  }
  
  const settings = await getSettings(user.id, i.guild.id);
  const pairs = await fetch$("select count(*) from pairs where uid=$1", [user.id]);
  
  if (!settings?.status) {
    if (isSelf) {
      return await i.reply({
        ephemeral: true,
        content: settings
          ? `Your markov chain is turned off. Enable it with ${mentionCommand(i.client, "config")}`
          : `You do not have a markov chain! Use ${mentionCommand(i.client, "setup")} to create your markov chain!`
      });
    }

    return await i.reply({
      content: "This user does not have a markov chain enabled!",
      ephemeral: true
    });
  } else if (pairs.count < MIN_PAIR_COUNT) {
    return await i.reply({
      ephemeral: true,
      content: isSelf
        ? "Your markov chain is too small. Try again later when you've sent some more messages!"
        : "This user does not have a markov chain enabled!" // This is a LIE!!!
    });
  }

  const start = Date.now();
  const message = await generateMessage(user.id);
  const took = Date.now() - start;

  if (took > 20) {
    console.warn(`${user.id} :: the model took over 20ms to generate a message (${pairs.count} pairs)`);
  }

  await i.reply({
    content: `**@${user.tag} once said...**\n> ${
      message
        .replace(RE_CENSORED_WORDS, (m) => "\\*".repeat(m.length))
        .replace(RE_DISCORD_SERVER_LINK, "[invite]")
        .replace(RE_LINK, "[link]")
        .replace(/\n+/g, "\n> ")
    }`
  });
}
