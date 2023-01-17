class GuildBanAdd {
  constructor(client) {
    this.client = client;
    this.enable = true;
    this.auditLogger = new (require('../utils/auditLogger'))(this.client);
  }

  async run(ban) {
    if (!this.client.config.features.moderation.log_actions) return;

    this.auditLogger.log(await this.auditLogger.getBan(ban), false);
  }
}
module.exports = GuildBanAdd;
