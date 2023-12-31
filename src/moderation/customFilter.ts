import { Message, MessageType } from "discord.js";
import { Guild } from "../configs/guild";

function customWordFilter(message: Message, guildConfig: Guild) {
    for (const words of message.content.split(" ")) {
        if (guildConfig.moderation.customWordFilter.includes(words)) {
            try { message.delete() }
            // Incase bot does not have permission to delete
            catch { return }

            try { message.channel.send(`<@${message.author.id}>, the message you sent contained content not allowed on this server!`) }
            catch { return }
        }
    }
}

function customRegexFilter(message: Message, guildConfig: Guild) {
    for (const words of message.content.split(" ")) {
        for (const rawFilter of guildConfig.moderation.customRegexFilter) {
            const filter = new RegExp(rawFilter);
            if (filter.test(words)) {
                try { message.delete() }
                // Incase bot does not have permission to delete
                catch { return }
    
                try { message.channel.send(`<@${message.author.id}>, the message you sent contained content not allowed on this server!`) }
                catch { return }
            }   
        }
    }
}

export { customWordFilter, customRegexFilter }
