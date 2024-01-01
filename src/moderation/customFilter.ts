import { Message, MessageType } from "discord.js";
import { Guild } from "../configs/guild";

function customWordFilter(message: Message, guildConfig: Guild) {
    for (const words of message.content.split(" ")) {
        if (guildConfig.moderation.customWordFilter.includes(words)) {
            message.delete()

            try { message.channel.send(`<a:deny:1190937442203734066> <@${message.author.id}>, the message you sent contained content not allowed on this server!`) }
            catch { return }
        }
    }
}

function customRegexFilter(message: Message, guildConfig: Guild) {
    const content = message.content;
    for (const rawFilter of guildConfig.moderation.customRegexFilter) {
        const filter = new RegExp(rawFilter);
        if (filter.test(content)) {
            message.delete()
    
            try { message.channel.send(`<a:deny:1190937442203734066> <@${message.author.id}>, the message you sent contained content not allowed on this server!`) }
            catch { return }
        }   
    }
}

export { customWordFilter, customRegexFilter }
