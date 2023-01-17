const { MessageActionRow, MessageButton } = require('discord.js');
const Embed = require('./Embed');

class ReactionRoleManager {
  constructor(client, guild) {
    this.client = client;
    this.guild = guild;
  }

  get emojiRegex() {
    return /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
  }

  getRole(id) {
    return this.guild.roles.cache.get(id);
  }

  getRoles() {
    let embedList = this.client.config.settings.reaction_roles.role_embeds;
    return embedList;
  }

  getChannel() {
    return this.guild.channels.cache.get(this.client.config.channels.required.reaction_role_channel);
  }

  buildActionRow(entries) {
    let comps = [];

    // create buttons

    entries.forEach(entry => {
      let comp = new MessageButton().setCustomId(`role-${entry[1]}`).setStyle('SECONDARY').setEmoji(entry[0]);

      comps.push(comp);
    });

    return new MessageActionRow({ components: comps });
  }

  async buildEmbeds() {
    let embeds = [];
    let rows = [];

    this.getRoles().forEach(embed => {
      let entries = Object.entries(embed.roles);

      rows.push({
        embed: new Embed()
          .setTitle(embed.embed_title)
          .setColor(embed.embed_color)
          .setDescription(`${entries.map(x => `${this.emojiRegex.test(x[0]) ? x[0] : this.client.emojis.cache.get(x[0])} : ${this.getRole(x[1])}`).join('\n')}`)
          .build(),
        row: this.buildActionRow(entries),
      });
    });

    return rows;
  }

  async switchMessages() {
    let channel = this.getChannel();

    let messages = (await channel.messages.fetch({ limit: 20 })).filter(m => m.author.bot && m.author.id === this.client.user.id);

    messages.forEach(m => m.delete());
  }

  giveRole(customId, member, i) {
    let roleId = customId.replace(/role\-/gim, '');
    let role = this.getRole(roleId);

    if (member.roles.cache.has(role.id)) {
      member.roles
        .remove(role)
        .then(r => {
          i.reply({ ephemeral: true, content: `Successfully removed the ${role} role!` });
        })
        .catch(err => {
          i.reply({
            ephemeral: true,
            content: `An error occurred and I couldn't remove the ${role} role.`,
          });
        });

      return;
    } else if (!member.roles.cache.has(role.id)) {
      member.roles
        .add(role)
        .then(r => {
          i.reply({ ephemeral: true, content: `Successfully added the ${role} role!` });
        })
        .catch(err => {
          i.reply({
            ephemeral: true,
            content: `An error occurred and I couldn't add the ${role} role.`,
          });
        });
    }
  }
}

module.exports = ReactionRoleManager;
