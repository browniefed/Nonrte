define([
	'keys/KeyHandler',
	'lines/LineHandler',
	'NonRTE/init/init'
	], function(
		KeyHandler,
		LineHandler,
		init
		) {

	var NonRTE = function(element) {
		this.element = element;
		this.keyhandler = new KeyHandler();
		this.lineHandler = new LineHandler(this.element);
		this.focusedLine = 0;
		init(this);

		this.lineHandler.createLine(this.characterWidths);

		this.keyhandler.init();
		this.keyhandler.registerKeyHandler(function(key) {
			var textEl = this.lineHandler.getLine(this.focusedLine).getTextNode();

			if (key == 'backspace') {
				if (textEl && textEl.length) {
					textEl.deleteData(textEl.data.length - 1, 1)
				} else if (textEl && !textEl.length) {
					if (this.focusedLine) {
						this.focusedLine--;
					}
				}
				return;
			}
			else if (key == 'enter') {
				this.lineHandler.createLine();
				this.focusedLine = this.lineHandler.getLines().length - 1;
				return;
			} else {
				if (key == 'space') {
					key = '\u00a0';
				}
				textEl.appendData(key);
			}

		}.bind(this));


	};

	//CREATE MIXIN HERE
	NonRTE.prototype.registerKey = function(key, fn) {
		this.keyHandler.registerKeyListener(key, fn);
	};

	NonRTE.prototype.registerKeySequence = function() {

	};

	//What the hell kind of name is this
	//This creates a key trigger for a function to be called after a key is pressed until the 'stop()' on the called object is called
	//Mainly a developer thing but might come in handy
	NonRTE.prototype.registerKeyObserveTrigger = function(key, fn) {
		//register keypress
		this.keyHandler.registerKeyListener(key, fn);
		//register it as a observer keypress
		//return an event with various positioning, range, and info
		//This method should provide original line + position and current line + position, if deletions happened etc to help the dev figure out what they need to do
		
		return {
			stop: function() {

			}
		};


	}

	return NonRTE;
})