import { GuildDefaultMessageNotifications, Message } from "discord.js";
import { Guild } from "../configs/guild";

function detectDiscordInvites(message: Message, guildConfig: Guild) {
    if (!guildConfig.moderation.removeDiscordInvites) return

    const filter = "(https?:\\/\\/|http?:\\/\\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\\/invite|discord.com\\/invite)\\/[^\\s\\/]+?(?=\\b)";
    const regex = new RegExp(filter);

    if (regex.test(message.content)) {
        message.delete();

        try { message.channel.send(`<a:deny:1190937442203734066> <@${message.author.id}>, Discord invites are not allowed on this server!`); }
        catch { return; }
    }
}

function detectIpAddress(message: Message, guildConfig: Guild) {
    if (!guildConfig.moderation.removeIPs) return
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    for (const data of message.content.split(" ")) {
        if (regex.test(data)) {
            message.delete();

            try { message.channel.send(`<a:deny:1190937442203734066> <@${message.author.id}>, IP Addresses are not allowed on this server!`); }
            catch { return; }
        }
    }
}


export { detectDiscordInvites, detectIpAddress }