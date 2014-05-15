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

		var cont = true;

		nodes.forEach(function(node) {
			cont = true;
			while (cont) {
				if (node.tagName == 'P') {
					characterWidth += measuretext.buildForString(node.childNodes[0].data, 'font-size:12px;');
					cont = false;
				} else {
					cont = false;
				}
			}
		});


		// el.childNodes
		debugger;

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