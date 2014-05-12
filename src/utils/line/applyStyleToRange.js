define([
	'styles/style'
	], function(
		stlyesCollection
		) {

	var applyStyleToRange = function(lineSegments, style, from, to) {
		var lineOffset = 0,
			modifiedSegments = [];

		lineSegments.forEach(function(lineSegment) {
			var offset = lineSegment.text.length;

			//We need an "inRange" function
			//That way we can detect exact characters to style and may need to split objects off of

			if (lineOffset >= from && (offset + lineOffset) <= to) {
				//Just means that we're only applying to this lineSegment . Yaye
			} else if (lineOffset >= from && (offset + lineOffset) > to) {
				//All or part of this segment needs to have the style applied
			} else if ((lineOffset + offset) < to) {
				//This range doesn't have anything possibly
			}

		});

		return modifiedSegments;
	};


	return applyStyleToRange;

});