import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { readFile } from "fs/promises";

export const name = "help";
export const description = "if you dont understand something about this bot";

const HELP_TEXT = await readFile("data/help.md", "utf-8");

/** @param {import("discord.js").ChatInputCommandInteraction} i */
export async function run (i) {
  await i.reply({
    ephemeral: true,
    content: HELP_TEXT.replace(
      /{([a-z ]+)}/g, (_, command) => {
        const commandName = command.split(" ")[0];
        return `</${command}:${
          i.client.application.commands.cache.find(
            (x) => x.name == commandName
          )?.id ?? 0
        }>`;
      }
    ).replace(
      /\n+#/g, "\n#"
    ) + "\u200b",
    components: [
      new ActionRowBuilder().addComponents(
        // new ButtonBuilder()
        //   .setStyle(ButtonStyle.Link)
        //   .setURL("https://github.com/zptr1/mark")
        //   .setEmoji("<:white_question:1239169336078237727>")
        //   .setLabel("Privacy Policy"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL("https://github.com/zptr1/mark")
          .setEmoji("<:star:1239169751285104682>")
          .setLabel("GitHub"),
      )
    ]
  });
}
