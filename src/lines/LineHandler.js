define([
	'lines/Line'
	], function(
		Line
		) {
	var LineHandler = function(el) {
		this.el = el;
		this.lines = [];
	};

	LineHandler.prototype.createLine = function() {
		var line = new Line(this.lines.length);
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

	LineHandler.prototype.linesLength = function() {
		return this.lines.length;
	};

	return LineHandler;
});