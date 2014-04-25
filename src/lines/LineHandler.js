define([
	'lines/Line'
	], function(
		Line
		) {
	var LineHandler = function(el) {
		this.el = el;
		this.lines = [];
	};

	LineHandler.prototype.createLine = function(characterWidths) {
		var line = new Line(characterWidths);
		this.lines.push(line);
		this.el.appendChild(line.getNode());
		return line;
	};

	LineHandler.prototype.getLine = function(lineIndex) {
		return this.lines[lineIndex];
	};

	LineHandler.prototype.getLines = function() {
		return this.lines;
	};

	return LineHandler;
});