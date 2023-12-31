import { sleep } from "bun";
import { MongoClient } from "mongodb";

class Guild {
    public readonly uuid: string;
    public readonly guildID: string;
    
    public moderation: Guild.Moderation;
    public leveling: Guild.Leveling;
    public records: Guild.Records;

    public economy: boolean;
    public music: boolean;

    public constructor(uuid: string, guildID: string, moderation: Guild.Moderation, leveling: Guild.Leveling, records: Guild.Records, economy: boolean, music: boolean) {
        this.uuid = uuid;
        this.guildID = guildID;

        this.moderation = moderation;
        this.leveling = leveling;
        this.records = records;

        this.economy = economy;
        this.music = music;
    }
}

namespace Guild {
    export class Moderation {
        public roles: {moderationExemptRoles: string[], antiNukeExemptRoles: string[]};
        public profanityFiltering: boolean;
        public customWordFilter: string[];
        public customRegexFilter: string[];
        public removeLinks: boolean;
        public removeIPs: boolean;
        public removeMassMentions: {enabled: boolean, pingsPerMessage: number};
        public antiNuke: boolean;
        public filterSuspiciousMembers: boolean;
        public filterDMSpammers: boolean;

        public constructor(roles: {moderationExemptRoles: string[], antiNukeExemptRoles: string[]}, profanityFiltering: boolean, customWordFilter: string[], customRegexFilter: string[], removeLinks: boolean, removeIPs: boolean, removeMassMentions: {enabled: boolean, pingsPerMessage: number}, antiNuke: boolean, filterSuspiciousMembers: boolean, filterDMSpammers: boolean) {
            this.roles = roles;
            this.profanityFiltering = profanityFiltering;
            this.customWordFilter = customWordFilter;
            this.customRegexFilter = customRegexFilter;
            this.removeLinks = removeLinks;
            this.removeIPs = removeIPs;
            this.removeMassMentions = removeMassMentions;
            this.antiNuke = antiNuke;
            this.filterSuspiciousMembers = filterSuspiciousMembers;
            this.filterDMSpammers = filterDMSpammers;
        }
    }
    export class Leveling {
        public enabled: boolean;
        public difficulty: number;
        public defaultLevelExperience: number;
        public experiencePerMessage: number;

        constructor(enabled: boolean, difficulty: number, defaultLevelExperience: number, experiencePerMessage: number) {
            this.enabled = enabled;
            this.difficulty = difficulty;
            this.defaultLevelExperience = defaultLevelExperience;
            this.experiencePerMessage = experiencePerMessage;
        }
    }

    export class Records {
        public levelingLogs: {enabled: boolean, channel: string | null, mention: boolean};
        public moderationLogs: {enabled: boolean, channel: string | null};
        public joinLogs: {enabled: boolean, channel: string | null};
        public leaveLogs: {enabled: boolean, channel: string | null};

        constructor(levelingLogs: {enabled: boolean, channel: string, mention: boolean}, moderationLogs: {enabled: boolean, channel: string}, joinLogs: {enabled: boolean, channel: string}, leaveLogs: {enabled: boolean, channel: string}) {
            this.levelingLogs = levelingLogs;
            this.moderationLogs = moderationLogs;
            this.joinLogs = joinLogs;
            this.leaveLogs = leaveLogs;
        }
    }
}

async function fetchGuildConfig(client: MongoClient, guildID: string) {
    const collection = client.db("discord").collection("guilds")

    if (await collection.findOne({"guildID": guildID}) === null) {
        const defaultConfig = {
            _id: crypto.randomUUID().toString(),
            guildID: guildID,
            type: "guildConfiguration",
            moderation: {
                roles: {
                    moderationExemptRoles: [],
                    antiNukeExemptRoles: []
                },
                profanityFiltering: false,
                customWordFilter: [],
                customRegexFilter: [],
                removeLinks: false,
                removeIPs: false,
                removeMassMentions: {
                    enabled: false,
                    pingsPerMessage: 8
                },
                antiNuke: false,
                filterSuspiciousMembers: false,
                filterDMSpammers: false
            },
            leveling: {
                enabled: false,
                difficulty: 1.25,
                defaultLevelExperience: 1000,
                experiencePerMessage: 25
            },
            records: {
                levelingLogs: {
                    enabled: false,
                    channel: null,
                    mention: true
                },
                moderationLogs: {
                    enabled: false,
                    channel: null
                },
                joinLogs: {
                    enabled: false,
                    channel: null
                },
                leaveLogs: {
                    enabled: false,
                    channel: null
                }
            },
            economy: true,
            music: true
        }
        collection.insertOne(defaultConfig);

        await sleep(500)
    }

    const data = await collection.findOne({"guildID": guildID});

    const moderation = new Guild.Moderation(data!.moderation.roles, data!.moderation.profanityFiltering, data!.moderation.customWordFilter, data!.moderation.customRegexFilter, data!.moderation.removeLinks, data!.moderation.removeIPs, data!.moderation.removeMassMentions, data!.moderation.antiNuke, data!.moderation.filterSuspiciousMembers, data!.moderation.filterDMSpammers);
    const leveling = new Guild.Leveling(data!.leveling.enabled, data!.leveling.difficulty, data!.leveling.defaultLevelExperience, data!.leveling.experiencePerMessage);
    const records = new Guild.Records(data!.records.levelingLogs, data!.records.moderationLogs, data!.records.joinLogs, data!.records.leaveLogs);

    return new Guild(data!._id.toString(), data!.guildID, moderation, leveling, records, data!.economy, data!.music);
}

async function saveGuildConfig(client: MongoClient, guild: Guild) {
    const collection = client.db("discord").collection("guilds")

    const insertConfig = {
        _id: guild.uuid,
        guildID: guild.guildID,
        type: "guildConfiguration",
        moderation: {
            roles: guild.moderation.roles,
            profanityFiltering: guild.moderation.profanityFiltering,
            customWordFilter: guild.moderation.customWordFilter,
            customRegexFilter: guild.moderation.customRegexFilter,
            removeLinks: guild.moderation.removeLinks,
            removeIPs: guild.moderation.removeIPs,
            removeMassMentions: guild.moderation.removeMassMentions,
            antiNuke: guild.moderation.antiNuke,
            filterSuspiciousMembers: guild.moderation.filterSuspiciousMembers,
            filterDMSpammers: guild.moderation.filterDMSpammers
        },
        leveling: {
            enabled: guild.leveling.enabled,
            difficulty: guild.leveling.difficulty,
            defaultLevelExperience: guild.leveling.defaultLevelExperience,
            experiencePerMessage: guild.leveling.experiencePerMessage
        },
        records: {
            levelingLogs: guild.records.levelingLogs,
            moderationLogs: guild.records.moderationLogs,
            joinLogs: guild.records.joinLogs,
            leaveLogs: guild.records.leaveLogs
        },
        economy: guild.economy,
        music: guild.music
    }

    collection.replaceOne({guildID: guild.guildID}, insertConfig)
    // collection.updateOne({guildID: guild.guildID}, {}, { upsert: true })
}

export { fetchGuildConfig, saveGuildConfig, Guild }