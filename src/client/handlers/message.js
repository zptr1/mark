import { addMessage } from "../../model/index.js";
import { getSettings } from "../../util.js";

/** @param {import("discord.js").Message} message */
export async function handleMessage(message) {
  if (
    !message.guildId
    || message.author.bot
    || message.channel.nsfw
    || !message.content
  ) return;

  const settings = await getSettings(message.author.id, message.guildId);
  if (settings?.status) {
    await addMessage(
      message.author.id,
      message.content
        .replace(/<@!?\d+>/g, "@user")
        .replace(/<@&?\d+>/g, "@role")
        .replace(/<#?\d+>/g, "#channel")
    );
  }
}
