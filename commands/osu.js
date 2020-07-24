const request = require("request");
const mongo = require('mongodb').MongoClient;
const config = require('../config.json');

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
                    message.reply(`your osu username is ${body[0].username}`);
                });
            }); 
        });   
    },
};