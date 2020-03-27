const Discord = require('discord.js');
const axios = require(`axios`)
const { prefix,token } = require('./config.json');
const client = new Discord.Client();
const fetch = require('node-fetch');
const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
const querystring = require('querystring');


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

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

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
        if ( command == `covid`){
            let getCovid = async() => {
                let response = await axios.get ('https://covid2019-api.herokuapp.com/v2/current')
                let covid = response.data
                return covid
            }
            let TotalValue = await getCovid();
            console.log(TotalValue)
            message.channel.send(TotalValue)
        }

});



client.login(token);