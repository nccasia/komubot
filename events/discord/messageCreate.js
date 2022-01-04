const permes = require("../../util/permissions.json");
require("../../util/extenders.js");
const bwl = require("../../util/bwl.js");
const { Permissions } = require("discord.js");

module.exports = {
    async execute(e) {
        const { client: t } = e;        
        if (e.author.bot || !e.guild) return;
        let guildDB = await e.guild.fetchDB();        
        if (e.content.startsWith(guildDB.prefix) || e.content.startsWith("komu ") || e.content.startsWith(`<@!${e.client.user.id}>`)) {
            if (e.content.endsWith("*") && !e.content.includes("prefix")) return;
            if (e.content.match(new RegExp(`^<@!?${e.client.user.id}>( |)$`))) {
                let a = await e.translate("HELLO_NEED_HELP", guildDB.lang);
                e.channel.send({
                    embeds: [{
                        description: a.replace("{prefix}", guildDB.prefix).replace("{prefix}", guildDB.prefix).replace("{prefix}", guildDB.prefix).replace("{id}", e.guild.id),
                        footer: {
                            text: e.client.footer,
                            icon_url: e.client.user.displayAvatarURL()
                        },
                        title: `Settings for ${e.guild.name}`,
                        color: guildDB.color
                    }]
                }).catch(() => {
                    e.member.send("❌ Please give me the `Send messages` and `Embed links` permission.")
                });
                console.log("[32m%s[0m", "PING OF THE BOT ", "[0m", `${e.author.tag} pinged the bot succesfully on ${e.guild.name}`);
                return
            }
            e.content.startsWith(guildDB.prefix) && (a = e.content.slice(guildDB.prefix.length).trim().split(/ +/)), e.content.startsWith("komu ") && (a = e.content.slice(5).trim().split(/ +/)), e.content.startsWith(`<@!${e.client.user.id}>`) && (a = e.content.slice(22).trim().split(/ +/));
            const r = a.shift().toLowerCase(),
                i = t.commands.get(r) || t.commands.find(e => e.aliases && e.aliases.includes(r));
            if (!i) return;
            console.log("[32m%s[0m", "COMMAND ", "[0m", `Command ${i.name} by ${e.author.tag} on ${e.guild.name}\nMessage content:\n${e.content}`);
            const me = e.guild.members.cache.get(e.client.user.id);
            const channelBotPerms = new Permissions(e.channel.permissionsFor(me));
            if (!channelBotPerms.has("SEND_MESSAGES")) return e.member.send("❌ I don't have permission to send messages in this channel.");
            if (!channelBotPerms.has("EMBED_LINKS")) return e.channel.send("❌ The bot must have the `Embed links` permissions to work properly !");
            if (i.permissions) {
                "string" == typeof i.permissions && (i.permissions = [i.permissions]);
                for (const t of i.permissions)
                    if (!e.channel.permissionsFor(e.member).has(t)) {
                        let d = await e.translate("MISSING_PERMISSIONS", guildDB.lang);
                        if ("MANAGE_GUILD" !== t) return e.errorMessage(d.replace("{perm}", permes[t] ? permes[t][guildDB.lang] : t)); {
                            let a = await e.translate("MISSING_ROLE");
                            if (!guildDB.admin_role) return e.errorMessage(d.replace("{perm}", permes[t] ? permes[t][guildDB.lang] : t));
                            if (AdminRole = e.guild.roles.cache.get(guildDB.admin_role), !AdminRole) return e.errorMessage(d.replace("{perm}", permes[t] ? permes[t][guildDB.lang] : t));
                            if (!e.member.roles.cache) return e.errorMessage(a.replace("{perm}", permes[t] ? permes[t][guildDB.lang] : t).replace("{role}", AdminRole));
                            if (!e.member.roles.cache.has(AdminRole.id)) return e.errorMessage(a.replace("{perm}", permes[t] ? permes[t][guildDB.lang] : t).replace("{role}", AdminRole))
                        }
                    }
            }
            if (i.args && !a.length) {
                let u = await e.translate("ARGS_REQUIRED", guildDB.lang);
                const read = await e.translate("READ", guildDB.lang)
                let langUsage;
                if (i.usages) {
                    langUsage = await e.translate("USES", guildDB.lang)
                } else {
                    langUsage = await e.translate("USES_SING", guildDB.lang)
                }
                e.channel.send({
                            embeds: [{
                                        color: "#C73829",
                                        description: `${u.replace("{command}",r)}\n${read}\n\n**${langUsage}**\n${i.usages ? `${i.usages.map(x=>`\`${guildDB.prefix}${x}\``).join("\n")}` : ` \`${guildDB.prefix}${r} ${i.usage}\``}`,
                    footer: { text: e.client.footer, iconURL: e.client.user.displayAvatarURL() },
                    author: { name: e.author.username, icon_url: e.author.displayAvatarURL({ dynamic: !0, size: 512 }), url: "https://discord.com/oauth2/authorize?client_id=783708073390112830&scope=bot&permissions=19456" },
                }]})
                return;
            }
            try {
                i.execute(e, a, t, guildDB,i );
                return
            } catch (s) {
                return e.errorOccurred(s)
            }
        }
    }
};
