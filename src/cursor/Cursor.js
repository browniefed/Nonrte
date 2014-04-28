define([
	'utils/text/buildCharacterWidths'
	], function(
		buildCharacterWidths
		) {

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

	Cursor.prototype.positionOnLine = function(line, characterPosition) {
		line.getNode().appendChild(this.cursorNode);
		if (typeof characterPosition === 'number') { 
			this.moveToCharacterPosition(line, characterPosition);
		}
	}

	Cursor.prototype.position = function(x) {
		this.cursorNode.style.left = x + 'px';
	}

	Cursor.prototype.moveToCharacterPosition = function(line, characterPosition) {
		var text = line.getTextNode().data.split(''),
			offset = 0;

		text.forEach(function(character, iterator) {
			if (iterator < characterPosition) {
				offset += buildCharacterWidths.getCharacterWidth(character);
			};
		});

		this.position(offset);
	}

	Cursor.prototype.setHeight = function(height) {
		this.cursorNode.style.height = height + 'px';
	}

	Cursor.prototype.hide = function() {
		this.cursorNode.classList.add('hidden');
	}

	Cursor.prototype.show = function() {
		this.cursorNode.classList.remove('hidden');
	}

	return Cursor;

});