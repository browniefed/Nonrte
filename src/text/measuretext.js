define([], function () {
    /**
     * MeasureText class
     * This class is used to measure widths of single characters and cache them for the future.
     * Given a style string, calculate for all characters, cache then return the requested character
     */
    return (function () {

        var cache = {},
            emptySpan = document.createElement('span'),
            defaultStyle = 'padding: 0; margin: 0; visibility: hidden; position: absolute; left: -6000px;',
            replaceCharacters = {
                ' ': '&nbsp;'
            };


        function getCharacterWidth(style, character, recalculate) {
            style = sortStyle(style);
            cache[style] = cache[style] || {};
            if (cache[style][character] && !recalculate) {
                return cache[style][character];
            } else {
                return cache[style][character] = measureCharacter(style, character);
            }
        }

        function measureCharacter(style, character) {
            emptySpan.style.cssText = defaultStyle + style;
            if (replaceCharacters[character]) {
                emptySpan.innerHTML = replaceCharacters[character];
            } else {
                emptySpan.innerText = character;
            }
            return emptySpan.offsetWidth;
        }

        function buildForRange(style, startChar, endChar) {
            var startCode = startChar.charCodeAt(0),
                endCode = startCode.charCodeAt(0);

            if (startChar > endChar) {
                buildForString(stringFromRange(endChar, startChar));
            } else {
                buildForString(stringFromRange(endChar, startChar));
            }
        }

        function stringFromRange(startCode, endCode) {
            return String.fromCharCode.apply(String, buildRange(startCode, endCode + 1))

        }

        function buildForString(style, string) {
            var characters = string.split(''),
                stringLength = 0;

            characters.forEach(function (character) {
                stringLength += measureCharacter(style, character);
            });

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

            while (idx < length) {
                range[idx++] = start;
                start += step;
            }

            return range;
        };

        emptySpan.style.cssText = defaultStyle;
        document.body.appendChild(emptySpan);
        return {
            getCharacterWidth: getCharacterWidth,
            buildForRange: buildForRange,
            buildForString: buildForString
        };

    }())

})