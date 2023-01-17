const { MessageActionRow, MessageButton } = require('discord.js');
const Embed = require('./Embed');

class TicketManager {
  constructor(client) {
    this.client = client;
    this.embedChannel = this.client.config.channels.required.user_verify_channel;
    this.chatterRole = this.client.config.roles.required.chatter_role;
  }

  async buildVerifyRow() {
    const row = new MessageActionRow().addComponents(new MessageButton().setCustomId('verify-member').setEmoji('✅').setStyle('SECONDARY'));

    return row;
  }

  async addChatterRole(member) {
    await member.fetch();
    if (member.roles.cache.has(this.chatterRole)) return;
    return member.roles.add(this.chatterRole);
  }

  async buildVerifyEmbed() {
    let embed = new Embed().setTitle('Verification').setDescription('Press the button below to verify.').build();

    return embed;
  }

  async sendOpenEmbed() {
    let embed = await this.buildVerifyEmbed();
    let actionRow = await this.buildVerifyRow();

    let channel = this.client.guilds.cache.get(this.client.config.bot.guildId).channels.cache.get(this.embedChannel);

    let dbGuild = await this.client.DB.findGuild(this.client.config.bot.guildId);
    if (!dbGuild) {
      await this.client.DB.createGuild(this.client.config.bot.guildId);
    }

    let botMessages = await channel.messages.fetch({ limit: 10 });
    botMessages = botMessages.filter(msg => msg.author.bot);

    botMessages.forEach(m => m.delete());

    return channel.send({ embeds: [embed], components: [actionRow] });
  }
}

module.exports = TicketManager;
