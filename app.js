var express = require('express');
var app           = express();
var server        = require('http').createServer(app);
var io            = require('socket.io')(server);
var messages      = []

var storeMessage  = function(name, data) {
  messages.push({name: name, data: data});
  if (messages.length > 10) {
    messages.shift();
  }
};

io.on('connection', function(client){

  client.on('join', function(name) {
    messages.forEach(function(message){
      client.emit('messages', message.name + ': ' + message.data);
    });
    client.nickname = name;
    console.log(client.nickname + ' connected...');
    client.broadcast.emit('chat', client.nickname + ' joined the chat');
  });

  client.on('messages', function(message){
    var nickname = client.nickname;

    client.broadcast.emit('messages', nickname + ': ' + message);
    client.emit('messages', nickname + ': ' + message);
    storeMessage(nickname, message)
  });
});

app.set('port', (process.env.PORT || 8080));
app.use(express.static(__dirname + '/public'));
app.get('/', function(request, response){
  response.sendFile(__dirname + '/index.html');
});

server.listen(app.get('port'));
