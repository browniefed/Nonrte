define([], function() {
	var color = {
		style: function(hex) {
			return '~(' + hex + ')';
		}
	};

	return color;
});