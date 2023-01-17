const Discord = require('discord.js');
const Embed = require('../utils/Embed.js');
Command = require('../structures/Command.js');

class Announce extends Command {
  constructor(client) {
    super(client, {
      name: 'announce',
      description: 'Make an announcement',
      options: [
        {
          name: 'channel',
          type: 'CHANNEL',
          channelTypes: ['GUILD_TEXT', 'GUILD_NEWS'],
          description: 'The channel that your announcement will be sent in',
          required: true,
        },
        {
          name: 'message',
          type: 'STRING',
          description: 'The content of your announcement.',
          required: true,
        },
        {
          name: 'ping',
          type: 'BOOLEAN',
          description: 'Whether or not to ping @everyone in your announcement.',
          required: true,
        },
      ],
    });
  }

  async run({ channel, member, interaction, message, ping }) {
    let announcementEmbed = new Embed().setTitle(`Announcement from ${member.user.tag}`).setDescription(message).build();

    channel
      .send({
        content: ping ? `@everyone` : '\u200b',
        embeds: [announcementEmbed],
      })
      .then(m => {
        interaction.reply({
          ephemeral: true,
          content: `Successfully sent your announcement in ${m.channel}`,
        });
      })
      .catch(err => {
        interaction.reply({
          ephemeral: true,
          content: `There was an error sending your announcement :(\n\nMake sure your announcement is less than 2000 characters and try again.`,
        });
      });
  }
}

module.exports = Announce;
