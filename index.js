const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
bot.commands = new Discord.Collection();
const mongo = require('mongodb').MongoClient;
const roles = require('./roles.json');

//load command files
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
};

//message in console when bot starts up
bot.once('ready', ready => {
    console.log("The bot is up and running!");
});

//read TOS.txt file and send message in users DM's when they join server. Can be dissabled in config
fs.readFile('TOS.txt', 'utf8', (err, data) => {
    if(err){
        console.error(err);
        return;
    };
    if(config.dmTOS === true){
        bot.on("guildMemberAdd", member => {
            member.send(data);
        });
    };
});

mongo.connect(`${config.mongoURL}/usersDB`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, client) => {
  
    const db = client.db('usersDB');
  
    //create new collection when joining a new server
    bot.on("guildCreate", guild => {
        console.log("created collection for: " + guild.name);
        db.createCollection(guild.id, (err, res) => {
            if(err){
                console.error(err);
                return;
            };
        });    
    });

    //drop collection when kicked or banned from server
    bot.on("guildDelete", guild => {
        console.log("dropped collection for: " + guild.name);
        db.dropCollection(guild.id, (err, res) => {
            if(err){
                console.error(err);
                return;
            };
        });
    });

    bot.on("message", message => {

        exist().then(xp());

        //suggestions channel managment system
        if(message.channel.id === config.suggestionsID && !message.author.bot){       
            message.react("👍").then(r => {
                message.react("👎");
            });
        };

        //add user page in db if it does not exist
        async function exist(){

            if(!message.author.bot){
                let exists = await db.collection(message.guild.id).findOne({_id: message.author.id});
            
                if(exists){
                    return;
                }else{
                    client.db('usersDB').collection(message.guild.id).insertOne({_id: message.author.id, xp: 0, level: 0, cooldown: 0});
                };
            }else{
                return;
            };
        };

        //generate random xp value and assign it to useres once a minute / cooldown amount
        async function xp(){
            let check = await db.collection(message.guild.id).findOne({_id: message.author.id});
            if(check){
                db.collection(message.guild.id).find({_id: message.author.id}).toArray((err, user) => {
                    if(err){
                        console.error(err);
                        return;
                    };
                    let newXP = +user[0].xp + Math.floor(Math.random()*10) + 10;
                    let nextLVL = (((5/6) * (+user[0].level +1))*(2*((+user[0].level + 1) * (+user[0].level + 1)) +27 +91)).toFixed(0);
                    if(+user[0].cooldown + config.xpCooldown < Date.now()){
                        db.collection(message.guild.id).updateOne({_id: message.author.id}, {'$set': {xp: newXP}});
                        db.collection(message.guild.id).updateOne({_id: message.author.id}, {'$set': {cooldown: Date.now()}});
                    };
                    if(newXP > nextLVL){
                        db.collection(message.guild.id).updateOne({_id: message.author.id}, {'$set': {level: +user[0].level + 1}});
                        message.reply(config.lvlupMsg);
                    };
                    switch(user[0].level){
                        case roles.roles[0].level:
                            message.member.roles.add(roles.roles[0].role);
                            break;
                        case roles.roles[1].level:
                            for(a = 1; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[2].level:
                            for(a = 2; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[3].level:
                            for(a = 3; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[4].level:
                            for(a = 4; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[5].level:
                            for(a = 5; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[6].level:
                            for(a = 6; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[7].level:
                            for(a = 7; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[8].level:
                            for(a = 8; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[9].level:
                            for(a = 9; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[10].level:
                            for(a = 10; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[11].level:
                            for(a = 11; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        case roles.roles[12].level:
                            for(a = 12; a >= 0; a--){
                                message.member.roles.add(roles.roles[a].role);
                            }
                            break;
                        default:
                            break;
                    };
                });
            };
        };

        //command handler
        if(!message.content.startsWith(config.prefix) || message.author.bot) return;

        const args = message.content.slice(config.prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = bot.commands.get(commandName)
            || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if(!command) return;

        try{
            command.execute(message, args);
        }catch(error){
            console.error(error);
            message.reply("Well that didn't work :^|");
        };   
    });
});

bot.login(config.token);