define([], function(){
	/**
	 * MeasureText class
	 * This class is used to measure widths of single characters and cache them for the future.
	 * Given a style string, calculate for all characters, cache then return the requested character
	 */
	
	var replaceCharacters = {
		' ': '&nbsp;'
	}
	var MeasureText = function() {
		this.cache = {};
		this.emptySpan = document.createElement('span');
		this.defaultStyle = 'padding: 0; margin: 0; visibility: hidden; position: absolute; left: -6000px;';
		this.emptySpan.style.cssText = this.defaultStyle;
	};

	MeasureText.prototype.getCharacterWidth = function(style, character, recalculate) {
		style = sortStyle(style);
		if (this.cache[style][character] && !recalculate) {
			return this.cache[style][character];
		} else {
			return this.cache[style][character] = this.measureCharacter(style, character);
		}
	}

	MeasureText.prototype.measureCharacter = function(style, character) {
		this.emptySpan.style.cssText = this.defaultStyle + style;
		if (replaceCharacters[character]) {
			this.emptySpan.innerHTML = replaceCharacters[character];
		} else {
			this.emptySpan.innerText = character;
		}
		return this.emptySpan.offsetWidth;
	}

	MeasureText.prototype.buildForRange = function(style, startChar, endChar) {
		var startCode = startChar.charCodeAt(0),
			endCode = startCode.charCodeAt(0);

		if (startChar > endChar) {
			this.buildForString(this.stringFromRange(endChar, startChar));
		} else {
			this.buildForString(this.stringFromRange(endChar, startChar));
		}
	}

	MeasureText.prototype.stringFromRange = function(startCode, endCode) {
		return String.fromCharCode.apply(String, buildRange(startCode, endCode + 1))

	}

	MeasureText.buildForstring = function(style, string) {
		var characters = string.split(''),
			stringLength = 0;

		characters.forEach(function(character) {
			stringLength += this.measureCharacter(style, character);
		}.bind(this));

		return stringLength;
	}

	function sortStyle(style) {
		return style.split(';').sort().reverse().join(';')
	}

	function buildRange(start, stop, step) {
	    if (arguments.length <= 1) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = arguments[2] || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var idx = 0;
	    var range = new Array(length);

	    while(idx < length) {
	      range[idx++] = start;
	      start += step;
	    }

	    return range;
  	};


	return MeasureText;
})