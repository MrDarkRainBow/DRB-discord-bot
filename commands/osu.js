const request = require("request");
const mongo = require('mongodb').MongoClient;
const config = require('../config.json');
const Discord = require('discord.js');

module.exports = {
    name: "osu",
    description: "shows a user's osu profile",
    execute(message, args) {
        mongo.connect(`${config.mongoURL}/usersDB`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if(err){
                console.error(err);
                return;
            };
            client.db('usersDB').collection(message.guild.id).find({_id: message.author.id}).toArray((err, user) => {
                if(err) console.error(err);
                request(`https://osu.ppy.sh/api/get_user?k=${config.osuKey}&u=${user[0].osu}`, {json: true}, (err, res, body) => {
                    if(err) console.error(err);
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(`osu standard profile for ${body[0].username}`, `https://osu.ppy.sh/images/flags/${body[0].country}.png`)
                        .setThumbnail(`http://s.ppy.sh/a/${user[0].osu}`)
                        .setDescription(`▸ **Official rank:** #${body[0].pp_rank} (${body[0].country}#${body[0].pp_country_rank})\n ▸ **Level:** ${(+body[0].level).toFixed(0)} (${(+body[0].level % 1).toFixed(4) * 100}%)\n ▸ **Total PP:** ${body[0].pp_raw}\n ▸ **Hit Accuracy:** ${(+body[0].accuracy).toFixed(2)}%\n ▸ **Playcount:** ${body[0].playcount}`)
                        .setColor(message.member.roles.color.hexColor)
                    message.channel.send(embed);
                });
            }); 
        });   
    },
};