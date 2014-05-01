/*
	Data is the top most level of tracking data changes.
	It will have a representation of everything in the DOM in a structure format
	It will be queryable, and when modified will update the DOM
	It is the heart of the app. It's like Ractive but for just RTE
 */
define([
	'libs/pubsub'
	], function(
		pubsub
	) {


	var Data = function(lineHandler) {
		this.lineHandler = lineHandler; //LineHandler here maybe
	};

	Data.prototype.set = function() {

	}

	Data.prototype.addCharacterToLineEnd = function(line, character) {

	}

	Data.prototype.addCharacterToPositionOnLine = function(line, position, character) {

	}

	Data.prototype.export = function() {

	}
	return Data;
});