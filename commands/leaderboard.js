const mongo = require('mongodb').MongoClient;
const config = require('../config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'leaderboard',
    description: 'shows the xp leaderboard for the server.',
    aliases: ['lb'],
    execute(message, args){
        function embed(page, pages, array, rank) {
            let passedPeople = 5 * page;
            let perPage = +array.length - passedPeople;
            let forA = 0;
            if(perPage < 0){
                forA = perPage + 5;
            }else{
                forA = 5;
            };
            const embed = new Discord.MessageEmbed()
                .setColor('#e027e3')
                .setTitle(`This is the leaderboard for ${message.guild.name}`)
                for(a = forA; a > 0; a--){
                    let user = forA - a + 5 * (page - 1);
                    let position = user + 1;
                    embed.addFields(
                        {name: `${position}. place:`, value: `<@${array[user]._id}>`, inline: true},
                        {name: 'xp', value: array[user].xp, inline: true},
                        {name:"\u200B", value:"\u200B", inline: true},
                    )
                };
                embed.setFooter(`You are currently at rank #${rank}                  page ${page} of ${pages}`)
            return embed;
        };

        mongo.connect(`${config.mongoURL}/usersDB`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            client.db('usersDB').collection(message.guild.id).find().sort([['xp', -1]]).toArray((err, lb)=>{
                let rank = lb.findIndex(x => x.id = message.author.id);
                let page = 1;
                let pages = (lb.length / 5).toFixed(0);
                if(!message.author.bot){
                    message.channel.send(embed(page, pages, lb, rank)).then(msg =>{
                        msg.react("⬅").then(r =>{
                            msg.react("➡")
                        });
                    });
                };
                //reaction collectors for page moving
                const filterF = (reaction, user) => reaction.emoji.name === "➡" && !user.bot;
                const filterB = (reaction, user) => reaction.emoji.name === "⬅" && !user.bot;
        
                const back = message.createReactionCollector(filterB, {time: 30000});
                const forward = message.createReactionCollector(filterF, {time: 30000});
        
                back.on('collect', r =>{
                if(page === 1){
                }else{
                    page = page - 1;
                    let pages = (lb.length / 5).toFixed(0);
                    message.edit(embed(page, pages, lb, rank));
                    message.reactions.removeAll().then(msg =>{
                    msg.react("⬅").then(r =>{
                        msg.react("➡")
                    });
                    });
                };
                });
                back.on('end', r=>{
                message.reactions.removeAll();
                });
        
                forward.on('collect', r =>{
                page = page + 1;
                let pages = (lb.length / 5).toFixed(0);
                if(page > pages){
                    page = 1;
                };
                message.edit(embed(page, pages, lb, rank));
                message.reactions.removeAll().then(msg =>{
                    msg.react("⬅").then(r =>{
                    msg.react("➡")
                    });
                });
                });
                forward.on('end', r=>{
                message.reactions.removeAll();
                });
            });
        }); 
    },
};