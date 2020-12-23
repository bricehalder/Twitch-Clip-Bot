const Discord = require('discord.js');
const SQLite = require('better-sqlite3');
const config = require('./config.json');
const {commands} = require('./commands/commands');

const client = new Discord.Client();
const sql = new SQLite('./db/guilds.sqlite');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const guildList = client.guilds.cache.array();
  guildList.forEach((guild) => console.log(guild.name));

  const tables = sql.prepare(
      'SELECT count(*) \
       FROM sqlite_master \
       WHERE type=\'table\';').get();

  console.log(`Table count: ${tables['count(*)']}`);

  if (!tables['count(*)'] == 1) {
    sql.prepare(
        'CREATE TABLE guilds ( \
          id INTEGER PRIMARY KEY, name TEXT \
        );').run();
    sql.prepare('CREATE UNIQUE INDEX idx_guilds_id ON guilds (id);').run();
    sql.pragma('synchronous = 1');
    sql.pragma('journal_mode = wal');
  }

  client.getGuild = sql.prepare('SELECT * FROM guilds WHERE id = ?');
  client.setGuild = sql.prepare(
      'INSERT OR REPLACE INTO guilds (id, name) \
       VALUES (@id, @name);');
});

client.on('message', (message) => {
  try {
    if (!message.guild ||
        !message.content.startsWith(config.prefix) ||
         message.author.bot) return;

    if (!config.prod) {
      if (!config.testServers.includes(message.guild.id)) return;
    }

    guild = client.getGuild.get(message.guild.id);
    if (!guild) {
      guild = {
        id: message.guild.id,
        name: message.guild.name,
      };
      client.setGuild.run(guild);
    }

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const userCommand = args.shift().toLowerCase();

    for (Command of commands) {
      cmd = new Command();
      if (cmd.aliases.includes(userCommand)) {
        cmd.executeHandler(args, message);
        return;
      }
    }

    if (userCommand === 'help' || userCommand === '?') {
      helpStr = 'The available commands are:\n\n';
      for (Command of commands) {
        cmd = new Command();
        helpStr += `${config.prefix}${cmd.name} - ${cmd.help}\n`;
      }
      message.channel.send(helpStr);
      return;
    }

    console.log(`Unrecognized command: ${userCommand}\n`);
  } catch (err) {
    console.log(err);
  }
});

client.login(config.token);
