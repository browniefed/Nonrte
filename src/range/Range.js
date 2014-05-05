define([], function() {
	var Range = function(line, from, to) {
		this.line = line;
		this.from = from;
		this.to = to;
	};

	return Range;
});