const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
bot.commands = new Discord.Collection();
const mongo = require('mongodb').MongoClient;

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

mongo.connect(`${config.mongoURL}/usersDB`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, client) => {
    if(err){
        console.error(err);
        return;
    };

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

        exist();

        //add user page in db if it does not exist
        async function exist(){
            let exists = await db.collection(message.guild.id).findOne({_id: +message.author.id});
            
            if(exists){
                return;
            }else{
                client.db('usersDB').collection(message.guild.id).insertOne({_id: +message.author.id, xp: 0, level: 0, cooldown: 0});
                console.log('added user');
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