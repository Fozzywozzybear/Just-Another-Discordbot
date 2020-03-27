const Discord = require('discord.js');
const { prefix,token } = require('./config.json');
const client = new Discord.Client();


client.once('ready',() => {
    console.log('Ready to go')
})

client.on('message',message => {
    //console.log(message.content);
    //!test will run the bot to prompt with This is working 
    if(message.content.startsWith(`${prefix}test`)){
        message.channel.send("This is working")
    } else if (message.content === `${prefix}server`){
        message.channel.send(`This server's name is: ${message.guild.name}`)
    }
})

client.login(token);