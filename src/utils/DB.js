const mongoose = require('mongoose');

class DB {
  constructor() {
    this.users = require('../models/user');
    this.guilds = require('../models/guild');
    this.modlogs = require('../models/modlog');
    this.tickets = require('../models/ticket');
    this.connection_uri = require('../config').bot.db_uri;
  }

  async findTicket(id, findUser) {
    if (findUser) {
      return this.tickets.findOne({ userId: id });
    } else {
      return this.tickets.findOne({ id });
    }
  }

  async createTicket(id, user) {
    let newTicket = new this.tickets({
      id,
      userId: user.id,
    });

    return newTicket.save();
  }

  async getUserModel() {
    return this.users;
  }

  async findUser(id) {
    let user = await this.users.findOne({ id });
    if (!user) {
      let newUser = new this.users({
        id,
        xp: 0,
        level: 1,
        ticket: false,
      });

      newUser.save().then(doc => {
        console.log(doc);
        return doc;
      });
    } else {
      return user;
    }
  }

  async findModLogs(userId) {
    return await this.modlogs.findOne({ userId });
  }

  async findAllModLogs(userId) {
    return await this.modlogs.find({ userId });
  }

  async findGuild(id) {
    return await this.guilds.findOne({ id });
  }

  async createGuild(id) {
    const newGuild = new this.guilds({
      id,
      ticketMessageId: null,
    });

    newGuild.save();
  }

  async createUser(id, options) {
    const newUser = new this.users({
      id,
      ...options,
    });

    return newUser.save();
  }

  async updateUserTicket(id, hasTicket) {
    let user = await this.findUser(id);
    if (!user) {
      this.createUser(id, {
        ticket: hasTicket,
      });
    } else {
      user.ticket = hasTicket;
      user.save();
    }
  }

  async addInfractionToUser(id) {
    let user = await this.findUser(id);
    if (!user) {
      this.createUser(id, { infractions: 1 });
    } else {
      user.infractions = user.infractions + 1;
      user.save();
    }
  }

  createModlog(userId, modlog) {
    const newModlog = new this.modlogs({
      userId,
      executorId: modlog.executor.id,
      reason: modlog.reason,
      action: modlog.action,
    });

    newModlog.save();
  }

  async connect() {
    mongoose
      .connect(this.connection_uri, {
        connectTimeoutMS: 30000,
      })
      .then(connection => {
        console.log('Connected to the DB!');
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = DB;
