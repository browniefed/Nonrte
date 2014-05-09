define([
	'range/Range',
	'coords/getOffsetFromClick'

	], function(
		Range,
		getOffsetFromClick
		) {


	//Range could be a single character, an entire line.
	var drawSelectionForRange = function(Range) {

	}

	var Selection = function(lineHandler, offset) {
		// this.lineHandler = lineHandler;
		// this.startOffset = offset;
		// this.selectionRanges = {};

		// this.startLine = this.getLineFromoffset(offset),
		// this.startLinePosition = this.lineHandler.getLinePosition(startLine);

		// this.selectionRanges[this.startLinePosition] = this.getRangeOnLine(this.startLine, startOffset, startOffset)
	};

	Selection.prototype.getLineFromOffset = function(offset) {
		var lines = this.lineHandler.getLines();
	};

	Selection.prototype.getRangeOnLine = function(line, startOffset, endOffset) {

	};

	Selection.prototype.highlight = function() {
		this.selectionRange.forEach(function(Range) {

		});
	};


	return Selection;
});

//Selections need to create DOM elements on each line
//The DOM element varys in length from X character to Y 