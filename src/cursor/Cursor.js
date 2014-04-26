define([], function() {

	var cursorClasses = {
		standard: 'nonrte-cursor',
		focus: 'blink',
		hidden: 'hidden'
	};


	var Cursor = function() {
		this.cursorNode = document.createElement('div');
		this.cursorNode.classList.add(cursorClasses.standard);
		this.cursorNode.classList.add(cursorClasses.focus);
	};

	Cursor.prototype.positionOnLine = function(line) {
		line.getNode().appendChild(this.cursorNode);
	}

	Cursor.prototype.position = function(x) {
		this.cursorNode.style.left = x + 'px';
	}

	Cursor.prototype.hide = function() {
		this.cursorNode.classList.add('hidden');
	}

	Cursor.prototype.show = function() {
		this.cursorNode.classList.remove('hidden');
	}

	return Cursor;

});