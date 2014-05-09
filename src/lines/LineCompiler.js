define([
	'libs/marked/lib/marked'
	], function(
		marked
		) {

		var LineCompiler = function(Line) {
			var lineSegments = Line.getLineDataSegments(),
				stringToCompile = '';

			lineSegments.forEach(function(lineSegment) {
				stringToCompile += buildWithWrappers(lineSegment.wrappers, lineSegment.text);
			});

			console.log(marked('__ *dd* __'));
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