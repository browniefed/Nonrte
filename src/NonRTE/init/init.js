define([
	'NonRTE/init/buildCharacterWidths'
	], function(
		buildCharacterWidths
		) {


		//Should implement an extend strategy here but this works for now

		var init = function(obj) {
			obj.characterWidths = buildCharacterWidths();
		}

		return init;
})