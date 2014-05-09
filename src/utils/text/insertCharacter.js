define([], function() {

	var insertCharacter = function(str, idx, istr ) {
		return str.substr(0, idx) + istr + str.substr(idx);
	};

	return insertCharacter;
});