/*
	Line

	Will create a new line at a specified area. If it is beyond the length of the current lines then it will be created at the end.
*/
define([
	'events/ClickHandler',
	'coords/getOffsetFromClick',
	'libs/pubsub',
	'utils/text/insertCharacter',
	'styles/styles'

	], function(
		ClickHandler,
		getOffsetFromClick,
		pubsub,
		insertCharacter,
		styles
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


		this.lineSegmentData = [
			{
				text: '',
				styles: {}
			}
		];

		// ClickHandler(this.innerLine, this.lineClickHandle.bind(this));

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

	Line.prototype.addLineSegment = function() {
		this.lineSegmentData.push({text:'b', styles:{}})
	}

	Line.prototype.insertCharacter = function(character, position) {
		var op = {},
			lineOffset = 0,
			insertAtIndex = insertCharacter;
		if (this.lineSegmentData.length == 0) {
			op.text = character;
			op.styles = {};
		} else {
			this.lineSegmentData.forEach(function(lineSegment) {
				var offset = lineSegment.text.length,
					insert;
				if ( (offset + lineOffset) >= position) {
					insert = position - lineOffset;
					lineSegment.text = insertAtIndex(lineSegment.text, insert, character);
				}
				lineOffset += offset;
			})
		}
	}

	Line.prototype.addStyle = function(style, value, range) {
		if (arguments.length === 2 && typeof value == 'object') {
			range = value;
		}
		if ( !range ) {
			//Then just next press of a key should be bold;
		} else if (range.from && (!range.to || range.to == 0)) {
			this.getLineDataSegments()[this.getLineDataSegmentsCount() - 1].styles[style] = value;
		
		}
	}

	Line.prototype.getLineData = function() {
		return this.textNode.data;
	};
	Line.prototype.getLineDataSegments = function() {
		return this.lineSegmentData;
	}

	Line.prototype.getLineDataSegmentsCount = function() {
		return this.getLineDataSegments().length;
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
		// var offset = getOffsetFromClick(this.textNode.data, {x: e.offsetX, y: e.offsetY});
		// offset.offsetX += 2;
		// var message = {
		// 	line : this,
		// 	original : e,
		// 	offsets : {x : e.offsetX, y : e.offsetY},
		// 	characterOffset : offset

		// };
		// pubsub.publish('lineClick', message);

	}
	

	return Line;

});
