{//variables
var _ = require('lodash');
var victor = require('victor');
var app  = require("express")();
var http = require('http').Server(app);
var io   = require('socket.io')(http);

var players = {};
var objects = {};
var draw = {};
var reverse = new victor(-1,-1);
var width = 1200;
var height = 550;
var speedLimit = 10;
	
app.set('port', process.env.PORT || 3000);
app.get('/', function(req, res){ res.sendFile(__dirname + '/index.html') });
app.get('/style.css', function(req, res){res.sendFile(__dirname + '/style.css')});
app.get('/js/socket-io.js', function(req, res){ res.sendFile(__dirname + '/js/socket-io.js') });
app.get('/js/keys.js', function(req, res){ res.sendFile(__dirname + '/js/keys.js') });

http.listen(app.get('port'), function(){ console.log('listening on ' + app.get('port') + '...') });
}

{//game loop
var update_interval = setInterval(function(){
	for(var x in objects){ objects[x].step(); }
	//for(var x in players){ players[x].step(); }
}, 16);

var draw_interval = setInterval(function(){	
	io.sockets.emit('draw', draw);
}, 16);
}

actions = {
	test: object = {
		cost: 1,
		go: function(player){
		}
	}
};

function colliding(object, x, y, check){
	//check if object is colliding with any other objects in objects.
	//check is boolean
		//false will call object.collide() on all objects collides with
		//true will not call object.collide()
	//returns list of objects collided with
	
	var collisions = _.filter(objects, function(obj){
		var _x = obj.position.x;
		var _y = obj.position.y;
		var B1 = y + (object.height/2);
		var T1 = y - (object.height/2);
		var L1 = x - (object.width/2);
		var R1 = x + (object.width/2);
		var B2 = _y + (obj.height/2);
		var T2 = _y - (obj.height/2);
		var L2 = _x - (obj.width/2);
		var R2 = _x + (obj.width/2);
		if(object.id == obj.id){
			return false;
		}
		else if(
			L1 < R2 &&
			R1 > L2 &&
			T1 < B2 &&
			B1 > T2
		)
		{
			return true;
		}
		else{
			return false;
		}
	});
	
	if(!check){
		_.forEach(collisions, object.collide(obj));
	}
	
	return !_.isEmpty(collisions);
}

function spawnPlayer(player){
	var done = false;
	while(!done){
		player.positionCheck.x = _.random(player.width,  width-player.width);
		player.positionCheck.y = _.random(player.height, height-player.height);
		if(!colliding(player, player.positionCheck.x, player.positionCheck.y, true)){
			player.position.x = player.positionCheck.x;
			player.position.y = player.positionCheck.y;
			done = true;
		}
	}
	return true;
}


function DrawObject(id, color, height, width, x, y){
	this.id = id;
	this.height = height;
	this.width = width;
	this.color = color;
	this.x = x;
	this.y = y;
	draw[id] = this;
}

function Box(id, color, width, height, x, y){
	this.id = id;
	this.height = height;
	this.width = width;
	var newDrawObject = new DrawObject(id, color, this.height, this.width, x, y);
	this.drawObject = newDrawObject;
	draw[this.id] = newDrawObject;
	this.isPlayer = false;
	this.isDead = true;
	this.position = new victor(x, y);
	this.positionCheck = new victor(x, y);
	this.velocity = new victor(0, 0);
	this.acceleration = new victor(0, 0);
	this.collide = function(object){}
	this.step = function(object){}
}

function Player(id){
	this.id = id;
	this.height = 20;
	this.width = 10;
	var newDrawObject = new DrawObject(id, "#FFFFFF", this.height, this.width, 0, 0);
	this.drawObject = newDrawObject
	draw[this.id] = newDrawObject;
	this.isPlayer = true;
	this.isDead = true;
	this.position = new victor(0, 0);
	this.positionCheck = new victor(0, 0);
	this.velocity = new victor(0, 3);
	this.acceleration = new victor(0, .1);
	this.yCollision = false;
	this.xCollision = false;
	this.up = false;
	this.down = false;
	this.left = false;
	this.right = false;
	this.leftMouse = actions['test'];
	this.rightMouse = actions['test'];
	this.space = actions['test'];
	this.jumpTimer = 0;
	this.collide = function(object){
		
	}
	this.step = function(){
		//update draw
		this.drawObject.x = this.position.x;
		this.drawObject.y = this.position.y;
		//do movement
		this.positionCheck.x = this.position.x;
		this.positionCheck.y = this.position.y;
		//this.velocity.x += this.acceleration.x;
		//this.velocity.y += this.acceleration.y;
		//if(this.up) this.positionCheck.y -= 1;
		//else if(this.down) this.positionCheck.y += 1;
		if(this.left) this.positionCheck.x -= 1;
		else if(this.right) this.positionCheck.x +=1;
		this.positionCheck.x += this.velocity.x;
		this.positionCheck.y += this.velocity.y;
		//if(!colliding(this, this.positionCheck.x, this.positionCheck.y, true)){	
		//	this.position.x = this.positionCheck.x;
		//	this.position.y = this.positionCheck.y;
		//}
		//else{
		//	this.velocity.x = 0;
		//	this.velocity.y = 0;
		//}
		
		if(this.yCollision && this.up)
		{
			this.jumpTimer = 50;
		}
		
		if(this.jumpTimer > 0)
		{
			this.positionCheck.y -= 6;
			this.jumpTimer -= 1;
		}
		
		if(!colliding(this, this.positionCheck.x, this.position.y, true)){
			this.position.x = this.positionCheck.x;
			this.xCollision = false;
		}
		else{
			console.log('!');
			this.xCollision = true;
			//this.velocity.x = 0;
		}
		if(!colliding(this, this.position.x, this.positionCheck.y, true)){
			this.position.y = this.positionCheck.y;
			this.yCollision = false;
		}
		else{
			this.yCollision = true;
			//this.velocity.y = 0;
		}
	}
}

function map1(){
	var newBoxObject = new Box('floor', '#FFFFFF', width, 10, width/2, height-5);
	objects['floor'] = newBoxObject;
}

//init game
map1();

io.on('connection', function(client){
	var newPlayer = new Player(client.id);
	players[client.id] = newPlayer;	
	objects[client.id] = newPlayer;
	spawnPlayer(newPlayer);
	
	console.log('connected (' + newPlayer.position.x + ', ' + newPlayer.position.y + ')');
	
	client.on('disconnect', function(){
		console.log("disconnected");
		delete draw[client.id];
		delete players[client.id];
		delete objects[client.id]
	});
	
	client.on('keys', function(up, down, left, right){
		players[client.id].up = up;
		players[client.id].down = down;
		players[client.id].left = left;
		players[client.id].right = right;
	});
	
	client.on('action', function(action, which, coord){
		if(which == 'left') players[client.id].leftMouse.go(players[client.id]);
		else if(which == 'right') players[client.id].rightMouse.go(players[client.id]);
		else if(which == 'space') players[client.id].space.go(players[client.id]);
	});
});