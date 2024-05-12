import { glob } from "glob";

export const commands = new Map();

/** @param {import("discord.js").Client} client */
export async function loadCommands(client) {
  for (const file of await glob("src/client/commands/**/*.js")) {
    const command = await import(`../../../${file}`);    

    if (typeof command.name != "string") {
      console.error(`Invalid command @ ${file}: missing \`name\` (string)`);
      continue;
    } else if (typeof command.run != "function") {
      console.error(`Invalid command @ ${file}: missing \`run\` (function)`);
      continue;
    }

    commands.set(command.name, Object.assign({}, command));
  }

  console.log("Loaded", commands.size, "commands");
  await client.application.commands.set([...commands.values()]);
}

/** @param {import("discord.js").Interaction} i */
export async function handleInteraction(i) {
  if (i.isCommand()) {
    if (!commands.has(i.commandName)) {
      console.error("Unknown command", i.commandName);
      return await i.reply({
        content: "unknown command (HOW?)",
      });
    } else if (!i.guildId) {
      return await i.reply({
        content: "This bot can only be used on servers!"
      })
    }

    const command = commands.get(i.commandName);

    try {
      await command.run(i);
    } catch (err) {
      if (i.deferred) {
        await i.editReply({ content: "something broke idk sorry" })
      } else if (!i.replied) {
        await i.reply({
          content: "something broke idk sorry"
        });
      }

      console.error("Error when running the command", i.commandName);
      console.error(err);
    }
  }
}