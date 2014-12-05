var express       = require('express');
var app           = express();
var server        = require('http').createServer(app);
var io            = require('socket.io')(server);
var redis         = require('redis');
var redisClient   = redis.createClient();

var storeMessage  = function(name, data) {
  var message = JSON.stringify({name: name, data: data});
  redisClient.lpush('messages', message, function(err, reply){
    redisClient.ltrim('messages', 0, 9);
  });
};

io.on('connection', function(client){

  client.on('join', function(name) {
    client.broadcast.emit('add chatter', name);

    redisClient.smembers('chatters', function(err, names){
      names.forEach(function(name){
        client.emit('add chatter', name);
      });
    });

    redisClient.sadd('chatters', name);

    redisClient.lrange('messages', 0, -1, function(err, messages){
      messages = messages.reverse();
      messages.forEach(function(message){
        var message = JSON.parse(message);
        client.emit('messages', message.name + ': ' + message.data);
      });
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

  client.on('disconnect', function(){
    var nickname = client.nickname;

    client.broadcast.emit('remove chater', nickname);
    console.log(nickname + ' disconnected...');
    redisClient.srem('chatters', nickname);
  });
});

app.set('port', (process.env.PORT || 8080));
app.use(express.static(__dirname + '/public'));
app.get('/', function(request, response){
  response.sendFile(__dirname + '/index.html');
});

server.listen(app.get('port'));
