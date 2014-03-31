define([
	'keys/Keys',
	'libs/keyboard'
	], function(Keys, keyboard) {


 
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
	};

	KeyHandler.prototype.registerKeyHandler = function(cb) {
		this.keyHandlers.push(cb);
	}

	KeyHandler.prototype.emitKey = function(e) {
		this.keyHandlers[0](String.fromCharCode(e.which));			
	}

	KeyHandler.prototype.emitSpace = function(e) {
		this.keyHandlers[0]('space');	
	}

	KeyHandler.prototype.emitBackspace = function(e) {
		this.keyHandlers[0]('backspace');
	}
	return KeyHandler;
	

});