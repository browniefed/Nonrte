define([

	'utils/text/buildCharacterWidths'
	], function(
		buildCharacterWidths
	) {

	var getOffsetFromClick = function(text, offset) {
		var currentOffset = 0,
			characterWidth = 0,
			offsetX = 0;

		text.split('').forEach(function(character) {
			characterWidth =  buildCharacterWidths.getCharacterWidth(character);

			if ( (currentOffset + characterWidth) < offset.x) {
				currentOffset += characterWidth;
				offsetX = currentOffset + characterWidth;
			};
		});


		return offsetX;
	};


	return getOffsetFromClick;
});