const WebSocket = require('ws');
const Discord = require("discord.js");
require('dotenv').config();
let isOpen;
const prefix = "!";
const host = 'www.chapo.chat';
const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);

const handleRegistration = (data) => {
  if(data.site.open_registration !== isOpen){
    isOpen = data.site.open_registration
    isOpen == true ? client.channels.cache.get('740815431853539401').send(`@here, Chapo.Chat changed registration status to OPEN`) : client.channels.cache.get('740815431853539401').send(`@here, Chapo.Chat changed registration status to CLOSED`)
  } else {
    return;
  }
}

const isRegistrationOpen = () => {
  ws.send(JSON.stringify({
    op: 'GetSite',
    data: {}
  }));
}


client.on('message', message => {
  console.log(`message received`)
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  
  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();
  console.log(command);

  if (command === "bancheck") {
    var ws2 = new WebSocket('wss://' + host + '/api/v1/ws');
    ws2.on('open', () => {
      console.log('WS2 connection succeed!');
      ws2.send(JSON.stringify({
        op: 'GetUserDetails',
        data: {
          limit: 20,
          page: 1,
          saved_only: false,
          sort: "New",
          user_id: null,
          username: args[0]
        }
      }));
    });
    ws2.on('message', (msg) => {
      try {
        const res = JSON.parse(msg);
        if(res.error){
          return message.channel.send(`Chapo Error: ${res.error}`)
        } else {
          return res.data.user.banned == true ? message.channel.send(`${res.data.user.name} is banned!`) : message.channel.send(`${res.data.user.name} is not banned!`);
        }
      } catch (e) {
          console.error(e);
      }
    });
  } else if(command === 'regstatus') {
    var ws3 = new WebSocket('wss://' + host + '/api/v1/ws');
    ws3.on('open', () => {
      console.log('WS3 connection succeed!');
      ws3.send(JSON.stringify({
        op: 'GetSite',
        data: {}
      }));
    });
    ws3.on('message', (msg) => {
      try {
        const res = JSON.parse(msg);
        //console.log(res)
        if(res.error){
          return message.channel.send(`Chapo Error: ${res.error}`)
        } else {
          return res.data.site.open_registration == true ? message.channel.send(`Chapo.Chat registration is OPEN`) : message.channel.send(`Chapo.Chat registration is CLOSED`)
        }
      } catch (e) {
          console.error(e);
      }
    });
  }
});

var ws = new WebSocket('wss://' + host + '/api/v1/ws');
ws.on('open', () => {
  console.log('Connection succeed!');
  ws.on('message', (msg) => {
    try {
      const res = JSON.parse(msg);
    //console.log(res)
      switch (res.op) {
        case 'GetSite': {
          return handleRegistration(res.data);
        }
        default: {
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }
  });
  isRegistrationOpen();
  setInterval(() => {
    isRegistrationOpen();
  }, 30000)
});
