const { DMChannel, MessageActionRow, MessageButton } = require('discord.js');
const Embed = require('../utils/Embed');

class MessageCreate {
  constructor(client) {
    this.client = client;
    this.enable = true;
    this.LevelingManager = new (require('../utils/LevelingManager'))(this.client);

    // this.TatsuApi = new (require('../utils/tatsuApi'))();
  }

  async run(message) {
    if (message.author.bot) return;

    const runningGuild = this.client.guilds.cache.get(this.client.config.bot.guildId);

    if (message.channel.type === 'DM' && message?.attachments?.size > 0) {
      let verifiedRole = runningGuild.roles.cache.get(this.client.config.roles.required.selfie_verified);
      let member = await runningGuild.members.fetch(message.author.id);

      console.log(member.roles.cache.has(verifiedRole.id));

      if (member.roles.cache.has(verifiedRole.id)) return message.reply('You are already verified. If this is a mistake, please open a support ticket.');

      let attachmentURL = message.attachments.first().attachment;

      let verifyEmbed = new Embed().setTitle(`Verification Request`).setDescription('This is the image that will be submitted for verification. Make sure everything is clear and readable and press the ` Send ` button below.').setImage(attachmentURL);
      let row = new MessageActionRow().addComponents([new MessageButton().setCustomId('verify-selfie-send').setLabel('Send').setStyle('SUCCESS'), new MessageButton().setCustomId('deny-selfie-send').setLabel('Cancel').setStyle('DANGER')]);

      message.reply({ embeds: [verifyEmbed.build()], components: [row] });

      return;
    }

    if (!message.guild) return;

    let context = {
      guild: message.guild,
      executingUser: message.member,
      client: this.client,
    };

    // db stuff
    let user = await this.client.DB.findUser(message.author.id);
    if (!user) return this.client.DB.createUser(message.author.id);

    // leveling
    if (message.channel.name.includes('ticket-')) return;
    let userXp = user.xp;
    let requiredXp = await this.LevelingManager.calculateRequiredXp(user.id);

    let newXp = this.LevelingManager.rollXp(user.id);

    userXp = userXp + newXp;

    console.log(`Level: ${user.level}`);
    console.log(`${userXp}/${requiredXp}`);

    if (userXp > requiredXp) {
      let newLevel = await this.LevelingManager.calculateLevel(userXp);
      await this.LevelingManager.userLevelUp(user.id, message.channel, newLevel, {
        ...context,
        level: user.level + 1,
      });
    } else if (userXp >= requiredXp) {
      await this.LevelingManager.userLevelUp(user.id, message.channel, user.level + 1, {
        ...context,
        level: user.level + 1,
      });
    }
  }
}
module.exports = MessageCreate;
