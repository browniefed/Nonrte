define([
	'keys/Keys',
	'libs/keyboard',
	'libs/pubsub'
	], function(
		Keys, 
		keyboard,
		pubsub
	) {


 
	var KeyHandler = function() {

	};

	KeyHandler.prototype.init = function() {
		this.attachGenericKeys();
		this.keyHandlers = [];
	}

	KeyHandler.prototype.attachGenericKeys = function() {				
		keyboard.bind(Keys, this.emitKey.bind(this), 'keypress');
		keyboard.bind('space', this.emitSpace.bind(this));
		keyboard.bind('backspace', this.emitBackspace.bind(this));
		keyboard.bind('enter', this.emitEnter.bind(this));
		keyboard.bind('up', this.emitUp.bind(this));
		keyboard.bind('down', this.emitDown.bind(this));
		keyboard.bind('left', this.emitLeft.bind(this));
		keyboard.bind('right', this.emitRight.bind(this));
	};

	KeyHandler.prototype.registerKeyHandler = function(cb) {
		this.keyHandlers.push(cb);
	}

	//This should be a map that maps events to functions and such but just typing it out to get my head around everything that is needed

	KeyHandler.prototype.emitKey = function(e) {
		pubsub.publish('keypress.character', String.fromCharCode(e.which));
	}

	KeyHandler.prototype.emitSpace = function(e) {
		pubsub.publish('keypress.spacebar', e);
	}

	KeyHandler.prototype.emitBackspace = function(e) {
		pubsub.publish('keypress.backspace', e);
	}

	KeyHandler.prototype.emitEnter = function(e) {
		pubsub.publish('keypress.enter', e);
	}

	KeyHandler.prototype.emitUp = function(e) {
		pubsub.publish('keypress.up', e);
	}

	KeyHandler.prototype.emitDown = function(e) {
		pubsub.publish('keypress.down', e);
	}

	KeyHandler.prototype.emitLeft = function(e) {
		pubsub.publish('keypress.left', e);
	}

	KeyHandler.prototype.emitRight = function(e) {
		pubsub.publish('keypress.right', e);
	}

	KeyHandler.prototype
	return KeyHandler;
	

});