define([
	'lines/Line'
	], function(
		Line
		) {
	var LineHandler = function(el) {
		this.el = el;
		this.lines = [];
	};

	LineHandler.prototype.createLine = function(position) {
		var isFirstLine = this.lines.length,
			addAsLastLine = this.lines.length === position;
		var line = new Line(this.lines.length);
		if (position) {
			this.lines.splice(position, 0, line);
		} else {
			this.lines.push(line);
		}
		if (isFirstLine === 0 || addAsLastLine) {
			this.el.appendChild(line.getNode());
		} else {
			this.el.insertBefore(line.getNode(), this.getLine(position + 1).getNode());
		}
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