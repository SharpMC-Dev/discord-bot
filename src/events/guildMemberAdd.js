const Embed = require('../utils/Embed');
const parseMsg = require('../utils/parseMsg');

class GuildMemberAdd {
  constructor(client) {
    this.client = client;
    this.enable = true;
  }

  async run(member) {
    let ctx = { targetUser: member, guild: member.guild };
    let config = this.client.config;
    let join_message_channel = this.client.guilds.cache
      .get(config.bot.guildId)
      .channels.cache.get(config.channels.required.join_message_channel);

    if (!join_message_channel)
      return console.log(
        'Invalid join message channel was provided. Please check this and try again.'
      );

    const findUser = await this.client.DB.findUser(member.id);
    if (!findUser) {
      this.client.DB.createUser(member.id);

      console.log(`saved a new user to the DB: ${member.user.tag}`);
    }

    if (!config.features.messaging.join_messages) return;

    let joinEmbed = new Embed()
      .setTitle(
        await parseMsg(config.messages.join_message.join_embed_title, ctx)
      )
      .setDescription(
        await parseMsg(config.messages.join_message.join_embed_description, ctx)
      )
      .setThumbnail(member.user.avatarURL())
      .build();

    join_message_channel.send({ embeds: [joinEmbed] });
  }
}
module.exports = GuildMemberAdd;
