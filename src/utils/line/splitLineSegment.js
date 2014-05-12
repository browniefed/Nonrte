define([], function() {

	var splitLineSegment = function(lineSegment, splitPosition) {

		var segmentLength = lineSegment.text.length,
			firstSegmentText,
			secondSegementText,
			newSegments = [];


		if (splitPosition < segmentLength) {

//Clone Function should be used here if this gets more complicated but for now the most performant is when we just know the data structure
			firstSegmentText = lineSegment.text.substring(0, splitPosition);
			secondSegementText = lineSegment.text.substring(splitPosition, segmentLength);

			newSegments.push({
				styles: lineSegment.styles,
				text: firstSegmentText
			});
			newSegments.push({
				styles: lineSegment.styles,
				text: secondSegementText
			});

			return newSegments;

		}

		return [lineSegment];
	};

	return splitLineSEgment;
})