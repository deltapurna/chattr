var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

io.on('connection', function(client){

  client.on('join', function(name) {
    client.nickname = name;
    console.log(client.nickname + ' connected...');
  });

  client.on('messages', function(message){
    var nickname = client.nickname;

    client.broadcast.emit('messages', nickname + ': ' + message);
    client.emit('messages', nickname + ': ' + message);
  });
});

app.set('port', (process.env.PORT || 8080));
app.use(express.static(__dirname + '/public'));
app.get('/', function(request, response){
  response.sendFile(__dirname + '/index.html');
});

server.listen(app.get('port'));
