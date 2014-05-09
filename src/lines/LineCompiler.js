define([
	'libs/marked/lib/marked'
	], function(
		marked
		) {

		var LineCompiler = function(Line) {
			var lineSegments = Line.getLineSegmentData(),
				stringToCompile = '';

			lineSegments.forEach(function(lineSegment) {
				stringToCompile += buildWithWrappers(lineSegment.wrappers, lineSegment.text);
			});

			return marked(stringToCompile);
		}

		function buildWithWrappers(wrappers, text) {
			var stringToWrap = text;
			wrappers.forEach(function(wrapper) {
				stringToWrap = wrapper.start + stringToWrap + wrapper.end;
			});
			return stringToWrap;
		}

		return LineCompiler;
})