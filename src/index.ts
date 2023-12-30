import { Client, ActivityType, TextChannel, ChannelType, GuildBasedChannel } from 'discord.js';
import ora from 'ora';
import { MongoClient } from 'mongodb';
import { Guild, fetchGuildConfig, saveGuildConfig } from './configs/guild';
import { sleepSync } from 'bun';
import moderation from './moderation';

const statusSpinner = ora('Connecting to the Discord API').start();

const client = new Client({ intents: 3276799 });
const mongoClient = new MongoClient(Bun.env.DATABASE!);

client.on('ready', async () => {
    statusSpinner.text = `Connected to the Discord API as ${client.user!.tag}`;
    statusSpinner.succeed();

    client.user?.setPresence({
        activities: [{
            name: `over ${client.guilds.cache.size} servers`,
            type: ActivityType.Watching,
        }],
        status: "online"
    })

    const guild = client.guilds.cache.get("1064697739906129940")
    const channels = guild?.channels.cache

    await moderation(client, mongoClient)
});

client.login(Bun.env.TOKEN);