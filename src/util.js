import { fetch$ } from "./database.js";

export const getCheckmarkEmoji = (v) => v ? "<:checkmark:1213226267076329472>" : "<:crossmark:1213226289419264050>";

export function mentionCommand(client, command) {
  const name = command.split(" ")[0];
  return `</${command}:${
    client.application.commands.cache.find((x) => x.name == name)?.id ?? 0
  }>`;
}

export function isMarkovChainEnabled(setting, override) {
  return (setting && typeof override == "undefined") || override;
}

export async function getSettings(userId, guildId) {
  const settings = await fetch$("select enabled from user_settings where uid=$1", [userId]);
  if (!settings) return;
  
  const override = await fetch$(
    "select enabled from server_overrides where uid=$1 and sid=$2",
    [userId, guildId]
  );

  return {
    status: isMarkovChainEnabled(settings.enabled, override?.enabled),
    enabledGlobally: settings.enabled,
    serverOverride: override?.enabled,
  }
}
