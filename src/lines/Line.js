/*
	CreateLine

	Will create a new line at a specified area. If it is beyond the length of the current lines then it will be created at the end.
*/
define([
	'events/ClickHandler',
	'coords/getOffsetFromClick'

	], function(
		ClickHandler,
		getOffsetFromClick
		) {

	var CreateLine = function(characterWidths) {
		this.characterWidths = characterWidths;


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

	CreateLine.prototype.lineClickHandle = function(e) {
		getOffsetFromClick(this.textNode.data, {x: e.offsetX, y: e.offsetY}, this.characterWidths);
	}
	

	return CreateLine;

});