import { ApplicationCommandOptionType as OptionType } from "discord.js";
import { SEPARATOR_TOKEN, tokenIdMap } from "../../model/tokens.js";
import { getSettings } from "../../util.js";
import { exec$ } from "../../database.js";

export const name = "download";
export const description = "Download your data";

/** @type {import("discord.js").ApplicationCommandOption[]} */
export const options = [{
  name: "my", description,
  type: OptionType.SubcommandGroup,
  options: [{
    name: "data", description,
    type: OptionType.Subcommand
  }]
}];

/** @param {import("discord.js").ChatInputCommandInteraction} i */
export async function run (i) {
  const settings = await getSettings(i.user.id, i.guildId);
  if (!settings) {
    return await i.reply({
      content: "You do not have a markov chain.",
      ephemeral: true
    });
  }

  await i.deferReply({ ephemeral: true });

  const data = {
    settings: {
      enabled: settings.enabledGlobally,
      overrides: {}
    },
    data: {
      separator_token: SEPARATOR_TOKEN,
      pairs: "$"
    }
  }
  
  for (const override of await exec$("select sid, enabled from server_overrides where uid=$1", [i.user.id])) {
    data.settings.overrides[override.sid] = override.enabled; 
  }
  
  const pairs = (
    await exec$("select current_token, next_token, freq from pairs where uid=$1 order by freq desc", [i.user.id])
  ).map((x) => ({
    pair: [tokenIdMap.get(x.current_token), tokenIdMap.get(x.next_token)],
    freq: x.freq
  }));

  const json = JSON.stringify(data, null, 2)
    .replace('"$"', JSON.stringify(pairs));

  await i.editReply({
    content: "here's ur data",
    files: [{
      name: `data-${i.user.id}.json`,
      attachment: Buffer.from(json, "utf-8")
    }]
  })
}
