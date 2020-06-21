const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");

bot.once('ready', ready => {
    console.log("The bot is up and running!");
    
});

bot.login(config.token);