import { handleInteraction, loadCommands } from "./handlers/interaction.js";
import { Client, IntentsBitField, Options } from "discord.js";
import { handleMessage } from "./handlers/message.js";

import config from "../../config.json" assert { type: "json" };

const client = new Client({
  allowedMentions: {
    parse: [] // nuh uh
  },
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent
  ],
  makeCache: Options.cacheWithLimits({
    MessageManager: 0,    
    GuildEmojiManager: 0,
    BaseGuildEmojiManager: 0
  })
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag} (${client.user.id})`);
  await loadCommands(client);
});

client.on("messageCreate", handleMessage);
client.on("interactionCreate", handleInteraction);

client.login(config.token);
