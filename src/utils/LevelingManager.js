const { messages } = require('../config');
const Embed = require('./Embed');
const parseMsg = require('./parseMsg');

class LevelingManager {
  constructor(client) {
    this.client = client;
    this.db = this.client.DB;
  }

  async getUserLevel(id) {
    let user = await this.db.findUser(id);
    return parseInt(user.level);
  }

  async getUserXp(id) {
    let user = await this.db.findUser(id);
    return parseInt(user.xp);
  }

  async addUserXp(id, amount) {
    let user = await this.db.findUser(id);

    user.xp = parseInt(user.xp) + amount;
    user.save();
  }

  async calculateLevel(xp) {
    let rate = this.client.config.settings.leveling.required_xp;

    return Math.ceil(xp / (4 * rate));
  }

  async calculateRequiredXp(id) {
    let user = await this.db.findUser(id);
    let level = user.level;
    let rate = this.client.config.settings.leveling.required_xp;
    return level * (rate + rate) * 2;
  }

  async userLevelUp(id, channel, newLevel, msgContext) {
    let levelRoles = this.client.config.settings.leveling.roles;
    let member = this.client.guilds.cache.get(this.client.config.bot.guildId).members.cache.get(id);

    let user = await this.db.findUser(id);
    let levelUpEmbed = new Embed().setTitle('Level Up!').setDescription(
      await parseMsg(this.client.config.messages.leveling.level_up_message, {
        ...msgContext,
        level: newLevel,
      })
    );

    channel.send({ embeds: [levelUpEmbed] });

    user.level = parseInt(newLevel);
    user.save();

    if (levelRoles[`${user.level}`]) {
      Object.entries(levelRoles)
        .filter(x => user.level >= parseInt(x[0]))
        .forEach(async role => {
          let roleId = role[role.length - 1];
          if (member.roles.cache.has(roleId)) return;
          let roleAddEmbed = new Embed().setDescription(await parseMsg(this.client.config.messages.leveling.level_role_add_message, { ...msgContext, role: roleId }));
          member.roles.add(roleId).then(m => {
            channel.send({ embeds: [roleAddEmbed] });
          });
        });
    }
  }

  rollXp(id) {
    // let xpOne = Math.floor(
    //   Math.random() * this.client.config.settings.leveling.xp_frequency
    // );
    // let xpTwo = Math.floor(
    //   Math.random() * this.client.config.settings.leveling.xp_frequency
    // );

    let member = this.client.guilds.cache.get(this.client.config.bot.guildId).members.cache.get(id);
    let boosterMulti = member.roles.cache.has(this.client.config.roles.required.booster_role) ? 2 : 1;

    let randomXp = Math.floor(Math.random(this.client.config.settings.leveling.xp_min_per_message) * this.client.config.settings.leveling.xp_max_per_message);

    randomXp = randomXp * (this.client.config.settings.leveling.xp_multiplier * boosterMulti);

    console.log(this.client.config.settings.leveling.xp_multiplier * boosterMulti);
    console.log(`${randomXp} XP`);

    this.addUserXp(id, randomXp);

    return randomXp;
  }

  async getLeaderboard() {
    let lb = [];
    let allUsers = await this.client.DB.users
      .find({ level: { $gte: 0 } })
      .sort([['level', 'descending']])
      .limit(10);

    allUsers.forEach(user => {
      let pos = allUsers.indexOf(user) + 1;
      lb.push({ position: pos, level: user.level, userId: user.id });
    });

    return lb;
  }
}

module.exports = LevelingManager;
