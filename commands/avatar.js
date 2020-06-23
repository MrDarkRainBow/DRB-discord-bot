const Discord = require("discord.js");

module.exports = {
    name: "avatar",
    description: "returns a users avatar",
    aliases: ["pfp", "icon"],
    execute(message, args){
        let embed;
        if(!message.mentions.users.size){
            embed = new Discord.MessageAttachment(message.author.avatarURL({format: "png", dynamic: true, size: 1024}));
        }else{
            embed = new Discord.MessageAttachment(message.mentions.users.first().avatarURL({format: "png", dynamic: true, size: 1024}));
        };
        
        message.channel.send(embed);
    },
};