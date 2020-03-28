const Discord = require('discord.js');
const axios = require(`axios`)
const { prefix,token } = require('./config.json');
const client = new Discord.Client();
const fetch = require('node-fetch');
const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
const querystring = require('querystring');
const ytdl = require('ytdl-core');
var servers = {};

client.once('ready',() => {
    console.log('Ready to go')
})

/*client.on('message',message => {
    //console.log(message.content);
    //!test will run the bot to prompt with This is working 
    if(message.content.startsWith(`${prefix}test`)){
        message.channel.send("This is working")
    } else if (message.content === `${prefix}server`){
        message.channel.send(`This server's name is: ${message.guild.name}`)
    }
})
*/
/// The Api Function of tha app
client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	//const args = message.content.slice(prefix.length).split(" ");
    //const command = args.shift().toLowerCase();
    let args = message.content.substring(prefix.length).split(" ");
    
    switch (args[0]){
        case 'play':
            function play(connection, message){
                var server = servers[message.guild.id];
                
                server.dispatcher = connection.play(ytdl(server.queue[0], {filter: "audioonly"}));

                server.queue.shift();

                server.dispatcher.on("end",function(){
                    if (server.queue[0]){
                        play(connection,message);
                    }else {
                        connection.disconnect();
                    }
                    
                });
            
            
            }

            if (!args[1]){
                message.channel.send("You need a link to the song");
                return;
            }
            if(!message.member.voice.channel){
                message.channel.send("You must be in a channel to play a song")
                return;
            }
            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if(!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection){
                play(connection, message);
            })



        break;     

    }

	if (command === 'cat') {
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
    
        message.channel.send(file);
    } else if (command === 'urban') {
        if (!args.length) {
            return message.channel.send('You need to supply a search term!');
        }

        const query = querystring.stringify({ term: args.join(' ') });
        
        const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(response => response.json());
        
        if (!list.length) {
            return message.channel.send(`No results found for **${args.join(' ')}**.`);
        }
        const [answer] = list;

        const embed = new Discord.MessageEmbed()
            .setColor('#EFFF00')
            .setTitle(answer.word)
            .setURL(answer.permalink)
            .addFields(
            { name: 'Definition', value: trim(answer.definition, 1024) },
            { name: 'Example', value: trim(answer.example, 1024) },
            { name: 'Rating', value: `${answer.thumbs_up} thumbs up. ${answer.thumbs_down} thumbs down.` }
            );

        message.channel.send(embed);

        }
        if ( command == `joke`){
            let getJoke = async() => {
                let response = await axios.get ('https://official-joke-api.appspot.com/random_joke')
                let joke = response.data
                return joke
            }
            let jokeValue = await getJoke();
            console.log(jokeValue)
            message.channel.send(`Here's your joke \n ${jokeValue.setup}\n\n ${jokeValue.punchline}`)
        }
       

});



client.login(token);