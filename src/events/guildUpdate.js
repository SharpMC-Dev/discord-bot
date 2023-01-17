class GuildUpdate {
  constructor(client) {
    this.client = client;
    this.enable = true;
    this.auditLogger = new (require('../utils/auditLogger'))(this.client);
  }

  async run(oldGuild, newGuild) {
    let auditLogType = 20;
    if (!newGuild.available)
      return console.log('An update occurred, but the guild was unavailable.');
    if (oldGuild === newGuild) return;
    let oldLastEntry = await this.auditLogger.getAuditLog(
      oldGuild,
      auditLogType
    );

    // this.auditLogger.log();

    // console.log('OLD', await this.getAuditLog(oldGuild, 20).reason);
    // console.log('------------------------------');
    // console.log('NEW', await this.getAuditLog(oldGuild, 20).reason);
    console.log(oldLastEntry.reason);
    // KICK
  }
}
module.exports = GuildUpdate;
