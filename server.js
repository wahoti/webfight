{//variables
//wat do
//crazy super fighting game
//some kind of warping or blinking movement like pshah wahh slam
//health and stam? or like smash bros get knocked of screen. hmmm
//start with movement

//unit tests?

//first immediate goal
//rocket boost thing?

var _ = require('lodash');
var victor = require('victor');
var app  = require("express")();
var http = require('http').Server(app);
var io   = require('socket.io')(http);

var players = {};
var objects = {};
var draw = {};
var acts = {};
var reverse = new victor(-1,-1);
var width = 1200;
var height = 550;
var speedLimit = 10;
var sparklyNameCount = 0;
	
app.set('port', process.env.PORT || 3000);
app.get('/', function(req, res){ res.sendFile(__dirname + '/index.html') });
app.get('/style.css', function(req, res){res.sendFile(__dirname + '/style.css')});
app.get('/js/socket-io.js', function(req, res){ res.sendFile(__dirname + '/js/socket-io.js') });
app.get('/js/keys.js', function(req, res){ res.sendFile(__dirname + '/js/keys.js') });

http.listen(app.get('port'), function(){ console.log('listening on ' + app.get('port') + '...') });
}

{//game loop
var update_interval = setInterval(
	function()
	{
		for(var f in acts){ f(); }
		for(var x in objects){ objects[x].step(); }
		//for(var x in players){ players[x].step(); }
	}
, 16);

var draw_interval = setInterval(
	function()
	{	
		io.sockets.emit('draw', draw);
	}
, 16);

var house_keeping = setInterval(
	function()
	{
		sparklyNameCount = 0;
	}
, 10000);
}

actions = {
	test: object = {
		cost: 1,
		go: function(player, coord){
		}
	},
	
	boost: object = {
		cost: 0,
		go: function(player, coord)
		{
			var initX = player.position.x;
			var initY = player.position.y;
			var direction = new victor(coord[0] - player.position.x, coord[1] - player.position.y).normalize();
			player.velocity.x += (direction.x * 10);
			player.velocity.y += (direction.y * 10);
			setTimeout(
				function()
				{
					player.velocity.x -= (direction.x * 10);
					player.velocity.y -= (direction.y * 10);
					clearInterval(sparklyInterval);
					
				}
			, 333);
			var sparklyInterval = setInterval(
				function()
				{
					var sparklyId = createSparkly(player, 5);
					setTimeout(function() { delete draw[sparklyId]; }, 200);
				}
			, 16);
			
			var sparklies = [];
			for(var x in _.range(100))
			{
				sparklies[x] = createSparkly(player, 50);
			}
			var flyoff = setInterval(
				function()
				{
					_.forEach(sparklies, function(value){
						var sparkly = draw[value];
						if(sparkly)
						{
							var blah = new victor(initX - sparkly.x, initY - sparkly.y).normalize();
							sparkly.x += (blah.x * 10);
							sparkly.y += (blah.y * 10);
						}
					});
				}
			, 16);
			setTimeout(
				function()
				{
					clearInterval(flyoff);
					_.forEach(sparklies, function(value){
						delete draw[value];
					});
				}
			, 333);
			
		}
		
	},
	
	sepuku: object = {
		cost: 0,
		go: function(player, coord)
		{
			player.isDead = true;
			var sparklies = [];
			for(var x in _.range(100))
			{
				sparklies[x] = createSparkly(player, 5);
			}
			var flyoff = setInterval(
				function()
				{
					_.forEach(sparklies, function(value){
						var sparkly = draw[value];
						if(sparkly)
						{
							sparkly.x += (sparkly.dir[0] * 3);
							sparkly.y += (sparkly.dir[1] * 3);
						}
					});
				}
			, 16);
			setTimeout(
				function()
				{
					clearInterval(flyoff);
					_.forEach(sparklies, function(value){
						delete draw[value];
					});
				}
			, 700);
			setTimeout(
				function()
				{
					//player.isDead = false;
					//spawnPlayer(player);
				}
			, 10000);
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

function createSparkly(player, range)
{
	//var rx = player.position.x + getRandom(-range, range);
	//var ry = player.position.y + getRandom(-range, range);
	var dir = new victor(getRandom(-100, 100), getRandom(-100, 100)).normalize();
	var neg1 = getRandom(0, 1) ? -1 : 1;
	var neg2 = getRandom(0, 1) ? -1 : 1;	
	var rx = player.position.x + (dir.x * range * neg1);
	var ry = player.position.y + (dir.y * range * neg2);
	var dx = dir.x;
	var dy = dir.y;
	sparklyNameCount += 1;
	var sparklyId = player.id + getRandom(0, 100).toString() + sparklyNameCount.toString();
	var sparkly = new DrawObject(sparklyId, "#FFFFFF", 3, 3, rx, ry);
	sparkly.dir = [dx, dy];
	return sparklyId;
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

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function DrawObject(id, color, height, width, x, y){
	this.id = id;
	this.height = height;
	this.width = width;
	this.color = color;
	this.x = x;
	this.y = y;
	// if(dir){
		// this.dir = dir;
	// } else{
		// this.dir = new victor(0, 0);
	// }
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
	this.isDead = false;
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
	this.leftMouse = actions['boost'];
	this.rightMouse = actions['boost'];
	this.space = actions['sepuku'];
	this.jumpTimer = 0;
	this.gravityTimer = 0;
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
		if(this.left) this.positionCheck.x -= 3;
		else if(this.right) this.positionCheck.x +=3;
		if(this.down) this.positionCheck.y += 3;
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
			this.velocity.y -= 10;
		}
		
		if(this.jumpTimer > 0)
		{
			//this.positionCheck.y -= 6;
			if((this.jumpTimer % 2 == 0) && this.velocity.y < 4){
				this.velocity.y += 1;
			}
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
			//this.velocity.y = 1;
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
	
	client.on('action', function(action, coord){
		if(action == 'left') players[client.id].leftMouse.go(players[client.id], coord);
		else if(action == 'right') players[client.id].rightMouse.go(players[client.id], coord);
		else if(action == 'space') players[client.id].space.go(players[client.id], coord);
	});
});