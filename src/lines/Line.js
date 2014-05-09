/*
	Line

	Will create a new line at a specified area. If it is beyond the length of the current lines then it will be created at the end.
*/
define([
	'events/ClickHandler',
	'coords/getOffsetFromClick',
	'libs/pubsub',
	'utils/text/insertCharacter'

	], function(
		ClickHandler,
		getOffsetFromClick,
		pubsub,
		insertCharacter,
		SelectHandler
		) {

	var Line = function(linePosition) {
		this.linePosition = linePosition;
		this.node = document.createElement('div');
		this.innerLine = document.createElement('div');
		this.innerLine.classList.add('nonrte-line-inner');
		this.node.classList.add('nonrte-line');
		this.textNode = document.createTextNode('');
		this.node.appendChild(this.innerLine);
		this.innerLine.appendChild(this.textNode);

		this.lineSegmentData = []

		ClickHandler(this.innerLine, this.lineClickHandle.bind(this));

		return this;
	};

	Line.prototype.getNode = function() {
		return this.node;
	};

	Line.prototype.getTextNode = function() {
		return this.textNode;
	};

	Line.prototype.getLineNode = function() {
		return this.innerLine;
	};

	Line.prototype.dataLength = function() {
		return this.textNode.data.length;
	};

	Line.prototype.setLineData = function(textData) {
		this.textNode.data = textData;
	};

	Line.prototype.setLineHtml = function(html) {
		this.getLineNode().innerHTML = html;
	}

	Line.prototype.insertCharacter = function(character, position) {
		var op = {},
			lineOffset = 0;
		if (this.lineSegmentData.length == 0) {
			op.text = character;
			op.wrappers = [];
		} else {
			this.lineSegmentData.forEach(function(lineSegment) {
				var offset = lineOffset + lineSegment.text.length,
					insert;
				if (offset > position) {
					insert = offset - position;
					insertCharacter(lineSegment.text, insert, 0, character);
				}
			})
		}
	}

	Line.prototype.getLineData = function() {
		return this.textNode.data;
	};
	Line.prototype.getLineDataSegments = function() {
		return this.lineSegmentData;
	}

	//THIS IS REALLY BAD AND PROBABLY SHOULDNT BE IN EXISTENCE
	Line.prototype.getPosition = function() {
		return this.linePosition;
	};

	Line.prototype.getLineHeight = function(characterPosition) {
		//In the future we need to adjust based upon what character the cursor is next to
		return this.innerLine.clientHeight;
	}

	Line.prototype.lineClickHandle = function(e) {
		var offset = getOffsetFromClick(this.textNode.data, {x: e.offsetX, y: e.offsetY});
		offset.offsetX += 2;
		var message = {
			line : this,
			original : e,
			offsets : {x : e.offsetX, y : e.offsetY},
			characterOffset : offset

		};
		pubsub.publish('lineClick', message);

	}
	

	return Line;

});