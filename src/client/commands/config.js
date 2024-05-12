import { getCheckmarkEmoji, mentionCommand, getSettings, isMarkovChainEnabled } from "../../util.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { exec$ } from "../../database.js";

export const name = "config";
export const description = "Settings";

function getMenu(settings) {
  return {
    ephemeral: true,
    content: `Your markov chain is currently ${
      settings.status ? "**being trained**" : "**not** being trained"
    } on **this server**.`,
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(settings.status ? ButtonStyle.Success : ButtonStyle.Danger)
          .setLabel(`${settings.status ? "Enabled" : "Disabled"} on this server`)
          .setEmoji(getCheckmarkEmoji(settings.status))
          .setCustomId("toggle_here")
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(settings.enabledGlobally ? ButtonStyle.Success : ButtonStyle.Danger)
          .setLabel(`${settings.enabledGlobally ? "Enabled" : "Disabled"} everywhere else`)
          .setEmoji(getCheckmarkEmoji(settings.enabledGlobally))
          .setCustomId("toggle_globally")
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Clear per-server overrides")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("clear_overrides")
      )
    ]
  };
}

/** @param {import("discord.js").ChatInputCommandInteraction} i */
export async function run (i) {
  const settings = await getSettings(i.user.id, i.guildId);
  if (!settings) {
    return await i.reply({
      ephemeral: true,
      content: `**You don't have a markov chain!** Use ${
        mentionCommand(i.client, "setup")
      } to create your markov chain!`
    });
  }

  const reply = await i.reply(getMenu(settings));
  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (btn) => btn.user.id == i.user.id,
    time: 15 * 60 * 1000,
  });

  collector.on("collect", async (btn) => {
    if (btn.customId == "toggle_here") {
      settings.serverOverride = !settings.status;
      await exec$(`
        insert into server_overrides values ($1, $2, $3)
          on conflict (uid, sid) do update set enabled=excluded.enabled
      `, [i.user.id, i.guildId, settings.serverOverride]);
    } else if (btn.customId == "toggle_globally") {
      settings.enabledGlobally = !settings.enabledGlobally;
      if (settings.serverOverride) {
        settings.serverOverride = undefined;
      }

      await exec$("delete from server_overrides where uid=$1 and enabled=true", [i.user.id]);
      await exec$("update user_settings set enabled=$1 where uid=$2", [
        settings.enabledGlobally,
        i.user.id
      ]);
    } else if (btn.customId == "clear_overrides") {
      settings.serverOverride = undefined;
      await exec$("delete from server_overrides where uid=$1", [i.user.id]);
    }
    
    settings.status = isMarkovChainEnabled(settings.enabledGlobally, settings.serverOverride);
    i.editReply(getMenu(settings));

    btn.deferUpdate();
  });
}
