define([
	'keys/KeyHandler',
	'lines/LineHandler',
	'cursor/Cursor',
	'NonRTE/init/init',
	'libs/pubsub',
	'data/Data',
	'events/SelectHandler',
	'selection/Selection',
	'libs/marked/lib/marked',
	'lines/LineCompiler',
	'coords/getOffsetFromClick'
	], function(
		KeyHandler,
		LineHandler,
		Cursor,
		init,
		pubsub,
		Data,
		SelectHandler,
		Selection,
		marked,
		LineCompiler,
		getOffsetFromClick
		) {

	var NonRTE = function(element) {
		this.marked = marked;
		this.element = element;
		
		this.keyhandler = new KeyHandler();
		this.lineHandler = new LineHandler(this.element);
		this.cursor = new Cursor();
		this.selectHandler = new SelectHandler(this.element, this.handleSelect);

		this.data = new Data(this.lineHandler);

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

			var line = this.lineHandler.createLine(this.focusPosition.line + 1),
				focusLine = this.lineHandler.getLine(this.focusPosition.line),
				textData = focusLine.getLineData(),
				moveData = textData.substring(this.focusPosition.character, textData.length),
				oldData = textData.substring(0, this.focusPosition.character);

				if (moveData) {
					line.setLineData(moveData);
					focusLine.setLineData(oldData);
				}
				

				this.focusPosition.line += 1;
				this.focusPosition.character = 0;

			this.cursor.positionOnLine(line, this.focusPosition.character);

		}.bind(this));

		pubsub.subscribe('keypress.spacebar', function(subName, e) {
			e.preventDefault();
			pubsub.publish('keypress.character', '\u00a0')
		}.bind(this));

		pubsub.subscribe('keypress.character', function(subName, key) {
			var line = this.lineHandler.getLine(this.focusPosition.line),
				lineNode = line.getLineNode();

			line.insertCharacter(key, this.focusPosition.character);
			line.setLineHtml(LineCompiler(line));


			this.focusPosition.character++;
			// this.cursor.moveToCharacterPosition(this.lineHandler.getLine(this.focusPosition.line), this.focusPosition.character);
		}.bind(this));

		pubsub.subscribe('lineClick', function(sub, e) {

			//Get offset inside container
			var offset = {
				target: e.original.target,
				originalOffset: e.original.target.parentNode.offsetLeft,
				offsetInisde: e.original.offsetX - e.original.target.parentNode.offsetLeft
			};
			//Clicked position
			//Loop over the content w/ style applied.
			//add to originalOffset

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


		pubsub.subscribe('selection.start', function(subName, e) {
			var line = this.lineHandler.getLine(this.focusPosition.line),
			offset = getOffsetFromClick(line.getLineNode(), e.offsetX);

			this.startSelection = offset;
		}.bind(this))

		pubsub.subscribe('selection.change', function(subName, e) {
			var line = this.lineHandler.getLine(this.focusPosition.line),
			offset = getOffsetFromClick(line.getLineNode(), e.offsetX);

			line.highlight(this.startSelection, offset);
		}.bind(this));

		pubsub.subscribe('selection.end', function(subName, e) {
			var line = this.lineHandler.getLine(this.focusPosition.line),
			offset = getOffsetFromClick(line.getLineNode(), e.offsetX);

			this.endSelection = offset;

			line.highlight(this.startSelection, this.endSelection);
		}.bind(this));

		pubsub.subscribe('style.bold', function(subName, e) {
			this.lineHandler.getLine(this.focusPosition.line).addStyle('bold');
			pubsub.publish('recompileLine', this.focusPosition.line);
		}.bind(this));

		pubsub.subscribe('style.italic', function(subName, e) {
			this.lineHandler.getLine(this.focusPosition.line).addStyle('italic');
			pubsub.publish('recompileLine', this.focusPosition.line);

		}.bind(this));

		pubsub.subscribe('style.strikethrough', function(subName, e) {
			this.lineHandler.getLine(this.focusPosition.line).addStyle('strikethrough');
			pubsub.publish('recompileLine', this.focusPosition.line);

		}.bind(this));

		pubsub.subscribe('style.underline', function(subName, e) {
			this.lineHandler.getLine(this.focusPosition.line).addStyle('underline');
			pubsub.publish('recompileLine', this.focusPosition.line);

		}.bind(this));

		pubsub.subscribe('recompileLine', function(subName, lineNumber) {
			var line = this.lineHandler.getLine(lineNumber);
			line.setLineHtml(LineCompiler(line));
		}.bind(this));


	};

	NonRTE.prototype.handleSelect = function(subName, e) {
		var offset = {x: e.offsetX, y: e.offsetY};

		if (e.type === 'mousedown') {
			this.currentSelection = new Selection(this.lineHandler, offset);
		} else if (e.type === 'mousemove') {

		} else {
			//END SELECTION
		}
		//createNewSelection
		//setStartPoint
		//as it moves then send it new coords

	}

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