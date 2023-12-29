import { MongoClient } from "mongodb";

class Guild {
    public readonly UUID: string;
    public readonly guildID: string;
    
    public moderation: Guild.Moderation;
    public leveling: Guild.Leveling;
    public records: Guild.Records;

    public economy: boolean;
    public music: boolean;

    public constructor(UUID: string, guildID: string, moderation: Guild.Moderation, leveling: Guild.Leveling, records: Guild.Records, economy: boolean, music: boolean) {
        this.UUID = UUID;
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
        public levelingLogs: {enabled: boolean, channel: string, mention: boolean};
        public moderationLogs: {enabled: boolean, channel: string};
        public joinLogs: {enabled: boolean, channel: string};
        public leaveLogs: {enabled: boolean, channel: string};

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
    }

    const data = await collection.findOne({"guildID": guildID});

    const moderation = new Guild.Moderation(data!.moderation.roles, data!.moderation.profanityFiltering, data!.moderation.customWordFilter, data!.moderation.customRegexFilter, data!.moderation.removeLinks, data!.moderation.removeIPs, data!.moderation.removeMassMentions, data!.moderation.antiNuke, data!.moderation.filterSuspiciousMembers, data!.moderation.filterDMSpammers);
    const leveling = new Guild.Leveling(data!.leveling.enabled, data!.leveling.difficulty, data!.leveling.defaultLevelExperience, data!.leveling.experiencePerMessage);
    const records = new Guild.Records(data!.records.levelingLogs, data!.records.moderationLogs, data!.records.joinLogs, data!.records.leaveLogs);

    return new Guild(data!._id.toString(), data!.guildID, moderation, leveling, records, data!.economy, data!.music);
}

export {fetchGuildConfig}