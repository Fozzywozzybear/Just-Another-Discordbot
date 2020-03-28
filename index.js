const Discord = require('discord.js');
const axios = require(`axios`)
const { prefix,token } = require('./config.json');
const client = new Discord.Client();
const fetch = require('node-fetch');
const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
const querystring = require('querystring');
const ytdl = require('ytdl-core');
const queue=new Map()


// Logs to see what the bot is doing 
client.once('ready',() => {
    console.log('Ready to go')
})
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

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
// Used to log in to server.
client.login(process.env.BOT_TOKEN);


/// The Api Function of tha app
client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(" ");
    const command = args.shift().toLowerCase();
    const serverQueue = queue.get(message.guild.id);
    
    if (message.content.startsWith(`${prefix}play`)){
        execute(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}skip`)){
        skip(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}stop`)){
        stop(message, serverQueue);
        return;
    } 
    
    // let args = message.content.substring(prefix.length).split(" ");
    
    // switch (args[0]){
    //     case 'play':
    //         function play(connection, message){
    //             var server = servers[message.guild.id];
                
    //             server.dispatcher = connection.play(ytdl(server.queue[0], {filter: "audioonly"}));

    //             server.queue.shift();

    //             server.dispatcher.on("end",function(){
    //                 if (server.queue[0]){
    //                     play(connection,message);
    //                 }else {
    //                     connection.disconnect();
    //                 }
                    
    //             });
            
            
    //         }

    //         if (!args[1]){
    //             message.channel.send("You need a link to the song");
    //             return;
    //         }
    //         if(!message.member.voice.channel){
    //             message.channel.send("You must be in a channel to play a song")
    //             return;
    //         }
    //         if(!servers[message.guild.id]) servers[message.guild.id] = {
    //             queue: []
    //         }

    //         var server = servers[message.guild.id];

    //         server.queue.push(args[1]);

    //         if(!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection){
    //             play(connection, message);
    //         })



    //     break;     

    // }

    //Start of commands for music section of bot.
    

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
async function execute(message, serverQueue){
    const args = message.content.split(" ");
    
    const voiceChannel = message.member.voice.channel
    if (!voiceChannel)
    return message.channel.send(
        "You need to be in a voice chanel to play music!"
    );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")){
        return message.channel.send(
            "I need the tape off my mouth so that I can talk."
        );
    }
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url,
};



if (!serverQueue){
    const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
    // Setting the queue using our contract
   queue.set(message.guild.id, queueContruct);
   // Pushing the song to our songs array
   queueContruct.songs.push(song);
   
   try {
    // Here we try to join the voicechat and save our connection into our object.
    var connection = await voiceChannel.join();
    queueContruct.connection = connection;
    // Calling the play function to start a song
    play(message.guild, queueContruct.songs[0]);
   } catch (err) {
    // Printing the error message if the bot fails to join the voicechat
    console.log(err);
    queue.delete(message.guild.id);
    return message.channel.send(err);

}
} else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return message.channel.send(`${song.title} has been added to the queue!`); 
}

}
function skip (message, serverQueue) {
    if (!message.member.voice.channel)
    return message.channel.send(
        "You have to be in a voice channel to stop the music!"
    );
    if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
}
function stop (message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }
  function play(guild, song){
    const serverQueue = queue.get(guild.id);
    if (!song){
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);}



   



client.login(token);