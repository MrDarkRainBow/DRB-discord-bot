const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
bot.commands = new Discord.Collection();
const mongo = require('mongodb').MongoClient;
const channels = require('./channels.json');
const words = require('./words.json');
const roles = require('./roles.json')

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

//simple round to 5 function

function round5(x){
    return Math.floor(x/5)*5;
};

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

        exist().then(xp()).then(levelRoles()).then(leaderboard());

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
            if(channels.channels.includes(message.channel.id)) return;
            for(a = words.length; a >= 0; a--){
                if(message.content.includes(words.xp-banned[a])) return;
            };
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
                });
            };
        };

        //leaderboard command embed function
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

        async function leaderboard() {
            client.db('usersDB').collection(message.guild.id).find().sort([['xp', -1]]).toArray((err, lb)=>{
                let rank = lb.findIndex(x => x.id = message.author.id);
                let page = 1;
                let pages = (lb.length / 5).toFixed(0);
                if(message.content === "!leaderboard" || message.content === "!lb"){
                    if(!message.author.bot){
                        message.channel.send(embed(page, pages, lb, rank)).then(msg =>{
                            msg.react("⬅").then(r =>{
                                msg.react("➡")
                            });
                        });
                    };
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
        };

        async function levelRoles(){
            let result = await db.collection(message.guild.id).findOne({_id: message.author.id});
            if(!result) return;
            if(message.author.bot) return;
            db.collection(message.guild.id).find({_id: message.author.id}).toArray((err, user) => {
                let level = round5(user[0].level);
                switch(level){
                    case 1:
                        message.member.roles.add(roles.level1);
                        break;
                    case 5:
                        message.member.roles.add(roles.level5);
                        break;
                    case 10:
                        message.member.roles.add(roles.level10);
                        break;
                    case 15:
                        message.member.roles.add(roles.level15);
                        break;
                    case 20:
                        message.member.roles.add(roles.level20);
                        break;
                    case 25:
                        message.member.roles.add(roles.level25);
                        break;
                    case 30:
                        message.member.roles.add(roles.level30);
                        break;
                    case 35:
                        message.member.roles.add(roles.level35);
                        break;
                    case 40:
                        message.member.roles.add(roles.level40);
                        break;
                    case 45:
                        message.member.roles.add(roles.level45);
                        break;
                    case 50:
                        message.member.roles.add(roles.level50);
                        break;
                    case 55:
                        message.member.roles.add(roles.level55);
                        break;
                    case 60:
                        message.member.roles.add(roles.level60);
                        break;
                    default:
                        break;
                };
            });
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