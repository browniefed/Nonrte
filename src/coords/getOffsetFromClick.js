define([

	'text/measuretext'
	], function(
		measuretext
	) {

	var getOffsetFromClick = function(el, offset) {
		var currentOffset = 0,
			characterWidth = 0,
			offsetX = 0,
			clickedCharacter = 0,
			nodes = Array.prototype.slice.call(el.childNodes);

		var cont = true,
			span,
			charactersCollection;

		nodes.forEach(function(node) {
			cont = true;
			while (cont) {
				if (node.tagName == 'P') {
					if (span = node.childNodes[0].tagName == 'SPAN') {
						charactersCollection = measuretext.buildForEachCharacter(span.childNodes[0].data, span.style.cssText);
					} else {
						charactersCollection = measuretext.buildForEachCharacter(node.childNodes[0].data, 'font-size:12px;');
					}


					charactersCollection.forEach(function(character) {
						if ((currentOffset + character.width) < offset) {
							clickedCharacter = character.character;
							offsetX = (currentOffset += character.width)
						}
					})

					cont = false;
				} else {
					cont = false;
				}
			}
		});

		return {
			offset: offsetX,
			clickedCharacter: clickedCharacter
		}


		// el.childNodes

		// text.split('').forEach(function(character, iterator) {
		// 	characterWidth =  buildCharacterWidths.getCharacterWidth(character);

		// 	if ( (currentOffset + characterWidth) < offset.x) {
		// 		currentOffset += characterWidth;
		// 		offsetX = currentOffset + characterWidth;
		// 		clickedCharacter = iterator;
		// 	};
		// });


		// return {
		// 	offsetX: offsetX,
		// 	clickedCharacter: clickedCharacter
		// }
	};


	return getOffsetFromClick;
});