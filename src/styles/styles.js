define([
	'styles/bold',
	'styles/color',
	'styles/font',
	'styles/fontSize',
	'styles/highlight',
	'styles/italic',
	'styles/strikethrough',
	'styles/underline'
	], function(
		bold,
		color,
		font,
		fontSize,
		highlight,
		italic,
		strikethrough,
		underline
	) {

		var styles = {
			bold: bold,
			color: color,
			font: font,
			fontSize: fontSize,
			highlight: highlight,
			italic: italic,
			strikethrough: strikethrough,
			underline: underline
		};

	return styles;

	})