define([
	'keys/KeyHandler',
	'lines/LineHandler',
	'cursor/Cursor',
	'NonRTE/init/init',
	'libs/pubsub',
	'data/Data'
	], function(
		KeyHandler,
		LineHandler,
		Cursor,
		init,
		pubsub,
		Data
		) {

	var NonRTE = function(element) {
		this.element = element;
		
		this.keyhandler = new KeyHandler();
		this.lineHandler = new LineHandler(this.element);
		this.cursor = new Cursor();


		this.data = new Data();

		this.focusPosition = {
			line: 0,
			character: 0
		};

		init(this);

		//Create the first line and position the cursor on it
		this.cursor.positionOnLine(this.lineHandler.createLine());

		this.keyhandler.init();

		this.cursor.setHeight(this.lineHandler.getLine(this.focusPosition.line).getLineHeight(this.focusPosition.character));


		pubsub.subscribe('keypress.backspace', function() {
			//Needs to take into account the cursor position
			var focusLine = this.lineHandler.getLine(this.focusPosition.line),
				textEl = focusLine.getTextNode();

			if (textEl && textEl.length && (this.focusPosition.character - 1 >= 0)) {
				this.focusPosition.character--
				textEl.deleteData(this.focusPosition.character, 1);

				//Make greaterThanZero a func
			} else if (textEl && (this.focusPosition.line - 1 >= 0)) {
				if (this.focusPosition.line) {
					this.focusPosition.line--;
				}
				focusLine = this.lineHandler.getLine(this.focusPosition.line);
				this.focusPosition.character = focusLine.getTextNode().data.length;
			}

			this.cursor.positionOnLine(focusLine, this.focusPosition.character);

		}.bind(this));

		pubsub.subscribe('keypress.enter', function() {
			this.cursor.positionOnLine(this.lineHandler.createLine(), 0);
			this.focusPosition.character = 0;
			this.focusPosition.line = this.lineHandler.getLines().length - 1;

		}.bind(this));

		pubsub.subscribe('keypress.spacebar', function(subName, e) {
			e.preventDefault();
			pubsub.publish('keypress.character', '\u00a0')
		}.bind(this));

		pubsub.subscribe('keypress.character', function(subName, key) {
			var textEl = this.lineHandler.getLine(this.focusPosition.line).getTextNode();
			textEl.insertData(this.focusPosition.character, key);
			this.focusPosition.character++;
			this.cursor.moveToCharacterPosition(this.lineHandler.getLine(this.focusPosition.line), this.focusPosition.character);
		}.bind(this));

		pubsub.subscribe('lineClick', function(sub, e) {
			this.focusPosition.character = e.characterOffset.clickedCharacter;
			this.focusPosition.line = e.line.getPosition();
			this.cursor.positionOnLine(e.line, this.focusPosition.character);
		}.bind(this));

		pubsub.subscribe('keypress.left', function(subName, e) {
			if (this.focusPosition.character == 0 && this.focusPosition.line - 1 >= 0) {
				this.focusPosition.line--;
				this.focusPosition.character = this.lineHandler.getLine(this.focusPosition.line).dataLength();
			} else if (this.focusPosition.character != 0) {
				this.focusPosition.character--;
			}

			pubsub.publish('updateCursorPosition');
		}.bind(this));

		pubsub.subscribe('keypress.right', function(subName, e) {
			var focusLine = this.lineHandler.getLine(this.focusPosition.line),
				focusLength = focusLine.dataLength();

			if ( (this.focusPosition.character + 1 > focusLine.dataLength()) && (this.lineHandler.linesLength() < this.focusPosition.line + 1) ) {
				this.focusPosition.line++;
				this.focusPosition.character = 0;
			} else if (this.focusPosition.character + 1 <= focusLine.dataLength()) {
				this.focusPosition.character++;
			}

			pubsub.publish('updateCursorPosition');
		}.bind(this));

		pubsub.subscribe('keypress.up', function(subName, e) {
			var focusLine = this.lineHandler.getLine(this.focusPosition.line),
				focusLength = focusLine.dataLength(),
				prevLine;

			if (this.focusPosition.line - 1 >= 0) {
				this.focusPosition.line--;
				prevLine = this.lineHandler.getLine(this.focusPosition.line);

				if (this.focusPosition.character >= prevLine.dataLength()) {
					this.focusPosition.character = prevLine.dataLength();
				}
			}

			pubsub.publish('updateCursorPosition');

		}.bind(this));

		pubsub.subscribe('keypress.down', function(subName, e) {

			e.preventDefault();
			e.stopPropagation();

			var focusLine = this.lineHandler.getLine(this.focusPosition.line),
				focusLength = focusLine.dataLength(),
				nextLine;

			if (this.focusPosition.line + 1 < this.lineHandler.linesLength()) {
				this.focusPosition.line++;
				nextLine = this.lineHandler.getLine(this.focusPosition.line);

				if (this.focusPosition.character >= nextLine.dataLength()) {
					this.focusPosition.character = nextLine.dataLength();
				}
			}

			pubsub.publish('updateCursorPosition');
		}.bind(this));

		
		pubsub.subscribe('updateCursorPosition', function() {
			this.cursor.positionOnLine(this.lineHandler.getLine(this.focusPosition.line), this.focusPosition.character);
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


	};

	return NonRTE;
})