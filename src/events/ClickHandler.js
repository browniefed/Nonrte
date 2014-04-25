define([], function() {
	/*
		Create a ClickHandler binding
	 */
	var ClickHandler = function(node, fn) {
		node.addEventListener('click', fn, false);
	};


	return ClickHandler;
});