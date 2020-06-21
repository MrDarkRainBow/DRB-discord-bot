const Discord = require("discord.js");
const bot = new Discord.Client();

bot.once('ready', ready => {
    console.log("The bot is up and running!");
    
});

bot.login("yourToken");