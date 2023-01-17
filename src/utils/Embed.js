const { MessageEmbed } = require('discord.js');
const config = require('../config');

class Embed {
  constructor() {
    this.embed = {};

    this.fields = [];
    this.color = config.colors.embeds.default;
    this.title = null;
    this.thumbnail = null;
    this.url = null;
    this.description = null;
    this.author = null;
    this.image = null;
    // this.footer = {
    //   text: config.bot.brand.name,
    //   iconURL: config.bot.brand.logo,
    // };

    this.hexMatch = new RegExp(/^#(?:[0-9a-fA-F]{3}){1,2}$/gim);
  }

  addField(name, value, inline = false) {
    if (!name) return console.log('No field name was provided');
    if (!value) return console.log('No field value was provided');

    let newField = {
      name,
      value,
      inline,
    };

    this.fields.push(newField);

    this.embed.fields = this.fields;

    return this;
  }

  setColor(color) {
    if (!this.hexMatch.test(color)) return console.log('Invalid HEX code was provided');

    this.color = color;

    return this;
  }

  setTitle(title) {
    if (title.length > 50) return console.log('A title cannot be longer than 50 characters.');

    this.title = title;
    this.embed.title = this.title;

    return this;
  }

  setDescription(description) {
    if (description.length > 2000) return console.log('Description length may not be longer than 2000 characters.');

    this.description = description;
    this.embed.description = this.description;

    return this;
  }

  setFooter(footer, icon) {
    if (icon && icon.length > 1500) return console.log('Invalid URL, length is > 1500');
    if (footer.length > 30) return console.log('Footer length may not be longer than 30 characters.');

    let newFooter = {
      text: footer,
      iconURL: icon || undefined,
    };

    this.footer = newFooter;

    return this;
  }

  setThumbnail(url) {
    if (url && url.length > 1500) return console.log('Invalid URL, length is > 1500');
    // if (!this.urlMatch.test(url))
    //   return console.log('Invalid URL, must begin with http(s)://');

    this.thumbnail = url;

    return this;
  }

  setTimestamp() {
    this.timestamp = true;
    return this;
  }

  setUrl(url) {
    if (url.length > 1500) return console.log('Invalid URL, length is > 1500');
    // if (!this.urlMatch.test(url))
    //   return console.log('Invalid URL, must begin with http(s)://');

    this.url = url;
    this.embed.url = this.url;

    return this;
  }

  setAuthor(text, url) {
    // if (url.length > 1500) return console.log('Invalid URL, length is > 1500');

    this.author = { name: text, iconURL: url };

    return this;
  }

  setImage(url) {
    this.image = url;

    return this;
  }

  build() {
    let buildEmbed = new MessageEmbed(this.embed).setColor(this.color);
    if (this.thumbnail !== null) buildEmbed.setThumbnail(this.thumbnail);
    if (this.timestamp) buildEmbed.setTimestamp();
    if (this.author) buildEmbed.setAuthor(this.author);
    if (this.image) buildEmbed.setImage(this.image);
    // buildEmbed.setTimestamp();

    return buildEmbed;
  }
}

module.exports = Embed;
