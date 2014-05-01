define([], function() {
	var Selection = function(range) {
		this.range = range;
	};

	Selection.prototype.highlight = function() {

	};

	return Selection;
});

//Selections need to create DOM elements on each line
//The DOM element varys in length from X character to Y 