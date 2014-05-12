define([], function() {
	var mergeSimilarSegments = function(segment1, segment2) {
		var mergedSegment
		if (segment1.styles === segment2.styles) {
			segment1.text += segment2.text;
			return segment1;
		}
		return false;
	};

	return mergeSimilarSegments;
})