import { getSettings, mentionCommand } from "../../util.js";
import { tokenIdMap } from "../../model/tokens.js";
import { exec$ } from "../../database.js";

export const name = "stats";
export const description = "See some stats from your markov chain!";

/** @param {import("discord.js").ChatInputCommandInteraction} i */
export async function run (i) {
  const settings = await getSettings(i.user.id, i.guild.id);
  if (!settings) {
    return await i.reply({
      ephemeral: true,
      content: `You do not have a markov chain! Use ${mentionCommand(i.client, "setup")} to create your markov chain!`
    });
  }

  await i.deferReply();
  const content = [];
  const intl = new Intl.NumberFormat();

  const words = await exec$(`
    select current_token as token, sum(freq) as uses from pairs
      where uid=$1 and current_token!=0
      group by current_token
  `, [i.user.id]);

  const sentenceStarts = await exec$(
    "select next_token as token, freq as uses from pairs where uid=$1 and current_token=0",
    [i.user.id]
  );

  const sentenceEnds = await exec$(
    "select current_token as token, freq as uses from pairs where uid=$1 and next_token=0",
    [i.user.id]
  );

  const formatList = (list) => list
    .sort((a, b) => b.uses - a.uses).slice(0, 5)
    .map((x) => `\`${tokenIdMap.get(x.token)}\``).join(", ");

  content.push(`You have said **${intl.format(words.length)}** unique words.`);
  content.push(`Your most used words are ${formatList(words)}\n`);
  
  content.push(
    `I know **${intl.format(sentenceStarts.length)}** different ways to start a message, `
    + `and **${intl.format(sentenceEnds.length)}** different ways to end it.`
  );

  content.push(`- Your favorite ways to start a message are ${formatList(sentenceStarts)}`);
  content.push(`- Your favorite ways to end a message are ${formatList(sentenceEnds)}`);

  await i.editReply({
    content: content.join("\n")
  });
}
