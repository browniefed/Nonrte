/*
	CreateLine

	Will create a new line at a specified area. If it is beyond the length of the current lines then it will be created at the end.
*/
define([], function() {

	var CreateLine = function() {
		this.node = document.createElement('div');
		this.node.classList.add('nonrte-line');
		this.textNode = document.createTextNode('');
		this.node.appendChild(this.textNode);

		return this;
	};

	CreateLine.prototype.getNode = function() {
		return this.node;
	};

	CreateLine.prototype.getTextNode = function() {
		return this.textNode;
	};
	

	return CreateLine;

});