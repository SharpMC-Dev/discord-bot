const Discord = require('discord.js'),
  path = require('path'),
  Command = require('../structures/Command.js');
const Embed = require('../utils/Embed.js');
const { formatRelative, subDays } = require('date-fns');

class History extends Command {
  constructor(client) {
    super(client, {
      name: 'history',
      description: "Get a user's moderation history",
      options: [
        {
          name: 'target',
          type: 'USER',
          description: 'The user whos history you are checking',
          required: true,
        },
      ],
    });
  }

  async run({ interaction, client, user }) {
    let dbUser = await client.DB.findUser(user.id);
    if (!dbUser) return interaction.reply({ ephemeral: true, content: 'That user has no history.' });
    let dbModlogs = await client.DB.findAllModLogs(dbUser.id);
    if (!dbModlogs) return interaction.reply({ ephemeral: true, content: 'That user has no history.' });

    let modlogsEmbed = new Embed()
      .setTitle(`${user.tag}'s History`)
      .setDescription(dbModlogs.map(x => `*${formatRelative(x.timestamp, new Date())}* | **${x.action.toUpperCase()}** by ${interaction.guild.members.cache.get(x.executorId).user.tag} - **Reason: ** *${x.reason ? x.reason : 'None'}*`).join('\n\n'))
      .build();

    interaction.reply({ ephemeral: true, embeds: [modlogsEmbed] });
  }
}

module.exports = History;
