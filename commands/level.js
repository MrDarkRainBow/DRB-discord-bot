const mongo = require('mongodb').MongoClient;
const config = require('../config.json');

module.exports = {
    name: 'level',
    description: 'Gives the user\'s level and xp untill next level',
    execute(message, args){
        mongo.connect(`${config.mongoURL}/usersDB`,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if(err){
                console.error(err);
                return;
            };
            
            if(!message.mentions.users.size){
                client.db('usersDB').collection(message.guild.id).find({_id: message.author.id}).toArray((err, user) => {
                    let nextLvl = (((5/6) * (+user[0].level + 1)) * (2 * ((+user[0].level + 1) * (+user[0].level + 1)) + 118)).toFixed(0);
                    message.reply(`your current level is ${user[0].level}, you have ${user[0].xp}xp and need ${nextLvl}xp for level ${user[0].level + 1}.`)
                });
                    
            }else{
                client.db('usersDB').collection(message.guild.id).find({_id: message.mentions.users.first().id}).toArray((err, user) => {
                    let nextLvl = (((5/6) * (+user[0].level + 1)) * (2 * ((+user[0].level + 1) * (+user[0].level + 1)) + 118)).toFixed(0);
                    message.channel.send(`<@${message.mentions.users.first().id}>'s current level is ${user[0].level}, and they have ${user[0].xp}xp`)
                });
            };
        });

    },
};