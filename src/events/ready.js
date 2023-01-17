const loadNewCommands = require('../utils/loadNewCommands');
const parseMsg = require('../utils/parseMsg');

class Ready {
  constructor(client) {
    this.client = client;
    this.enable = true;
    this.TicketManager = new (require('../utils/TicketManager'))(this.client);
    this.VerifyManager = new (require('../utils/VerificationManager'))(this.client);
  }

  async run() {
    const runningGuild = this.client.guilds.cache.get(this.client.config.bot.guildId);
    if (!runningGuild) return console.log('An invalid guild ID was provided. Please check this and try again.');

    // const SocketListener = new (require('../utils/socketListener'))(this.client, runningGuild);

    const ReactionRoleManager = new (require('../utils/ReactionRoleManager'))(this.client, runningGuild);

    console.log(
      await parseMsg(this.client.config.messages.bot.successfully_logged_in, {
        client: this.client,
      })
    );

    loadNewCommands(this.client);

    if (this.client.config.test) return console.log('running in test mode');

    // SocketListener.feedbackListener(runningGuild);

    await this.TicketManager.sendOpenEmbed();
    // await this.VerifyManager.sendOpenEmbed();

    let reactionRoleEmbeds = await ReactionRoleManager.buildEmbeds();
    let reactionRoleChannel = await ReactionRoleManager.getChannel();

    await ReactionRoleManager.switchMessages();

    reactionRoleEmbeds.forEach(async entry => {
      reactionRoleChannel.send({
        embeds: [entry.embed],
        components: [entry.row],
      });
    });

    setInterval(() => {
      this.client.DB.findGuild(runningGuild.id);
    }, 60000);
  }
}

module.exports = Ready;
