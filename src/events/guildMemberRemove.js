const Embed = require('../utils/Embed');
const parseMsg = require('../utils/parseMsg');

class GuildMemberRemove {
  constructor(client) {
    this.client = client;
    this.enable = true;
    this.auditLogger = new (require('../utils/auditLogger'))(this.client);
  }

  async run(member) {
    let ctx = { targetUser: member, guild: member.guild };

    let config = this.client.config;
    let leave_message_channel = this.client.guilds.cache
      .get(config.bot.guildId)
      .channels.cache.get(config.channels.required.join_message_channel);

    if (!leave_message_channel)
      return console.log(
        'Invalid leave message channel was provided. Please check this and try again.'
      );

    let recentLog = await this.auditLogger.getAuditLog(member.guild, 20);

    if (!recentLog || recentLog.createdAt < member.joinedAt) {
      if (!config.features.messaging.leave_messages) return;
      let leaveEmbed = new Embed()
        .setTitle(
          await parseMsg(config.messages.leave_message.leave_embed_title, ctx)
        )
        .setDescription(
          await parseMsg(
            config.messages.leave_message.leave_embed_description,
            ctx
          )
        )
        .setThumbnail(member.user.avatarURL())
        .build();

      leave_message_channel.send({ embeds: [leaveEmbed] });
    } else {
      // was kicked
      if (!config.features.moderation.log_actions) return;
      this.auditLogger.log(recentLog, false);
    }
  }
}
module.exports = GuildMemberRemove;
