const Embed = require('../utils/Embed');
const parseMsg = require('../utils/parseMsg');

class GuildMemberUpdate {
  constructor(client) {
    this.client = client;
    this.enable = true;

    this.auditLogger = new (require('../utils/auditLogger.js'))(this.client);
  }

  //   BOOSTER NOTIFICATIONS
  async run(oldMember, member) {
    let ctx = { targetUser: member, guild: member.guild };
    let config = this.client.config;
    let { boost_message: relevantMessages } = this.client.config.messages;
    // let staffRoles = this.client.config.settings.staff_list.roles.sort(
    //   (a, b) => {
    //     return a.position - b.position;
    //   }
    // );

    let boost_message_channel = this.client.guilds.cache.get(config.bot.guildId).channels.cache.get(config.channels.required.boost_message_channel);

    // STAFF LIST
    // await member.guild.members.fetch();

    // let members = [];

    // staffRoles.forEach(r => {
    //   let role = member.guild.roles.cache.get(r.id);

    //   role.members.each(m => {
    //     if (!members.includes(m.id)) members.push(m.id);
    //     console.log(role.name, m.user.tag);
    //     console.log(
    //       m.roles.cache
    //         .sort((a, b) => b.position - a.position)
    //         .filter(rol => rol.id == r.id)
    //         .first().name
    //     );

    //     // .each(ro => {
    //     // console.log(ro.name, '-', ro.position);
    //     // });
    //   });
    // });

    // let staffListEmbed = new Embed()
    //   .setTitle(this.client.config.settings.staff_list.embed_title)
    //   .setDescription(
    //     staffRoles
    //       .map(
    //         x =>
    //           `__**<@&${x.id}>**__ - *${
    //             x.role_description
    //           }*\n${member.guild.roles.cache
    //             .get(x.id)
    //             .members.map(m =>
    //               m.roles.highest.id == x.id ? `${m}` : '\u200b'
    //             )
    //             .join('\n')}`
    //       )
    //       .join('\n\n')
    //   )
    //   .build();

    // let staffListMessage = (
    //   await member.guild.channels.cache
    //     .get(this.client.config.channels.required.staff_list_channel)
    //     .messages.fetch({ limit: 5 })
    // ).first();

    // if (!staffListMessage || staffListMessage.embeds.length < 0) {
    //   await member.guild.channels.cache
    //     .get(this.client.config.channels.required.staff_list_channel)
    //     .send({ embeds: [staffListEmbed] });
    // } else if (staffListMessage.embeds.length > 0) {
    //   staffListMessage.edit({ embeds: [staffListEmbed] });
    // }

    // HANDLE LOGGING TIMEOUTS
    if (this.auditLogger.checkWasTimedOut(oldMember, member)) {
      if (!member) return;
      if (!config.features.moderation.log_actions) return;
      this.auditLogger.log(await this.auditLogger.getAuditLog(member.guild, 24), true);
    }

    if (!boost_message_channel) return console.log('Invalid boost message channel was provided. Please check this and try again.');

    if (!oldMember.premiumSince && member.premiumSince) {
      if (!config.features.messaging.boost_messages) return;
      let boostEmbed = new Embed()
        .setTitle(await parseMsg(relevantMessages.boost_embed_title, ctx))
        .setColor(config.colors.embeds.boost)
        .setDescription(await parseMsg(relevantMessages.boost_embed_description, ctx))
        .setThumbnail(member.user.avatarURL())
        .build();

      boost_message_channel.send({ embeds: [boostEmbed] });
    }
  }
}
module.exports = GuildMemberUpdate;
