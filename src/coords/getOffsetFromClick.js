define([

	'utils/text/measureCharacterWidth'
	], function(
		measureCharacterWidth
	) {

	var getOffsetFromClick = function(text, offset, characterWidths) {
		var currentOffset = 0,
			characterWidth = 0,
			offsetX = 0;

		text.split('').forEach(function(character) {
			characterWidth = measureCharacterWidth(character, characterWidths);

			if ( (currentOffset + characterWidth) < offset.x) {
				currentOffset += characterWidth;
				offsetX = currentOffset + characterWidth;
			};
		});


		return offsetX;
	};


	return getOffsetFromClick;
});