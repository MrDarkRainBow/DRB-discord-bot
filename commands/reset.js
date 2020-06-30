const mongo = require('mongodb').MongoClient;
const config = require('../config.json');

module.exports = {
    name: 'reset',
    description: 'resets a users xp',
    execute(message, args){
        mongo.connect(`${config.mongoURL}/usersDB`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if(err){
                console.error(err);
                return;
            };
            if(!message.mentions.users.size){
                message.reply('your xp has been reset');
                client.db('usersDB').collection(message.guild.id).updateOne({_id: message.author.id}, {'$set': {xp: 0}});
                client.db('usersDB').collection(message.guild.id).updateOne({_id: message.author.id}, {'$set': {level: 0}});
            }else{
                if(message.member.hasPermission("ADMINISTRATOR")){
                    message.reply(`<@${message.mentions.users.first().id}>'s xp has been reset`);
                    client.db('usersDB').collection(message.guild.id).updateOne({_id: message.mentions.users.first().id}, {'$set': {xp: 0}});
                    client.db('usersDB').collection(message.guild.id).updateOne({_id: message.mentions.users.first().id}, {'$set': {level: 0}});
                }else{
                    message.reply("you do not have the permissions for that!");
                };
            };
            
        });
    },
};