var up = false;
var left = false;
var right = false;
var down = false;

var keydown = function(c){
	var key = c.keyCode;
	switch(key){
		case 87://up w
			up = true;
			break;		
		case 65://left a
			left = true;
			break;
		case 68://right d
			right = true;
			break;
		case 83://down s
			down = true;
			break;
		case 32://space
			socket.emit('action', 'space', [mx, my]);
			break;	
		default:
	}
}

var keyup = function(c){
	var key = c.keyCode;
	switch(key){
		case 87://up w
			up = false;
			break;	
		case 65://left a
			left = false;
			break;
		case 68://right d
			right = false;
			break;	
		case 83://down s
			down = false;
			break;
		default:
	}
}

