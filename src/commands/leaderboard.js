const Discord = require('discord.js'),
  path = require('path'),
  Command = require('../structures/Command.js');
const Embed = require('../utils/Embed.js');

class Leaderboard extends Command {
  constructor(client) {
    super(client, {
      name: 'leaderboard',
      description: 'Check the top 10 highest levels.',
    });
  }

  async run({ interaction, member, client }) {
    const LevelingManager = new (require('../utils/LevelingManager'))(client);

    let leaderboardUsers = await LevelingManager.getLeaderboard();
    let description = leaderboardUsers.map(x => `${x.position === 1 ? '🏅' : x.position === 2 ? '🥈' : x.position === 3 ? '🥉' : ''} **#${x.position}** <@${x.userId}> *Level: ${x.level}*`).join('\n\n');

    let leaderboardEmbed = new Embed().setTitle('Level Leaderboard').setDescription(description).build();

    interaction.reply({ embeds: [leaderboardEmbed] });
  }
}

module.exports = Leaderboard;
