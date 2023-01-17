const Discord = require('discord.js'),
  path = require('path'),
  Command = require('../structures/Command.js'),
  Embed = require('../utils/Embed');

class Level extends Command {
  constructor(client) {
    super(client, {
      name: 'level',
      description: 'Check your level or the level of another user',
      options: [
        {
          name: 'target',
          description: "Check this user's level",
          type: 'USER',
        },
      ],
    });

    this.LevelingManager = new (require('../utils/LevelingManager'))(client);
  }

  async run({ interaction, user, member, client }) {
    let dbUser;
    if (!user) dbUser = await client.DB.findUser(member.id);
    if (user) dbUser = await client.DB.findUser(user.id);

    if (!dbUser)
      return interaction.reply({
        ephemeral: true,
        content: "That user didn't exist, but they should now. Please try again!",
      });

    let embed = new Embed()
      .setTitle(user ? user.tag : member.user.tag)
      .setThumbnail(user ? user.avatarURL() : member.user.avatarURL())
      .setDescription(`${user ? `${user.tag}` + "'s" : 'Your'} current level is ${dbUser.level}`)
      .addField('Current XP', dbUser.xp.toString(), true)
      .addField('Required XP for Level Up', await (await this.LevelingManager.calculateRequiredXp(dbUser.id)).toString(), true)
      .build();

    interaction.reply({
      embeds: [embed],
    });
  }
}

module.exports = Level;
