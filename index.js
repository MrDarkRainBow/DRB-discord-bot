const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
bot.commands = new Discord.Collection();

//load command files
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
};

//message in console when bot starts up
bot.once('ready', ready => {
    console.log("The bot is up and running!");
    
});

bot.on("message", message => {

    //event handler
    if(!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = bot.commands.get(commandName)
        || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if(!command) return;

    try{
        command.execute(message, args);
    }catch(error){
        console.error(error);
        message.reply("Well that didn't work :^|");
    }

    //suggestions channel managment system
    if(message.channel.id === config.suggestionsID && !message.author.bot){
        message.react("👍").then(r => {
            message.react("👎");
        });
    };
});

bot.login(config.token);