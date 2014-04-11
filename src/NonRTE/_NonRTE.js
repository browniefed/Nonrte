define([
	'keys/KeyHandler',
	'lines/LineHandler'
	], function(
		KeyHandler,
		LineHandler
		) {

	var NonRTE = function(element) {
		this.element = element;
		this.keyhandler = new KeyHandler();
		this.lineHandler = new LineHandler(this.element);
		this.focusedLine = 0;

		debugger;
		this.lineHandler.createLine();

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

	}

	return NonRTE;
})