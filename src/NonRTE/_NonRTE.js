define([
	'keys/KeyHandler'
	], function(KeyHandler) {

	var NonRTE = function(element) {
		this.keysPressed = '';
		this.element = element;
		
		this.keyhandler = new KeyHandler();

		this.keyhandler.init();
		this.keyhandler.registerKeyHandler(function(key) {
			if (key == 'space') {
				key = '&nbsp;';
			}
			if (key == 'backspace') {
				this.keysPressed = this.keysPressed.substring(0, this.keysPressed.length - 1);
			} else {
				this.keysPressed += key;
			}

			console.log( this.keysPressed);
			this.element.innerHTML = this.keysPressed;
		}.bind(this));

	}

	return NonRTE;
})