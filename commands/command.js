// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const {prefix} = require('../config.json');

module.exports = {

  Command: class Command {
    constructor() {
      this.name = '';
      this.aliases = [this.name];
      this.usage = `${prefix}${this.name}`;
      this.help = '';
      this.description = this.help;
    }

    async sendUsage(channel) {
      channel.send(`Usage: ${this.usage}`);
    }

    /**
  * Execute handler for the command.
  * @param {string[]} args - The arguments provided for the command.
  * @param {Discord.Message} message - The Discord message calling the command.
  */
    executeHandler(args, message) {
      try {
        this.execute(args, message);
      } catch (error) {
        console.log(`${this.name} error: ${error}`);
        this.sendUsage(message.channel);
      }
    };
  },
};
