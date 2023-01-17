const Discord = require('discord.js'),
  path = require('path'),
  Command = require('../structures/Command.js');
const Embed = require('../utils/Embed.js');
const moment = require('moment');

class Shout extends Command {
  constructor(client) {
    super(client, {
      name: 'shout',
      description: 'Send a message with emphasis!',
      options: [
        {
          name: 'color',
          type: 'STRING',
          description: 'The color of your shout message! Must be in HEX format (#XXXXXX)',
          required: true,
        },
        {
          name: 'message',
          type: 'STRING',
          description: 'The message you want to shout',
          required: true,
        },
      ],
    });
    this.client = client;
  }

  checkUnixTimestamp(currentUnixTimestamp, futureUnixTimestamp) {
    if (currentUnixTimestamp > futureUnixTimestamp) {
      return true;
    } else {
      return false;
    }
  }

  async run({ interaction, message, member, color }) {
    let dbUser = await this.client.DB.findUser(member.id);
    if (!dbUser) return interaction.reply({ ephemeral: true, content: "You weren't in our system. Try again!" });
    let settings = this.client.config.settings;
    let hexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/gim;

    let tilNextShout = dbUser.nextShout;

    if (!this.checkUnixTimestamp(new Date(), tilNextShout)) return interaction.reply({ ephemeral: true, content: "Your shout isn't ready yet!" });

    if (!member.roles.cache.has(settings.leveling.roles[settings.leveling.level_perks.shout])) return interaction.reply({ ephemeral: true, content: 'You must be level 40 or higher to use /shout!' });
    if (!hexRegex.test(color)) return interaction.reply({ ephemeral: true, content: '`color` must be in HEX (#XXXXXX) format!' });

    let embed = new Embed().setColor(color).setDescription(message).setAuthor(member.user.tag, member.user.avatarURL()).build();

    interaction.channel.send({ embeds: [embed] }).then(m => {
      let now = new Date();
      let nextShout = moment(now).add(20, 'minutes').format('x');
      dbUser.nextShout = nextShout;
      dbUser.save();
      interaction.reply({ ephemeral: true, content: `You can shout again in 20 minutes!` });
    });
  }
}

module.exports = Shout;
