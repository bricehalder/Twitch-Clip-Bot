// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const {Command} = require('./command');
const {prefix} = require('../config.json');

module.exports = {
  SendClip:
    class SendClip extends Command {
      constructor() {
        super();
        this.name = 'sendclip';
        this.aliases = [this.name, 'sc'];
        this.usage = `${prefix}${this.name} [Streamer Name]`;
        this.help = 'Routinely sends clips from the past day from a specfic streamer.';
        this.description = this.help;
      }

      /**
    * Executes the command.
    * @param {string[]} args - The arguments provided for the command.
    * @param {Discord.Message} message - The Discord message calling the command.
    */
      async execute(args, message) {
        if (args.length === 0) {
          message.channel.send(Math.floor((Math.random() * 100) + 1));
        } else {
          const num = Number.parseInt(args[0]);
          if (isNaN(num)) {
            throw Error('Not a number!');
          }
          message.channel.send(Math.floor((Math.random() * num) + 1));
        }
      };
    },
};
