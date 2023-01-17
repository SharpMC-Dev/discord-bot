const Discord = require('discord.js'),
  path = require('path'),
  Command = require('../structures/Command.js');
const Embed = require('../utils/Embed.js');
const moment = require('moment');

class ChatGame extends Command {
  constructor(client) {
    super(client, {
      name: 'chatgame',
      description: 'Send a message with emphasis!',
      options: [
        {
          name: 'game',
          type: 'STRING',
          description: 'The type of game you want to start',
          required: true,
          choices: [
            { name: 'math', value: 'math' },
            { name: 'scrambler', value: 'scrambler' },
          ],
        },
      ],
    });
    this.client = client;
    this.gameManager = new (require('../utils/chatGames'))(this.client);
  }

  checkUnixTimestamp(currentUnixTimestamp, futureUnixTimestamp) {
    if (currentUnixTimestamp > futureUnixTimestamp) {
      return true;
    } else {
      return false;
    }
  }

  async run({ interaction, member, game }) {
    let dbUser = await this.client.DB.findUser(member.id);
    if (!dbUser) return interaction.reply({ ephemeral: true, content: "You weren't in our system. Try again!" });
    let settings = this.client.config.settings;

    if (!member.roles.cache.has(settings.leveling.roles[settings.leveling.level_perks.chat_games])) return interaction.reply({ ephemeral: true, content: 'You must be level 60 or higher to use /chatgame!' });

    let tilNextGame = dbUser.nextGame || 0;

    if (!this.checkUnixTimestamp(new Date(), tilNextGame)) return interaction.reply({ ephemeral: true, content: 'You need to wait at least 5 minutes between chat games!' });

    if (game == 'scrambler') {
      let { correctWord, scrambledWord } = this.gameManager.scramble();

      let messages = [];
      let embed = new Embed().setDescription(`${member} has started a game of **ScRaMblER 🎲**!\n\nThe first person to unscramble **${scrambledWord}** wins a prize!`).build();
      interaction.channel.send({ embeds: [embed] });
      interaction.reply({ ephemeral: true, content: 'Your game has been started successfully!' });
      let now = new Date();
      let nextGame = moment(now).add(5, 'minutes').format('x');
      dbUser.nextGame = nextGame;
      dbUser.save();

      interaction.channel
        .awaitMessages({ max: 1, filter: m => !m.author.bot && m.content.toLowerCase() === correctWord, time: 60000, errors: ['time'] })
        .then(collected => {
          let message = collected.first();
          messages.push(message);

          let embed = new Embed().setDescription(`${message.author} correctly guessed the word! It was **${correctWord}**!`).build();

          interaction.channel.send({ embeds: [embed] });
          messages.forEach(msg => msg.delete());
        })
        .catch(col => {
          let embed = new Embed().setDescription(`The chat game has ended! Nobody guessed the word correctly. The word was **${correctWord}**`).build();

          interaction.channel.send({ embeds: [embed] });
          messages.forEach(msg => msg.delete());
        });
    } else if (game == 'math') {
      let { equation, answer } = this.gameManager.math();
      console.log(answer);

      let messages = [];
      let embed = new Embed().setDescription(`${member} has started a game of **Calculator 🧮**!\n\nThe first person to answer **${equation}** correctly wins a prize!`).build();
      interaction.channel.send({ embeds: [embed] });
      interaction.reply({ ephemeral: true, content: 'Your game has been started successfully!' });
      let now = new Date();
      let nextGame = moment(now).add(5, 'minutes').format('x');
      dbUser.nextGame = nextGame;
      dbUser.save();

      interaction.channel
        .awaitMessages({ max: 1, filter: m => !m.author.bot && m.content.toLowerCase() === answer.toString(), time: 60000, errors: ['time'] })
        .then(collected => {
          let message = collected.first();
          messages.push(message);

          let embed = new Embed().setDescription(`${message.author} correctly answered the equation! It was **${answer}**!`).build();

          interaction.channel.send({ embeds: [embed] });
          messages.forEach(msg => msg.delete());
        })
        .catch(col => {
          let embed = new Embed().setDescription(`The chat game has ended! Nobody got the answer. It was **${answer}**`).build();

          interaction.channel.send({ embeds: [embed] });
          messages.forEach(msg => msg.delete());
        });
    }
  }
}

module.exports = ChatGame;
