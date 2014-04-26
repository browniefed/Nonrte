 define([], function () {

     var buildCharacterWidths = (function () {

         var _maxWidth = 0,
             _charWidthArray = {};

         var generateASCIIwidth = function (cssStyle) {
             var container, divWrapper, charWrapper, testDrive, obj, character,
                 totalWidth = 0,
                 oldTotalWidth = 0,
                 charWidth = 0,
                 _cssStyle = cssStyle || "font-family: arial; font-size: 12pt";

             // Temporary container for generated ASCII chars
             container = document.createDocumentFragment();
             divWrapper = document.createElement('div');
             divWrapper.style = 'width: 6000px; visibility:hidden';
             charWrapper = document.createElement('span');
             charWrapper.style = cssStyle;
             testDrive = document.createElement('span');
             testDrive.appendChild(document.createTextNode('i'));

             divWrapper.appendChild(charWrapper);
             container.appendChild(divWrapper);

             document.body.appendChild(container);
             // DUMMY chars
             charWrapper.appendChild(document.createTextNode("f"));
             charWrapper.appendChild(testDrive);

             totalWidth = charWrapper.offsetWidth;

             // Space char
             charWrapper.insertBefore(document.createTextNode("\u00a0"), testDrive);
             oldTotalWidth = totalWidth;
             totalWidth = charWrapper.offsetWidth;
             charWidth = (totalWidth - oldTotalWidth) + 0.4; // hack: add 0.4px to every space 
             _charWidthArray["_ "] = charWidth;

             // Other ASCII chars
             for (var i = 33; i <= 126; i++) {
                 character = String.fromCharCode(i);
                 charWrapper.insertBefore(document.createTextNode("" + character + character), testDrive);

                 oldTotalWidth = totalWidth;
                 totalWidth = charWrapper.offsetWidth;
                 charWidth = (totalWidth - oldTotalWidth) / 2; // While cache is generating add two the same chars at once, and then divide per 2 to get better kerning accuracy.
                 _charWidthArray["_" + character] = charWidth;

                 // Finds max width for char - it will be given for every undefined char like: Ą or Ć
                 if (_maxWidth < _charWidthArray["_" + character]) {
                     _maxWidth = _charWidthArray["_" + character];
                 }
             }

             document.body.removeChild(divWrapper);

         };

         generateASCIIwidth()

         var getCharacterWidth = function (character) {
             // If there is a char in cache
             if (!!_charWidthArray["_" + character]) {
                 return _charWidthArray["_" + character];
             }

             // If there is no char in cache set max width and save in cache
             else {
                 _charWidthArray["_" + character] = _maxWidth;
                 return _maxWidth;
             }
         };


         return {
             getCharacterWidth: getCharacterWidth
         };

     }());


     return buildCharacterWidths;
 });