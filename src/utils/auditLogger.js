const Embed = require('./Embed');
const parseMsg = require('./parseMsg');

class AuditLogger {
  constructor(client) {
    this.client = client;
  }

  get guild() {
    return this.client.guilds.cache.get(this.client.config.bot.guildId) || null;
  }

  get modLogsChannel() {
    return this.guild.channels.cache.get(
      this.client.config.channels.required.mod_logs_channel
    );
  }

  //   gets most recent log of specified type
  async getAuditLog(guild, type) {
    if (typeof guild == 'number') guild = this.guild;
    return (await guild.fetchAuditLogs({ type, limit: 1 })).entries.first();
  }

  async getBan(guildBan, type) {
    // 22 for ban add, 23 for ban remove
    let auditLog = await this.getAuditLog(guildBan.guild, type);
    return auditLog;
  }

  getChannel(id) {
    return this.guild.channels.cache.get(id) || null;
  }

  isKick(entry) {
    return entry.action == 'MEMBER_KICK';
  }

  isBanAdd(entry) {
    return entry.action == 'MEMBER_BAN_ADD';
  }

  isBanRemove(entry) {
    return entry.action == 'MEMBER_BAN_REMOVE';
  }

  //   USE ONLY IN GUILDMEMBERUPDATE
  checkWasTimedOut(om, nm) {
    if (om.isCommunicationDisabled() && nm.isCommunicationDisabled())
      return false;
    if (om.isCommunicationDisabled() && !nm.isCommunicationDisabled())
      return false;
    if (!om.isCommunicationDisabled() && nm.isCommunicationDisabled())
      return true; //old member not timed out, new member is, this means the member was timed out :)
  }

  async log(entry, timeOut) {
    // entry: GuildAuditLogsEntry
    let action = '';
    let executor = entry.executor;
    let target = entry.target;
    let reason = entry.reason || 'NONE';

    if (this.isKick(entry)) action = 'kicked';
    if (this.isBanAdd(entry)) action = 'banned';
    if (this.isBanRemove(entry)) action = 'unbanned';
    if (timeOut && timeOut == true) action = 'timed out';
    if (entry.isWarning) action = 'warned';

    let modlogEmbed = new Embed()
      .setDescription(
        await parseMsg(
          this.client.config.messages.moderation.action_log_message,
          {
            guild: this.guild,
            targetUser: target,
            executingUser: executor,
            punishment: { action: action, reason: reason },
          }
        )
      )
      .build();

    this.modLogsChannel.send({ embeds: [modlogEmbed] });
    await this.addModLog(target, entry, action);
  }

  async addModLog(user, entry, action) {
    let modlog = {
      executor: entry.executor,
      reason: entry.reason,
      action,
    };

    this.client.DB.createModlog(user.id, modlog);
    this.client.DB.addInfractionToUser(user.id);
  }

  //   async autoLog(guild) {
  //     if (!guild || !guild.available) return;
  //     if (!this.modLogsChannel) return;
  //   }
}

module.exports = AuditLogger;
