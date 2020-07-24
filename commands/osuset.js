const mongo = require('mongodb').MongoClient;
const config = require('../config.json');
const request = require('request');

module.exports = {
    name: "osuset",
    description: "set the users osu profile",
    execute(message, args){
        mongo.connect(`${config.mongoURL}/usersDB`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if(err){
                console.error(err);
                return;
            };
            request(`https://osu.ppy.sh/api/get_user?k=${config.osuKey}&u=${args[0]}&type=string`, {json: true}, (err, res, body) => {
                if(err) console.error(err);
                console.log(body[0].user_id)
                client.db('usersDB').collection(message.guild.id).updateOne({_id: message.author.id}, {'$set': {osu: body[0].user_id}});
            })
        });
    },
};