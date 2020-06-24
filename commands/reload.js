module.exports = {
    name: 'reload',
    description: 'reloads a command',
    execute(message, args){
        if(!args.length){
            message.reply("you didn't specify a command.");
            return;
        };
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if(!command){
            message.reply('that command doesn\'t exist.');
            return;
        };

        delete require.cache[require.resolve(`./${commandName}.js`)];

        try{
            const newCommand = require(`./${commandName}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            message.reply("command reloaded successfully.");
        }catch(error){
            console.log(error);
            message.reply("there was an error reloading the command.");
        };
    },
};