/*
	CreateLine

	Will create a new line at a specified area. If it is beyond the length of the current lines then it will be created at the end.
*/
define([
	'events/ClickHandler',
	'coords/getOffsetFromClick',
	'libs/pubsub'

	], function(
		ClickHandler,
		getOffsetFromClick,
		pubsub
		) {

	var CreateLine = function(linePosition) {
		this.linePosition = linePosition;
		this.node = document.createElement('div');
		this.innerLine = document.createElement('div');
		this.innerLine.classList.add('nonrte-line-inner');
		this.node.classList.add('nonrte-line');
		this.textNode = document.createTextNode('');
		this.node.appendChild(this.innerLine);
		this.innerLine.appendChild(this.textNode);

		ClickHandler(this.innerLine, this.lineClickHandle.bind(this));

		return this;
	};

	CreateLine.prototype.getNode = function() {
		return this.node;
	};

	CreateLine.prototype.getTextNode = function() {
		return this.textNode;
	};

	CreateLine.prototype.dataLength = function() {
		return this.textNode.data.length;
	}

	//THIS IS REALLY BAD AND PROBABLY SHOULDNT BE IN EXISTENCE
	CreateLine.prototype.getPosition = function() {
		return this.linePosition;
	};

	CreateLine.prototype.getLineHeight = function(characterPosition) {
		//In the future we need to adjust based upon what character the cursor is next to
		return this.innerLine.clientHeight;
	}

	CreateLine.prototype.lineClickHandle = function(e) {
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
	

	return CreateLine;

});