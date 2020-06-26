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
            async function reset(){
                client.db('usersDB').collection(message.guild.id).updateOne({_id: +message.author.id}, {'$set': {xp: 0}});
                message.reply('your xp has been reset');
            };
            reset();
        });
    },
};