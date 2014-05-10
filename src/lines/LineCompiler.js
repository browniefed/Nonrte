define([
	'libs/marked/lib/marked',
	'styles/styles'
	], function(
		marked,
		stylesCollection
		) {

		var LineCompiler = function(Line) {
			var lineSegments = Line.getLineDataSegments(),
				stringToCompile = '';

			lineSegments.forEach(function(lineSegment) {
				stringToCompile += buildWithStyles(lineSegment.styles, lineSegment.text);
			});

			return marked(stringToCompile);
		}

		function buildWithStyles(styles, text) {
			var stringToWrap = text,
				frontWrap = '{[',
				frontCloseWrap = ']: ',
				backClose = ' :}',
				style,
				styleCompile = '';

			for (style in styles) {
				if (styles.hasOwnProperty(style)) {
					styleCompile += stylesCollection[style].style(styles[style]);
				}
			}
			if (!styleCompile) {
				return stringToWrap;
			}
			
			stringToWrap = frontWrap + styleCompile + frontCloseWrap + stringToWrap + backClose;

			return stringToWrap;
		}

		return LineCompiler;
})

