import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType as OptionType } from "discord.js";
import { getSettings } from "../../util.js";
import { exec$ } from "../../database.js";

export const name = "delete";
export const description = "Delete your data (irreversible!)";

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
  if (!settings) return await i.reply({
    content: "You do not have a markov chain.",
    ephemeral: true
  });

  const reply = await i.reply({
    ephemeral: true,
    content: "### Are you sure you want to delete your markov chain?\n"
      + "Your currnet markov chain will be gone forever (a long time!)",
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("cancel")
          .setLabel("No"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Danger)
          .setLabel("Yes, delete it!!")
          .setCustomId("confirm"),
      )
    ]
  });

  const collector = reply.createMessageComponentCollector({
    time: 60_000, max: 1,
    filter: (btn) => btn.user.id == i.user.id
  });

  collector.on("collect", async (btn) => {
    btn.deferUpdate();

    if (btn.customId == "cancel") {
      await i.editReply({
        content: "Cancelled.",
        components: []
      });
    } else if (btn.customId == "confirm") {
      await exec$("delete from pairs where uid=$1", [i.user.id]);
      await exec$("delete from user_settings where uid=$1", [i.user.id]);
      await exec$("delete from server_overrides where uid=$1", [i.user.id]);

      await i.editReply({
        content: "Your markov chain model has been successfully deleted.",
        components: []
      });
    }
  });
}
