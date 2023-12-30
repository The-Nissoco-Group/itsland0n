import { Client, Message } from "discord.js";
import { fetchGuildConfig } from "../configs/guild";
import { MongoClient } from "mongodb";
import { customWordFilter } from "./customFilter";

export default async function moderation(client: Client, mongoClient: MongoClient) {
    client.on("messageCreate", async (message: Message) => {
        if (!message.inGuild) return

        const guildConfig = await fetchGuildConfig(mongoClient, message.guild!.id)

        for (const role of guildConfig.moderation.roles.moderationExemptRoles) {
            if (message.member?.roles.cache.has(role)) return
        }
    
        if (message.member!.permissions.has("Administrator")) return
    
        customWordFilter(message, guildConfig)
    })
}