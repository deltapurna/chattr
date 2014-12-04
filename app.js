var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

io.on('connection', function(client){
  console.log('Client connected...');

  client.on('join', function(name) {
    client.nickname = name;
  });

  client.on('messages', function(message){
    var nickname = client.nickname;

    client.broadcast.emit('messages', nickname + ': ' + message);
    client.emit('messages', nickname + ': ' + message);
  });
});

app.get('/', function(request, response){
  response.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname + '/public'));

server.listen(8080);
