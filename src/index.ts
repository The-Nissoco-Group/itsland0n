import { Client, ActivityType, TextChannel, ChannelType } from 'discord.js';
import ora from 'ora';
import { MongoClient } from 'mongodb';
import { fetchGuildConfig } from './configs/guild';

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

});

client.login(Bun.env.TOKEN);