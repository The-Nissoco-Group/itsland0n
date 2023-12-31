import { Client, Message } from "discord.js";
import { fetchGuildConfig } from "../configs/guild";
import { MongoClient } from "mongodb";
import { customWordFilter, customRegexFilter } from "./customFilter";
import { detectDiscordInvites } from "./detectWebContent";

export default async function moderation(client: Client, mongoClient: MongoClient) {
    client.on("messageCreate", async (message: Message) => {
        if (!message.inGuild) return

        const guildConfig = await fetchGuildConfig(mongoClient, message.guild!.id)

        for (const role of guildConfig.moderation.roles.moderationExemptRoles) {
            if (message.member?.roles.cache.has(role)) return
        }
    
        if (message.member!.permissions.has("Administrator")) return

        if (!message.deletable) return

        detectDiscordInvites(message, guildConfig);
    
        customWordFilter(message, guildConfig);
        customRegexFilter(message, guildConfig);
    })
}
