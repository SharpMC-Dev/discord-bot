const { Client, Collection } = require('discord.js');
const io = require('socket.io-client');
const fs = require('fs'),
  path = require('path');

class Bot extends Client {
  constructor(options = {}) {
    super(options);

    this.config = require('../config');
    this.commands = new Collection();
    this.DB = new (require('../utils/DB'))();

    this.socket = io('http://socket.chathubfeedback.com:7070/');
  }

  get directory() {
    return `${path.dirname(__dirname)}${path.sep}`;
  }

  loadCommands() {
    fs.readdir(`${this.directory}/commands`, (er, files) => {
      if (er) throw new Error(er);

      files.forEach(file => {
        const command = new (require(`${this.directory}/commands/${file}`))(this),
          commandname = command.name;

        this.commands.set(commandname, command);

        console.log(`Command: ${commandname} is LOADED`);
      });
    });

    // loadNewCommands(this);
  }

  loadEvents() {
    fs.readdir(`${this.directory}/events`, (er, files) => {
      if (er) throw new Error(er);

      files.forEach(file => {
        const event = new (require(`${this.directory}/events/${file}`))(this),
          eventname = file.slice(file.lastIndexOf('/') + 1, file.length - 3);

        console.log(`Event: ${eventname} is ${event.enable ? 'ENABLED +' : 'DISABLED x'}`);

        if (event.enable) super.on(eventname, (...args) => event.run(...args));
      });
    });
  }

  login() {
    super.login(this.config.bot.token);
  }

  init() {
    this.DB.connect();
    this.loadEvents();
    this.loadCommands();
    this.login();
  }
}

module.exports = Bot;
