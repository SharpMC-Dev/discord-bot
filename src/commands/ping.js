const Command = require('../structures/Command');

class Ping extends Command {
  constructor(client) {
    super(client, {
      enable: true,
      name: 'ping',
      description: 'Pong!',
      options: [],
    });
  }

  async run({ interaction }) {
    interaction.reply({
      content: `Pong! 🏓`,
      ephemeral: true,
    });
  }
}

module.exports = Ping;
