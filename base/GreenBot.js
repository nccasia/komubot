const { createClientVars } = require("../util/functions")
const { Player } = require("discord-player");
const util = require("util")
const { GiveawaysManager } = require("discord-giveaways");
const vvoice = require("discord-voice");
const { Database } = require("quickmongo");
const config = require("../config")
const dbTemps = require("quick.db");
const db = new Database(config.database.MongoURL);
null === (await client.db.get("giveaways")) && (await client.db.set("giveaways", []));
const { Client, Collection } = require("discord.js")
class GreenBot extends Client {
    constructor(options) {
        super(options);
        createClientVars(this);
        this.player = new Player(this, {
            leaveOnEnd: !1,
            leaveOnStop: !0,
            leaveOnEmpty: !0,
            enableLive: !0,
            ytdlDownloadOptions: {
                quality: 'highest',
                filter: 'audioonly',
            },
            timeout: 0,
            volume: 65,
            quality: "high"
        });
        this.guildInvites = new Map()
        this.wait = util.promisify(setTimeout)
        this.queue = new Map()
        const e = new vvoice(this, config.database.MongoURL);
        this.discordVoice = e
        this.db = db;
        this.commands = new Collection()
        this.dbTemps = dbTemps;
        const TempChannels = require("discord-temp-channels"),
            tempChannels = new TempChannels(this);
        this.tempChannels = tempChannels;
        class GiveawayManagerWithOwnDatabase extends GiveawaysManager {
            async getAllGiveaways() {
                return await db.get("giveaways");
            }
            async saveGiveaway(e, t) {
                return await db.push("giveaways", t), !0;
            }
            async editGiveaway(e, t) {
                const n = (await db.get("giveaways")).filter((t) => t.messageID !== e);
                return n.push(t), await db.set("giveaways", n), !0;
            }
            async deleteGiveaway(e) {
                const t = (await db.get("giveaways")).filter((t) => t.messageID !== e);
                return await db.set("giveaways", t), !0;
            }
            async refreshStorage() {
                return this.shard.broadcastEval((clientt) => clientt.manager.getAllGiveaways());
            }
        }
        const manager = new GiveawayManagerWithOwnDatabase(this, { storage: !1, updateCountdownEvery: 19e3, default: { botsCanWin: !1, exemptPermissions: [], embedColorEnd: "#ED360E", embedColor: "#3A871F", reaction: "🎁" } });
        this.manager = manager
    }
}
module.exports = GreenBot;
