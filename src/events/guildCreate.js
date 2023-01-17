class GuildCreate {
  constructor(client) {
    this.client = client;
    this.enable = true;
  }

  async run(guild) {
    let g = await this.client.DB.findGuild(guild.id);
    if (!g) {
      await this.client.DB.createGuild(guild.id);
    }
  }
}
module.exports = GuildCreate;
