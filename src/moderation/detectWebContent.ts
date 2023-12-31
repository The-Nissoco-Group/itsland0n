import { Message } from "discord.js";
import { Guild } from "../configs/guild";

function detectDiscordInvites(message: Message, guildConfig: Guild) {
    if (!guildConfig.moderation.removeDiscordInvites) return

    const filter = "(https?:\/\/|http?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite|discord.com\/invite)\/[^\s\/]+?(?=\b)";
    const regex = new RegExp(filter);

    if (regex.test(message.content)) {
        message.delete();

        try { message.channel.send(`<a:deny:1190937442203734066> <@${message.author.id}>, discord invites are not allowed on this server!`); }
        catch { return; }
    }
}

export { detectDiscordInvites }