module.exports = {
    name: 'purge',
    description: 'deletes a large amount of messages at once',
    aliases: 'clear',
    execute(message, args){
        const amount = args.join(" ");
        if(!amount) return message.reply("you have to specify the number of messages to remove!");
        if(isNaN(amount)) return message.reply("amount has to be a number!");
        if(amount > 100) return message.reply("you can not delete more than 100 messages at once!");
        if(message.member.hasPermission('MANAGE_MESSAGES')){
            message.channel.messages.fetch({limit: +args[0] + 1}).then(messages => {
                message.channel.bulkDelete(messages);
            });
        }else{
            message.reply('you do not have the permissions to do that.');
        };
    }
};