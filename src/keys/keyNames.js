define([], function() {
	'use strict';
	
  var displayKeys = [],
      key;

displayKeys = [
                '~', 
                '`',
                '!', 
                '@', 
                '#', 
                '$', 
                '%', 
                '^', 
                '&', 
                '*', 
                '(', 
                ')', 
                '{',
                '}',
                '[',
                ']',
                '_', 
                '-',
                '+', 
                '=',
                ':', 
                ';',
                '\"', 
                '\'',
                '<',
                ',',
                '>', 
                '.',
                '?', 
                '/',
                '|', 
                '\\'
                
              ];

     for (var i = 0; i < 10; i++) {
      displayKeys.push(''+i);
    }
    for (var i = 65; i <= 90; i++) {
       key = String.fromCharCode(i).toLowerCase();
       displayKeys.push('shift+' + key);
       displayKeys.push(key);
    }

  return displayKeys;
  
});