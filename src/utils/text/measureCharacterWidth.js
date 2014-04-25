define([], function() {

  var getCharWidth = function (myChar, characterWidths) {
        
    // If there is a char in cache
    if (!!characterWidths._charWidthArray["_"+myChar]) {
      return characterWidths._charWidthArray["_"+myChar];
    }
        
    // If there is no char in cache set max width and save in cache
    else {
      characterWidths._charWidthArray["_"+myChar] = characterWidths._maxWidth;
      return characterWidths._maxWidth;
    }
        
  };

  return getCharWidth;

});