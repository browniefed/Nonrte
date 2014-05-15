( function( global ) {


	var keys_keyNames = function() {

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
			'"',
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
		for ( var i = 0; i < 10; i++ ) {
			displayKeys.push( '' + i );
		}
		for ( var i = 65; i <= 90; i++ ) {
			key = String.fromCharCode( i ).toLowerCase();
			displayKeys.push( 'shift+' + key );
			displayKeys.push( key );
		}
		return displayKeys;
	}();

	var keys_Keys = function( keyNames ) {

		return keyNames;
	}( keys_keyNames );

	/*global define:false */
	/**
	 * Copyright 2013 Craig Campbell
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 * Mousetrap is a simple keyboard shortcut library for Javascript with
	 * no external dependencies
	 *
	 * @version 1.4.6
	 * @url craig.is/killing/mice
	 */
	var libs_keyboard = function() {
		var KeyboardMouseTrap;
		KeyboardMouseTrap = function( window, document, undefined ) {
			var _MAP = {
				8: 'backspace',
				9: 'tab',
				13: 'enter',
				16: 'shift',
				17: 'ctrl',
				18: 'alt',
				20: 'capslock',
				27: 'esc',
				32: 'space',
				33: 'pageup',
				34: 'pagedown',
				35: 'end',
				36: 'home',
				37: 'left',
				38: 'up',
				39: 'right',
				40: 'down',
				45: 'ins',
				46: 'del',
				91: 'meta',
				93: 'meta',
				224: 'meta'
			}, _KEYCODE_MAP = {
					106: '*',
					107: '+',
					109: '-',
					110: '.',
					111: '/',
					186: ';',
					187: '=',
					188: ',',
					189: '-',
					190: '.',
					191: '/',
					192: '`',
					219: '[',
					220: '\\',
					221: ']',
					222: '\''
				}, _SHIFT_MAP = {
					'~': '`',
					'!': '1',
					'@': '2',
					'#': '3',
					'$': '4',
					'%': '5',
					'^': '6',
					'&': '7',
					'*': '8',
					'(': '9',
					')': '0',
					'_': '-',
					'+': '=',
					':': ';',
					'"': '\'',
					'<': ',',
					'>': '.',
					'?': '/',
					'|': '\\'
				}, _SPECIAL_ALIASES = {
					'option': 'alt',
					'command': 'meta',
					'return': 'enter',
					'escape': 'esc',
					'mod': /Mac|iPod|iPhone|iPad/.test( navigator.platform ) ? 'meta' : 'ctrl'
				}, _REVERSE_MAP, _callbacks = {}, _directMap = {}, _sequenceLevels = {}, _resetTimer, _ignoreNextKeyup = false,
				_ignoreNextKeypress = false,
				_nextExpectedAction = false;
			for ( var i = 1; i < 20; ++i ) {
				_MAP[ 111 + i ] = 'f' + i;
			}
			for ( i = 0; i <= 9; ++i ) {
				_MAP[ i + 96 ] = i;
			}

			function _addEvent( object, type, callback ) {
				if ( object.addEventListener ) {
					object.addEventListener( type, callback, false );
					return;
				}
				object.attachEvent( 'on' + type, callback );
			}

			function _characterFromEvent( e ) {
				if ( e.type == 'keypress' ) {
					var character = String.fromCharCode( e.which );
					if ( !e.shiftKey ) {
						character = character.toLowerCase();
					}
					return character;
				}
				if ( _MAP[ e.which ] ) {
					return _MAP[ e.which ];
				}
				if ( _KEYCODE_MAP[ e.which ] ) {
					return _KEYCODE_MAP[ e.which ];
				}
				return String.fromCharCode( e.which ).toLowerCase();
			}

			function _modifiersMatch( modifiers1, modifiers2 ) {
				return modifiers1.sort().join( ',' ) === modifiers2.sort().join( ',' );
			}

			function _resetSequences( doNotReset ) {
				doNotReset = doNotReset || {};
				var activeSequences = false,
					key;
				for ( key in _sequenceLevels ) {
					if ( doNotReset[ key ] ) {
						activeSequences = true;
						continue;
					}
					_sequenceLevels[ key ] = 0;
				}
				if ( !activeSequences ) {
					_nextExpectedAction = false;
				}
			}

			function _getMatches( character, modifiers, e, sequenceName, combination, level ) {
				var i, callback, matches = [],
					action = e.type;
				if ( !_callbacks[ character ] ) {
					return [];
				}
				if ( action == 'keyup' && _isModifier( character ) ) {
					modifiers = [ character ];
				}
				for ( i = 0; i < _callbacks[ character ].length; ++i ) {
					callback = _callbacks[ character ][ i ];
					if ( !sequenceName && callback.seq && _sequenceLevels[ callback.seq ] != callback.level ) {
						continue;
					}
					if ( action != callback.action ) {
						continue;
					}
					if ( action == 'keypress' && !e.metaKey && !e.ctrlKey || _modifiersMatch( modifiers, callback.modifiers ) ) {
						var deleteCombo = !sequenceName && callback.combo == combination;
						var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
						if ( deleteCombo || deleteSequence ) {
							_callbacks[ character ].splice( i, 1 );
						}
						matches.push( callback );
					}
				}
				return matches;
			}

			function _eventModifiers( e ) {
				var modifiers = [];
				if ( e.shiftKey ) {
					modifiers.push( 'shift' );
				}
				if ( e.altKey ) {
					modifiers.push( 'alt' );
				}
				if ( e.ctrlKey ) {
					modifiers.push( 'ctrl' );
				}
				if ( e.metaKey ) {
					modifiers.push( 'meta' );
				}
				return modifiers;
			}

			function _preventDefault( e ) {
				if ( e.preventDefault ) {
					e.preventDefault();
					return;
				}
				e.returnValue = false;
			}

			function _stopPropagation( e ) {
				if ( e.stopPropagation ) {
					e.stopPropagation();
					return;
				}
				e.cancelBubble = true;
			}

			function _fireCallback( callback, e, combo, sequence ) {
				if ( Mousetrap.stopCallback( e, e.target || e.srcElement, combo, sequence ) ) {
					return;
				}
				if ( callback( e, combo ) === false ) {
					_preventDefault( e );
					_stopPropagation( e );
				}
			}

			function _handleKey( character, modifiers, e ) {
				var callbacks = _getMatches( character, modifiers, e ),
					i, doNotReset = {}, maxLevel = 0,
					processedSequenceCallback = false;
				for ( i = 0; i < callbacks.length; ++i ) {
					if ( callbacks[ i ].seq ) {
						maxLevel = Math.max( maxLevel, callbacks[ i ].level );
					}
				}
				for ( i = 0; i < callbacks.length; ++i ) {
					if ( callbacks[ i ].seq ) {
						if ( callbacks[ i ].level != maxLevel ) {
							continue;
						}
						processedSequenceCallback = true;
						doNotReset[ callbacks[ i ].seq ] = 1;
						_fireCallback( callbacks[ i ].callback, e, callbacks[ i ].combo, callbacks[ i ].seq );
						continue;
					}
					if ( !processedSequenceCallback ) {
						_fireCallback( callbacks[ i ].callback, e, callbacks[ i ].combo );
					}
				}
				var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;
				if ( e.type == _nextExpectedAction && !_isModifier( character ) && !ignoreThisKeypress ) {
					_resetSequences( doNotReset );
				}
				_ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
			}

			function _handleKeyEvent( e ) {
				if ( typeof e.which !== 'number' ) {
					e.which = e.keyCode;
				}
				var character = _characterFromEvent( e );
				if ( !character ) {
					return;
				}
				if ( e.type == 'keyup' && _ignoreNextKeyup === character ) {
					_ignoreNextKeyup = false;
					return;
				}
				Mousetrap.handleKey( character, _eventModifiers( e ), e );
			}

			function _isModifier( key ) {
				return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
			}

			function _resetSequenceTimer() {
				clearTimeout( _resetTimer );
				_resetTimer = setTimeout( _resetSequences, 1000 );
			}

			function _getReverseMap() {
				if ( !_REVERSE_MAP ) {
					_REVERSE_MAP = {};
					for ( var key in _MAP ) {
						if ( key > 95 && key < 112 ) {
							continue;
						}
						if ( _MAP.hasOwnProperty( key ) ) {
							_REVERSE_MAP[ _MAP[ key ] ] = key;
						}
					}
				}
				return _REVERSE_MAP;
			}

			function _pickBestAction( key, modifiers, action ) {
				if ( !action ) {
					action = _getReverseMap()[ key ] ? 'keydown' : 'keypress';
				}
				if ( action == 'keypress' && modifiers.length ) {
					action = 'keydown';
				}
				return action;
			}

			function _bindSequence( combo, keys, callback, action ) {
				_sequenceLevels[ combo ] = 0;

				function _increaseSequence( nextAction ) {
					return function() {
						_nextExpectedAction = nextAction;
						++_sequenceLevels[ combo ];
						_resetSequenceTimer();
					};
				}

				function _callbackAndReset( e ) {
					_fireCallback( callback, e, combo );
					if ( action !== 'keyup' ) {
						_ignoreNextKeyup = _characterFromEvent( e );
					}
					setTimeout( _resetSequences, 10 );
				}
				for ( var i = 0; i < keys.length; ++i ) {
					var isFinal = i + 1 === keys.length;
					var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence( action || _getKeyInfo( keys[ i + 1 ] ).action );
					_bindSingle( keys[ i ], wrappedCallback, action, combo, i );
				}
			}

			function _keysFromString( combination ) {
				if ( combination === '+' ) {
					return [ '+' ];
				}
				return combination.split( '+' );
			}

			function _getKeyInfo( combination, action ) {
				var keys, key, i, modifiers = [];
				keys = _keysFromString( combination );
				for ( i = 0; i < keys.length; ++i ) {
					key = keys[ i ];
					if ( _SPECIAL_ALIASES[ key ] ) {
						key = _SPECIAL_ALIASES[ key ];
					}
					if ( action && action != 'keypress' && _SHIFT_MAP[ key ] ) {
						key = _SHIFT_MAP[ key ];
						modifiers.push( 'shift' );
					}
					if ( _isModifier( key ) ) {
						modifiers.push( key );
					}
				}
				action = _pickBestAction( key, modifiers, action );
				return {
					key: key,
					modifiers: modifiers,
					action: action
				};
			}

			function _bindSingle( combination, callback, action, sequenceName, level ) {
				_directMap[ combination + ':' + action ] = callback;
				combination = combination.replace( /\s+/g, ' ' );
				var sequence = combination.split( ' ' ),
					info;
				if ( sequence.length > 1 ) {
					_bindSequence( combination, sequence, callback, action );
					return;
				}
				info = _getKeyInfo( combination, action );
				_callbacks[ info.key ] = _callbacks[ info.key ] || [];
				_getMatches( info.key, info.modifiers, {
					type: info.action
				}, sequenceName, combination, level );
				_callbacks[ info.key ][ sequenceName ? 'unshift' : 'push' ]( {
					callback: callback,
					modifiers: info.modifiers,
					action: info.action,
					seq: sequenceName,
					level: level,
					combo: combination
				} );
			}

			function _bindMultiple( combinations, callback, action ) {
				for ( var i = 0; i < combinations.length; ++i ) {
					_bindSingle( combinations[ i ], callback, action );
				}
			}
			_addEvent( document, 'keypress', _handleKeyEvent );
			_addEvent( document, 'keydown', _handleKeyEvent );
			_addEvent( document, 'keyup', _handleKeyEvent );
			var Mousetrap = {
				bind: function( keys, callback, action ) {
					keys = keys instanceof Array ? keys : [ keys ];
					_bindMultiple( keys, callback, action );
					return this;
				},
				unbind: function( keys, action ) {
					return Mousetrap.bind( keys, function() {}, action );
				},
				trigger: function( keys, action ) {
					if ( _directMap[ keys + ':' + action ] ) {
						_directMap[ keys + ':' + action ]( {}, keys );
					}
					return this;
				},
				reset: function() {
					_callbacks = {};
					_directMap = {};
					return this;
				},
				stopCallback: function( e, element ) {
					if ( ( ' ' + element.className + ' ' ).indexOf( ' mousetrap ' ) > -1 ) {
						return false;
					}
					return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
				},
				handleKey: _handleKey
			};
			return Mousetrap;
		}( window, document );
		return KeyboardMouseTrap;
	}();

	/*
Copyright (c) 2010,2011,2012,2013 Morgan Roderick http://roderick.dk
License: MIT - http://mrgnrdrck.mit-license.org

https://github.com/mroderick/PubSubJS
*/
	/*jslint white:true, plusplus:true, stupid:true*/
	/*global
	setTimeout,
	module,
	exports,
	define,
	require,
	window
*/
	var libs_pubsub = function() {

		var PubSub = {}, messages = {}, lastUid = -1;

		function hasKeys( obj ) {
			var key;
			for ( key in obj ) {
				if ( obj.hasOwnProperty( key ) ) {
					return true;
				}
			}
			return false;
		}

		function throwException( ex ) {
			return function reThrowException() {
				throw ex;
			};
		}

		function callSubscriberWithDelayedExceptions( subscriber, message, data ) {
			try {
				subscriber( message, data );
			} catch ( ex ) {
				setTimeout( throwException( ex ), 0 );
			}
		}

		function callSubscriberWithImmediateExceptions( subscriber, message, data ) {
			subscriber( message, data );
		}

		function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ) {
			var subscribers = messages[ matchedMessage ],
				callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
				s;
			if ( !messages.hasOwnProperty( matchedMessage ) ) {
				return;
			}
			for ( s in subscribers ) {
				if ( subscribers.hasOwnProperty( s ) ) {
					callSubscriber( subscribers[ s ], originalMessage, data );
				}
			}
		}

		function createDeliveryFunction( message, data, immediateExceptions ) {
			return function deliverNamespaced() {
				var topic = String( message ),
					position = topic.lastIndexOf( '.' );
				deliverMessage( message, message, data, immediateExceptions );
				while ( position !== -1 ) {
					topic = topic.substr( 0, position );
					position = topic.lastIndexOf( '.' );
					deliverMessage( message, topic, data );
				}
			};
		}

		function messageHasSubscribers( message ) {
			var topic = String( message ),
				found = Boolean( messages.hasOwnProperty( topic ) && hasKeys( messages[ topic ] ) ),
				position = topic.lastIndexOf( '.' );
			while ( !found && position !== -1 ) {
				topic = topic.substr( 0, position );
				position = topic.lastIndexOf( '.' );
				found = Boolean( messages.hasOwnProperty( topic ) && hasKeys( messages[ topic ] ) );
			}
			return found;
		}

		function publish( message, data, sync, immediateExceptions ) {
			var deliver = createDeliveryFunction( message, data, immediateExceptions ),
				hasSubscribers = messageHasSubscribers( message );
			if ( !hasSubscribers ) {
				return false;
			}
			if ( sync === true ) {
				deliver();
			} else {
				setTimeout( deliver, 0 );
			}
			return true;
		}
		PubSub.publish = function( message, data ) {
			return publish( message, data, false, PubSub.immediateExceptions );
		};
		PubSub.publishSync = function( message, data ) {
			return publish( message, data, true, PubSub.immediateExceptions );
		};
		PubSub.subscribe = function( message, func ) {
			if ( typeof func !== 'function' ) {
				return false;
			}
			if ( !messages.hasOwnProperty( message ) ) {
				messages[ message ] = {};
			}
			var token = 'uid_' + String( ++lastUid );
			messages[ message ][ token ] = func;
			return token;
		};
		PubSub.unsubscribe = function( tokenOrFunction ) {
			var isToken = typeof tokenOrFunction === 'string',
				result = false,
				m, message, t, token;
			for ( m in messages ) {
				if ( messages.hasOwnProperty( m ) ) {
					message = messages[ m ];
					if ( isToken && message[ tokenOrFunction ] ) {
						delete message[ tokenOrFunction ];
						result = tokenOrFunction;
						break;
					} else if ( !isToken ) {
						for ( t in message ) {
							if ( message.hasOwnProperty( t ) && message[ t ] === tokenOrFunction ) {
								delete message[ t ];
								result = true;
							}
						}
					}
				}
			}
			return result;
		};
		return PubSub;
	}();

	var keys_KeyHandler = function( Keys, keyboard, pubsub ) {
		var KeyHandler = function() {};
		KeyHandler.prototype.init = function() {
			this.attachGenericKeys();
			this.keyHandlers = [];
		};
		KeyHandler.prototype.attachGenericKeys = function() {
			keyboard.bind( Keys, this.emitKey.bind( this ), 'keypress' );
			keyboard.bind( 'space', this.emitSpace.bind( this ) );
			keyboard.bind( 'backspace', this.emitBackspace.bind( this ) );
			keyboard.bind( 'enter', this.emitEnter.bind( this ) );
			keyboard.bind( 'up', this.emitUp.bind( this ) );
			keyboard.bind( 'down', this.emitDown.bind( this ) );
			keyboard.bind( 'left', this.emitLeft.bind( this ) );
			keyboard.bind( 'right', this.emitRight.bind( this ) );
			keyboard.bind( 'mod+b', this.emitBold.bind( this ) );
			keyboard.bind( 'mod+i', this.emitItalic.bind( this ) );
			keyboard.bind( 'mod+5', this.emitStrikeThrough.bind( this ) );
			keyboard.bind( 'mod+u', this.emitUnderline.bind( this ) );
		};
		KeyHandler.prototype.registerKeyHandler = function( cb ) {
			this.keyHandlers.push( cb );
		};
		KeyHandler.prototype.emitBold = function( e ) {
			pubsub.publish( 'style.bold', e );
		};
		KeyHandler.prototype.emitItalic = function( e ) {
			pubsub.publish( 'style.italic', e );
		};
		KeyHandler.prototype.emitStrikeThrough = function( e ) {
			pubsub.publish( 'style.strikethrough', e );
		};
		KeyHandler.prototype.emitUnderline = function( e ) {
			pubsub.publish( 'style.underline', e );
		};
		KeyHandler.prototype.emitKey = function( e ) {
			pubsub.publish( 'keypress.character', String.fromCharCode( e.which ) );
		};
		KeyHandler.prototype.emitSpace = function( e ) {
			pubsub.publish( 'keypress.spacebar', e );
		};
		KeyHandler.prototype.emitBackspace = function( e ) {
			pubsub.publish( 'keypress.backspace', e );
		};
		KeyHandler.prototype.emitEnter = function( e ) {
			pubsub.publish( 'keypress.enter', e );
		};
		KeyHandler.prototype.emitUp = function( e ) {
			pubsub.publish( 'keypress.up', e );
		};
		KeyHandler.prototype.emitDown = function( e ) {
			pubsub.publish( 'keypress.down', e );
		};
		KeyHandler.prototype.emitLeft = function( e ) {
			pubsub.publish( 'keypress.left', e );
		};
		KeyHandler.prototype.emitRight = function( e ) {
			pubsub.publish( 'keypress.right', e );
		};
		KeyHandler.prototype;
		return KeyHandler;
	}( keys_Keys, libs_keyboard, libs_pubsub );

	var events_ClickHandler = function() {
		var ClickHandler = function( node, fn ) {
			node.addEventListener( 'click', fn, false );
		};
		return ClickHandler;
	}();

	var text_measuretext = function() {
		var cache = {}, emptySpan = document.createElement( 'span' ),
			defaultStyle = 'padding: 0; margin: 0; visibility: hidden; position: absolute; left: -6000px;',
			replaceCharacters = {
				' ': '&nbsp;'
			};

		function getCharacterWidth( character, style, recalculate ) {
			style = sortStyle( style );
			cache[ style ] = cache[ style ] || {};
			if ( cache[ style ][ character ] && !recalculate ) {
				return cache[ style ][ character ];
			} else {
				return cache[ style ][ character ] = measureCharacter( character, style );
			}
		}

		function measureCharacter( character, style ) {
			emptySpan.style.cssText = defaultStyle + style;
			if ( replaceCharacters[ character ] ) {
				emptySpan.innerHTML = replaceCharacters[ character ];
			} else {
				emptySpan.innerText = character;
			}
			return emptySpan.offsetWidth;
		}

		function buildForRange( startChar, endChar, style ) {
			var startCode = startChar.charCodeAt( 0 ),
				endCode = startCode.charCodeAt( 0 );
			if ( startChar > endChar ) {
				buildForString( stringFromRange( endChar, startChar ), style );
			} else {
				buildForString( stringFromRange( endChar, startChar ), style );
			}
		}

		function stringFromRange( startCode, endCode ) {
			return String.fromCharCode.apply( String, buildRange( startCode, endCode + 1 ) );
		}

		function buildForString( string, style ) {
			var characters = string.split( '' ),
				stringLength = 0;
			characters.forEach( function( character ) {
				stringLength += measureCharacter( character, style );
			} );
			return stringLength;
		}

		function buildForEachCharacter( string, style ) {
			var characters = string.split( '' ),
				stringFragments = [];
			characters.forEach( function( character ) {
				stringFragments.push( {
					character: character,
					width: measureCharacter( character, style )
				} );
			} );
			return stringFragments;
		}

		function sortStyle( style ) {
			return style.split( ';' ).sort().reverse().join( ';' );
		}

		function buildRange( start, stop, step ) {
			if ( arguments.length <= 1 ) {
				stop = start || 0;
				start = 0;
			}
			step = arguments[ 2 ] || 1;
			var length = Math.max( Math.ceil( ( stop - start ) / step ), 0 );
			var idx = 0;
			var range = new Array( length );
			while ( idx < length ) {
				range[ idx++ ] = start;
				start += step;
			}
			return range;
		}
		emptySpan.style.cssText = defaultStyle;
		document.body.appendChild( emptySpan );
		return {
			getCharacterWidth: getCharacterWidth,
			buildForRange: buildForRange,
			buildForString: buildForString,
			buildForEachCharacter: buildForEachCharacter
		};
	}();

	var coords_getOffsetFromClick = function( measuretext ) {
		var getOffsetFromClick = function( el, offset ) {
			var currentOffset = 0,
				characterWidth = 0,
				offsetX = 0,
				clickedCharacter = 0,
				nodes = Array.prototype.slice.call( el.childNodes );
			var cont = true,
				span, charactersCollection;
			nodes.forEach( function( node ) {
				cont = true;
				while ( cont ) {
					if ( node.tagName == 'P' ) {
						if ( span = node.childNodes[ 0 ].tagName == 'SPAN' ) {
							charactersCollection = measuretext.buildForEachCharacter( span.childNodes[ 0 ].data, span.style.cssText );
						} else {
							charactersCollection = measuretext.buildForEachCharacter( node.childNodes[ 0 ].data, 'font-size:12px;' );
						}
						charactersCollection.forEach( function( character ) {
							if ( currentOffset < offset ) {
								clickedCharacter = character.character;
								offsetX = currentOffset += character.width;
							}
						} );
						cont = false;
					} else {
						cont = false;
					}
				}
			} );
			return {
				offset: offsetX,
				clickedCharacter: clickedCharacter
			};
		};
		return getOffsetFromClick;
	}( text_measuretext );

	var utils_text_insertCharacter = function() {
		var insertCharacter = function( str, idx, istr ) {
			return str.substr( 0, idx ) + istr + str.substr( idx );
		};
		return insertCharacter;
	}();

	var styles_bold = function() {
		var bold = {
			style: function() {
				return '#';
			}
		};
		return bold;
	}();

	var styles_color = function() {
		var color = {
			style: function( hex ) {
				return '~(' + hex + ')';
			}
		};
		return color;
	}();

	var styles_font = function() {
		var font = {
			style: function( family ) {
				return '^(' + family + ')';
			}
		};
		return font;
	}();

	var styles_fontSize = function() {
		var fontSize = {
			style: function( size ) {
				return '+(' + size + ')';
			}
		};
		return fontSize;
	}();

	var styles_highlight = function() {
		var highlight = {
			style: function( hex ) {
				return '=(' + hex + ')';
			}
		};
		return highlight;
	}();

	var styles_italic = function() {
		var italic = {
			style: function() {
				return '*';
			}
		};
		return italic;
	}();

	var styles_strikethrough = function() {
		var strikethrough = {
			style: function() {
				return '-';
			}
		};
		return strikethrough;
	}();

	var styles_underline = function() {
		var underline = {
			style: function() {
				return '_';
			}
		};
		return underline;
	}();

	var styles_styles = function( bold, color, font, fontSize, highlight, italic, strikethrough, underline ) {
		var styles = {
			bold: bold,
			color: color,
			font: font,
			fontSize: fontSize,
			highlight: highlight,
			italic: italic,
			strikethrough: strikethrough,
			underline: underline
		};
		return styles;
	}( styles_bold, styles_color, styles_font, styles_fontSize, styles_highlight, styles_italic, styles_strikethrough, styles_underline );

	/*
	Line

	Will create a new line at a specified area. If it is beyond the length of the current lines then it will be created at the end.
*/
	var lines_Line = function( ClickHandler, getOffsetFromClick, pubsub, insertCharacter, styles ) {
		var Line = function( linePosition ) {
			this.linePosition = linePosition;
			this.node = document.createElement( 'div' );
			this.innerLine = document.createElement( 'div' );
			this.innerLine.classList.add( 'nonrte-line-inner' );
			this.node.classList.add( 'nonrte-line' );
			this.textNode = document.createTextNode( '' );
			this.node.appendChild( this.innerLine );
			this.innerLine.appendChild( this.textNode );
			this.selection = document.createElement( 'div' );
			this.selection.classList.add( 'nonrte-selection' );
			this.node.appendChild( this.selection );
			this.lineSegmentData = [ {
				text: '',
				styles: {}
			} ];
			return this;
		};
		Line.prototype.getNode = function() {
			return this.node;
		};
		Line.prototype.getTextNode = function() {
			return this.textNode;
		};
		Line.prototype.getLineNode = function() {
			return this.innerLine;
		};
		Line.prototype.dataLength = function() {
			return this.textNode.data.length;
		};
		Line.prototype.setLineData = function( textData ) {
			this.textNode.data = textData;
		};
		Line.prototype.setLineHtml = function( html ) {
			this.getLineNode().innerHTML = html;
		};
		Line.prototype.addLineSegment = function() {
			this.lineSegmentData.push( {
				text: 'b',
				styles: {}
			} );
		};
		Line.prototype.insertCharacter = function( character, position ) {
			var op = {}, lineOffset = 0,
				insertAtIndex = insertCharacter;
			if ( this.lineSegmentData.length == 0 ) {
				op.text = character;
				op.styles = {};
			} else {
				this.lineSegmentData.forEach( function( lineSegment ) {
					var offset = lineSegment.text.length,
						insert;
					if ( offset + lineOffset >= position ) {
						insert = position - lineOffset;
						lineSegment.text = insertAtIndex( lineSegment.text, insert, character );
					}
					lineOffset += offset;
				} );
			}
		};
		Line.prototype.addStyle = function( style, value, range ) {
			if ( arguments.length === 2 && typeof value == 'object' ) {
				range = value;
			}
			if ( !range ) {} else if ( range.from && ( !range.to || range.to == 0 ) ) {
				this.getLineDataSegments()[ this.getLineDataSegmentsCount() - 1 ].styles[ style ] = value;
			}
		};
		Line.prototype.getLineData = function() {
			return this.textNode.data;
		};
		Line.prototype.getLineDataSegments = function() {
			return this.lineSegmentData;
		};
		Line.prototype.getLineDataSegmentsCount = function() {
			return this.getLineDataSegments().length;
		};
		Line.prototype.getPosition = function() {
			return this.linePosition;
		};
		Line.prototype.getLineHeight = function( characterPosition ) {
			return this.innerLine.clientHeight;
		};
		Line.prototype.highlight = function( start, end ) {
			this.selection.style.left = start.offset;
			this.selection.style.width = end.offset - start.offset + 'px';
		};
		Line.prototype.lineClickHandle = function( e ) {};
		return Line;
	}( events_ClickHandler, coords_getOffsetFromClick, libs_pubsub, utils_text_insertCharacter, styles_styles );

	var lines_LineHandler = function( Line ) {
		var LineHandler = function( el ) {
			this.el = el;
			this.lines = [];
		};
		LineHandler.prototype.createLine = function( position ) {
			var isFirstLine = this.lines.length,
				addAsLastLine = this.lines.length === position;
			var line = new Line( this.lines.length );
			if ( position ) {
				this.lines.splice( position, 0, line );
			} else {
				this.lines.push( line );
			}
			if ( isFirstLine === 0 || addAsLastLine ) {
				this.el.appendChild( line.getNode() );
			} else {
				this.el.insertBefore( line.getNode(), this.getLine( position + 1 ).getNode() );
			}
			return line;
		};
		LineHandler.prototype.getLine = function( lineIndex ) {
			return this.lines[ lineIndex ];
		};
		LineHandler.prototype.getLines = function() {
			return this.lines;
		};
		LineHandler.prototype.linesLength = function() {
			return this.lines.length;
		};
		return LineHandler;
	}( lines_Line );

	var utils_text_buildCharacterWidths = function() {
		var buildCharacterWidths = function() {
			var _maxWidth = 0,
				_charWidthArray = {};
			var generateASCIIwidth = function( cssStyle ) {
				var container, divWrapper, charWrapper, testDrive, obj, character, totalWidth = 0,
					oldTotalWidth = 0,
					charWidth = 0,
					_cssStyle = cssStyle || 'font-family: arial; font-size: 12pt';
				container = document.createDocumentFragment();
				divWrapper = document.createElement( 'div' );
				divWrapper.style = 'width: 6000px; visibility:hidden';
				charWrapper = document.createElement( 'span' );
				charWrapper.style = cssStyle;
				testDrive = document.createElement( 'span' );
				testDrive.appendChild( document.createTextNode( 'i' ) );
				divWrapper.appendChild( charWrapper );
				container.appendChild( divWrapper );
				document.body.appendChild( container );
				charWrapper.appendChild( document.createTextNode( 'f' ) );
				charWrapper.appendChild( testDrive );
				totalWidth = charWrapper.offsetWidth;
				charWrapper.insertBefore( document.createTextNode( '\xA0' ), testDrive );
				oldTotalWidth = totalWidth;
				totalWidth = charWrapper.offsetWidth;
				charWidth = totalWidth - oldTotalWidth + 0.4;
				_charWidthArray[ '_\xA0' ] = charWidth;
				for ( var i = 33; i <= 126; i++ ) {
					character = String.fromCharCode( i );
					charWrapper.insertBefore( document.createTextNode( '' + character + character ), testDrive );
					oldTotalWidth = totalWidth;
					totalWidth = charWrapper.offsetWidth;
					charWidth = ( totalWidth - oldTotalWidth ) / 2;
					_charWidthArray[ '_' + character ] = charWidth;
					if ( _maxWidth < _charWidthArray[ '_' + character ] ) {
						_maxWidth = _charWidthArray[ '_' + character ];
					}
				}
				document.body.removeChild( divWrapper );
			};
			generateASCIIwidth();
			var getCharacterWidth = function( character ) {
				if ( !! _charWidthArray[ '_' + character ] ) {
					return _charWidthArray[ '_' + character ];
				} else {
					_charWidthArray[ '_' + character ] = _maxWidth;
					return _maxWidth;
				}
			};
			return {
				getCharacterWidth: getCharacterWidth
			};
		}();
		return buildCharacterWidths;
	}();

	var cursor_Cursor = function( buildCharacterWidths ) {
		var cursorClasses = {
			standard: 'nonrte-cursor',
			focus: 'blink',
			hidden: 'hidden'
		};
		var Cursor = function() {
			this.cursorNode = document.createElement( 'div' );
			this.cursorNode.classList.add( cursorClasses.standard );
			this.cursorNode.classList.add( cursorClasses.focus );
		};
		Cursor.prototype.positionOnLine = function( line, characterPosition ) {
			line.getNode().appendChild( this.cursorNode );
			if ( typeof characterPosition === 'number' ) {
				this.moveToCharacterPosition( line, characterPosition );
			}
		};
		Cursor.prototype.position = function( x ) {
			this.cursorNode.style.left = x + 'px';
		};
		Cursor.prototype.moveToCharacterPosition = function( line, characterPosition ) {
			var text = line.getTextNode().data.split( '' ),
				offset = 0;
			text.forEach( function( character, iterator ) {
				if ( iterator < characterPosition ) {
					offset += buildCharacterWidths.getCharacterWidth( character );
				}
			} );
			this.position( offset );
		};
		Cursor.prototype.setHeight = function( height ) {
			this.cursorNode.style.height = height + 'px';
		};
		Cursor.prototype.hide = function() {
			this.cursorNode.classList.add( 'hidden' );
		};
		Cursor.prototype.show = function() {
			this.cursorNode.classList.remove( 'hidden' );
		};
		return Cursor;
	}( utils_text_buildCharacterWidths );

	var NonRTE_init_init = function( buildCharacterWidths ) {
		var init = function() {};
		return init;
	}( utils_text_buildCharacterWidths );

	/*
	Data is the top most level of tracking data changes.
	It will have a representation of everything in the DOM in a structure format
	It will be queryable, and when modified will update the DOM
	It is the heart of the app. It's like Ractive but for just RTE
 */
	var data_Data = function( pubsub ) {
		var Data = function( lineHandler ) {
			this.lineHandler = lineHandler;
		};
		Data.prototype.set = function() {};
		Data.prototype.addCharacterToLineEnd = function( line, character ) {};
		Data.prototype.addCharacterToPositionOnLine = function( line, position, character ) {};
		Data.prototype.export = function() {};
		return Data;
	}( libs_pubsub );

	var events_SelectHandler = function( pubsub ) {
		var wrapEvent = function( fn ) {
			return fn;
		};
		var SelectionHandler = function( node, fn ) {
			this.fn = fn;
			this.node = node;
			this.fnMouseMove = wrapEvent( this.handleMouseMove.bind( this ) );
			this.fnMouseEnd = wrapEvent( this.handleMouseUp.bind( this ) );
			node.addEventListener( 'mousedown', this.handleMouseDown.bind( this ), false );
		};
		SelectionHandler.prototype.handleMouseDown = function( e ) {
			e.preventDefault();
			pubsub.publish( 'selection.start', e );
			this.node.addEventListener( 'mousemove', this.fnMouseMove, false );
			this.node.addEventListener( 'mouseup', this.fnMouseEnd, false );
		};
		SelectionHandler.prototype.handleMouseUp = function( e ) {
			e.preventDefault();
			pubsub.publish( 'selection.end', e );
			this.node.removeEventListener( 'mousemove', this.fnMouseMove, false );
			this.node.removeEventListener( 'mouseup', this.fnMouseEnd, false );
		};
		SelectionHandler.prototype.handleMouseMove = function( e ) {
			e.preventDefault();
			pubsub.publish( 'selection.change', e );
		};
		return SelectionHandler;
	}( libs_pubsub );

	var range_Range = function() {
		var Range = function( line, from, to ) {
			this.line = line;
			this.from = from;
			this.to = to;
		};
		return Range;
	}();

	var selection_Selection = function( Range, getOffsetFromClick ) {
		var drawSelectionForRange = function( Range ) {};
		var Selection = function( lineHandler, offset ) {};
		Selection.prototype.getLineFromOffset = function( offset ) {
			var lines = this.lineHandler.getLines();
		};
		Selection.prototype.getRangeOnLine = function( line, startOffset, endOffset ) {};
		Selection.prototype.highlight = function() {
			this.selectionRange.forEach( function( Range ) {} );
		};
		return Selection;
	}( range_Range, coords_getOffsetFromClick );

	/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/chjj/marked
	 */
	var libs_marked_lib_marked = function() {
		var markAMD = function() {
			var block = {
				newline: /^\n+/,
				code: /^( {4}[^\n]+\n*)+/,
				fences: noop,
				hr: /^( *[-*_]){3,} *(?:\n+|$)/,
				heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
				nptable: noop,
				lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
				blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
				list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
				html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
				def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
				table: noop,
				paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
				text: /^[^\n]+/
			};
			block.bullet = /(?:[*+-]|\d+\.)/;
			block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
			block.item = replace( block.item, 'gm' )( /bull/g, block.bullet )();
			block.list = replace( block.list )( /bull/g, block.bullet )( 'hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))' )( 'def', '\\n+(?=' + block.def.source + ')' )();
			block.blockquote = replace( block.blockquote )( 'def', block.def )();
			block._tag = '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code' + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo' + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';
			block.html = replace( block.html )( 'comment', /<!--[\s\S]*?-->/ )( 'closed', /<(tag)[\s\S]+?<\/\1>/ )( 'closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/ )( /tag/g, block._tag )();
			block.paragraph = replace( block.paragraph )( 'hr', block.hr )( 'heading', block.heading )( 'lheading', block.lheading )( 'blockquote', block.blockquote )( 'tag', '<' + block._tag )( 'def', block.def )();
			block.normal = merge( {}, block );
			block.gfm = merge( {}, block.normal, {
				fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
				paragraph: /^/
			} );
			block.gfm.paragraph = replace( block.paragraph )( '(?!', '(?!' + block.gfm.fences.source.replace( '\\1', '\\2' ) + '|' + block.list.source.replace( '\\1', '\\3' ) + '|' )();
			block.tables = merge( {}, block.gfm, {
				nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
				table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
			} );

			function Lexer( options ) {
				this.tokens = [];
				this.tokens.links = {};
				this.options = options || marked.defaults;
				this.rules = block.normal;
				if ( this.options.gfm ) {
					if ( this.options.tables ) {
						this.rules = block.tables;
					} else {
						this.rules = block.gfm;
					}
				}
			}
			Lexer.rules = block;
			Lexer.lex = function( src, options ) {
				var lexer = new Lexer( options );
				return lexer.lex( src );
			};
			Lexer.prototype.lex = function( src ) {
				src = src.replace( /\r\n|\r/g, '\n' ).replace( /\t/g, '    ' ).replace( /\u00a0/g, ' ' ).replace( /\u2424/g, '\n' );
				return this.token( src, true );
			};
			Lexer.prototype.token = function( src, top, bq ) {
				var src = src.replace( /^ +$/gm, '' ),
					next, loose, cap, bull, b, item, space, i, l;
				while ( src ) {
					if ( cap = this.rules.newline.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						if ( cap[ 0 ].length > 1 ) {
							this.tokens.push( {
								type: 'space'
							} );
						}
					}
					if ( cap = this.rules.code.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						cap = cap[ 0 ].replace( /^ {4}/gm, '' );
						this.tokens.push( {
							type: 'code',
							text: !this.options.pedantic ? cap.replace( /\n+$/, '' ) : cap
						} );
						continue;
					}
					if ( cap = this.rules.fences.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						this.tokens.push( {
							type: 'code',
							lang: cap[ 2 ],
							text: cap[ 3 ]
						} );
						continue;
					}
					if ( cap = this.rules.heading.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						this.tokens.push( {
							type: 'heading',
							depth: cap[ 1 ].length,
							text: cap[ 2 ]
						} );
						continue;
					}
					if ( top && ( cap = this.rules.nptable.exec( src ) ) ) {
						src = src.substring( cap[ 0 ].length );
						item = {
							type: 'table',
							header: cap[ 1 ].replace( /^ *| *\| *$/g, '' ).split( / *\| */ ),
							align: cap[ 2 ].replace( /^ *|\| *$/g, '' ).split( / *\| */ ),
							cells: cap[ 3 ].replace( /\n$/, '' ).split( '\n' )
						};
						for ( i = 0; i < item.align.length; i++ ) {
							if ( /^ *-+: *$/.test( item.align[ i ] ) ) {
								item.align[ i ] = 'right';
							} else if ( /^ *:-+: *$/.test( item.align[ i ] ) ) {
								item.align[ i ] = 'center';
							} else if ( /^ *:-+ *$/.test( item.align[ i ] ) ) {
								item.align[ i ] = 'left';
							} else {
								item.align[ i ] = null;
							}
						}
						for ( i = 0; i < item.cells.length; i++ ) {
							item.cells[ i ] = item.cells[ i ].split( / *\| */ );
						}
						this.tokens.push( item );
						continue;
					}
					if ( cap = this.rules.lheading.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						this.tokens.push( {
							type: 'heading',
							depth: cap[ 2 ] === '=' ? 1 : 2,
							text: cap[ 1 ]
						} );
						continue;
					}
					if ( cap = this.rules.hr.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						this.tokens.push( {
							type: 'hr'
						} );
						continue;
					}
					if ( cap = this.rules.blockquote.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						this.tokens.push( {
							type: 'blockquote_start'
						} );
						cap = cap[ 0 ].replace( /^ *> ?/gm, '' );
						this.token( cap, top, true );
						this.tokens.push( {
							type: 'blockquote_end'
						} );
						continue;
					}
					if ( cap = this.rules.list.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						bull = cap[ 2 ];
						this.tokens.push( {
							type: 'list_start',
							ordered: bull.length > 1
						} );
						cap = cap[ 0 ].match( this.rules.item );
						next = false;
						l = cap.length;
						i = 0;
						for ( ; i < l; i++ ) {
							item = cap[ i ];
							space = item.length;
							item = item.replace( /^ *([*+-]|\d+\.) +/, '' );
							if ( ~item.indexOf( '\n ' ) ) {
								space -= item.length;
								item = !this.options.pedantic ? item.replace( new RegExp( '^ {1,' + space + '}', 'gm' ), '' ) : item.replace( /^ {1,4}/gm, '' );
							}
							if ( this.options.smartLists && i !== l - 1 ) {
								b = block.bullet.exec( cap[ i + 1 ] )[ 0 ];
								if ( bull !== b && !( bull.length > 1 && b.length > 1 ) ) {
									src = cap.slice( i + 1 ).join( '\n' ) + src;
									i = l - 1;
								}
							}
							loose = next || /\n\n(?!\s*$)/.test( item );
							if ( i !== l - 1 ) {
								next = item.charAt( item.length - 1 ) === '\n';
								if ( !loose )
									loose = next;
							}
							this.tokens.push( {
								type: loose ? 'loose_item_start' : 'list_item_start'
							} );
							this.token( item, false, bq );
							this.tokens.push( {
								type: 'list_item_end'
							} );
						}
						this.tokens.push( {
							type: 'list_end'
						} );
						continue;
					}
					if ( cap = this.rules.html.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						this.tokens.push( {
							type: this.options.sanitize ? 'paragraph' : 'html',
							pre: cap[ 1 ] === 'pre' || cap[ 1 ] === 'script' || cap[ 1 ] === 'style',
							text: cap[ 0 ]
						} );
						continue;
					}
					if ( !bq && top && ( cap = this.rules.def.exec( src ) ) ) {
						src = src.substring( cap[ 0 ].length );
						this.tokens.links[ cap[ 1 ].toLowerCase() ] = {
							href: cap[ 2 ],
							title: cap[ 3 ]
						};
						continue;
					}
					if ( top && ( cap = this.rules.table.exec( src ) ) ) {
						src = src.substring( cap[ 0 ].length );
						item = {
							type: 'table',
							header: cap[ 1 ].replace( /^ *| *\| *$/g, '' ).split( / *\| */ ),
							align: cap[ 2 ].replace( /^ *|\| *$/g, '' ).split( / *\| */ ),
							cells: cap[ 3 ].replace( /(?: *\| *)?\n$/, '' ).split( '\n' )
						};
						for ( i = 0; i < item.align.length; i++ ) {
							if ( /^ *-+: *$/.test( item.align[ i ] ) ) {
								item.align[ i ] = 'right';
							} else if ( /^ *:-+: *$/.test( item.align[ i ] ) ) {
								item.align[ i ] = 'center';
							} else if ( /^ *:-+ *$/.test( item.align[ i ] ) ) {
								item.align[ i ] = 'left';
							} else {
								item.align[ i ] = null;
							}
						}
						for ( i = 0; i < item.cells.length; i++ ) {
							item.cells[ i ] = item.cells[ i ].replace( /^ *\| *| *\| *$/g, '' ).split( / *\| */ );
						}
						this.tokens.push( item );
						continue;
					}
					if ( top && ( cap = this.rules.paragraph.exec( src ) ) ) {
						src = src.substring( cap[ 0 ].length );
						this.tokens.push( {
							type: 'paragraph',
							text: cap[ 1 ].charAt( cap[ 1 ].length - 1 ) === '\n' ? cap[ 1 ].slice( 0, -1 ) : cap[ 1 ]
						} );
						continue;
					}
					if ( cap = this.rules.text.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						this.tokens.push( {
							type: 'text',
							text: cap[ 0 ]
						} );
						continue;
					}
					if ( src ) {
						throw new Error( 'Infinite loop on byte: ' + src.charCodeAt( 0 ) );
					}
				}
				return this.tokens;
			};
			var style = {
				tag: /(([#|*|\-|_|+|\^|~|\=])(\(([\s\S]+?)\))?)?/,
				style: /(.)(\(([\s\S]+?)?\))?/
			};
			StyleLexer.rules = style;

			function StyleLexer( links, options ) {
				this.options = options || marked.defaults;
				this.links = links;
				this.rules = style;
				this.renderer = this.options.styleRenderer || new StyleRenderer();
				this.renderer.options = this.options;
			}
			StyleLexer.prototype.output = function( src ) {
				var cap, out = {}, link;
				while ( src ) {
					if ( cap = this.rules.tag.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						out = mergeStyles( out, this.renderer.style( cap[ 1 ].match( this.rules.style ) ) );
						continue;
					}
				}
				return stringify( out );
			};

			function mergeStyles( styles, style ) {
				var currentStyle;
				for ( var key in style ) {
					if ( style.hasOwnProperty( key ) ) {
						currentStyle = styles[ key ] || '';
						styles[ key ] = currentStyle.substr( 0, currentStyle.length - 1 ) + style[ key ] + ';';
					}
				}
				return styles;
			}

			function stringify( styles ) {
				var style = '';
				for ( var key in styles ) {
					if ( styles.hasOwnProperty( key ) ) {
						style += key + ':' + styles[ key ];
					}
				}
				return style;
			}
			var styleRender = {
				'#': function() {
					return {
						'font-weight': 'bold'
					};
				},
				'*': function() {
					return {
						'font-style': 'italic'
					};
				},
				'-': function() {
					return {
						'text-decoration': 'line-through '
					};
				},
				'_': function() {
					return {
						'text-decoration': 'underline '
					};
				},
				'+': function( fontSize ) {
					return {
						'font-size': fontSize
					};
				},
				'^': function( font ) {
					return {
						'font-family': font
					};
				},
				'~': function( color ) {
					return {
						'color': color
					};
				},
				'=': function( color ) {
					return {
						'background-color': color
					};
				}
			};

			function StyleRenderer() {}
			StyleRenderer.prototype.style = function( cap ) {
				return styleRender[ cap[ 1 ] ]( cap[ 3 ] );
			};
			var inline = {
				escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
				autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
				url: noop,
				tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
				link: /^!?\[(inside)\]\(href\)/,
				reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
				nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
				strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
				em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
				code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
				br: /^ {2,}\n(?!\s*$)/,
				del: noop,
				text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/,
				styled: /^{\[([\s\S]+?)\]:\s([\s\S]+?)\s:}/
			};
			inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
			inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;
			inline.link = replace( inline.link )( 'inside', inline._inside )( 'href', inline._href )();
			inline.reflink = replace( inline.reflink )( 'inside', inline._inside )();
			inline.normal = merge( {}, inline );
			inline.pedantic = merge( {}, inline.normal, {
				strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
				em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
			} );
			inline.gfm = merge( {}, inline.normal, {
				escape: replace( inline.escape )( '])', '~|])' )(),
				url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
				del: /^~~(?=\S)([\s\S]*?\S)~~/,
				text: replace( inline.text )( ']|', '~]|' )( '|', '|https?://|' )()
			} );
			inline.breaks = merge( {}, inline.gfm, {
				br: replace( inline.br )( '{2,}', '*' )(),
				text: replace( inline.gfm.text )( '{2,}', '*' )()
			} );

			function InlineLexer( links, options ) {
				this.options = options || marked.defaults;
				this.links = links;
				this.rules = inline.normal;
				this.renderer = this.options.renderer || new Renderer();
				this.renderer.options = this.options;
				this.styleLexer = new StyleLexer( links, options );
				if ( !this.links ) {
					throw new Error( 'Tokens array requires a `links` property.' );
				}
				if ( this.options.gfm ) {
					if ( this.options.breaks ) {
						this.rules = inline.breaks;
					} else {
						this.rules = inline.gfm;
					}
				} else if ( this.options.pedantic ) {
					this.rules = inline.pedantic;
				}
			}
			InlineLexer.rules = inline;
			InlineLexer.output = function( src, links, options ) {
				var inline = new InlineLexer( links, options );
				return inline.output( src );
			};
			InlineLexer.prototype.output = function( src ) {
				var out = '',
					link, text, href, cap;
				while ( src ) {
					if ( cap = this.rules.escape.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						out += cap[ 1 ];
						continue;
					}
					if ( cap = this.rules.autolink.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						if ( cap[ 2 ] === '@' ) {
							text = cap[ 1 ].charAt( 6 ) === ':' ? this.mangle( cap[ 1 ].substring( 7 ) ) : this.mangle( cap[ 1 ] );
							href = this.mangle( 'mailto:' ) + text;
						} else {
							text = escape( cap[ 1 ] );
							href = text;
						}
						out += this.renderer.link( href, null, text );
						continue;
					}
					if ( cap = this.rules.styled.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						out += this.renderer.styled( this.output( cap[ 2 ] ), this.styleLexer.output( cap[ 1 ] ) );
						continue;
					}
					if ( !this.inLink && ( cap = this.rules.url.exec( src ) ) ) {
						src = src.substring( cap[ 0 ].length );
						text = escape( cap[ 1 ] );
						href = text;
						out += this.renderer.link( href, null, text );
						continue;
					}
					if ( cap = this.rules.tag.exec( src ) ) {
						if ( !this.inLink && /^<a /i.test( cap[ 0 ] ) ) {
							this.inLink = true;
						} else if ( this.inLink && /^<\/a>/i.test( cap[ 0 ] ) ) {
							this.inLink = false;
						}
						src = src.substring( cap[ 0 ].length );
						out += this.options.sanitize ? escape( cap[ 0 ] ) : cap[ 0 ];
						continue;
					}
					if ( cap = this.rules.link.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						this.inLink = true;
						out += this.outputLink( cap, {
							href: cap[ 2 ],
							title: cap[ 3 ]
						} );
						this.inLink = false;
						continue;
					}
					if ( ( cap = this.rules.reflink.exec( src ) ) || ( cap = this.rules.nolink.exec( src ) ) ) {
						src = src.substring( cap[ 0 ].length );
						link = ( cap[ 2 ] || cap[ 1 ] ).replace( /\s+/g, ' ' );
						link = this.links[ link.toLowerCase() ];
						if ( !link || !link.href ) {
							out += cap[ 0 ].charAt( 0 );
							src = cap[ 0 ].substring( 1 ) + src;
							continue;
						}
						this.inLink = true;
						out += this.outputLink( cap, link );
						this.inLink = false;
						continue;
					}
					if ( cap = this.rules.strong.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						out += this.renderer.strong( this.output( cap[ 2 ] || cap[ 1 ] ) );
						continue;
					}
					if ( cap = this.rules.em.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						out += this.renderer.em( this.output( cap[ 2 ] || cap[ 1 ] ) );
						continue;
					}
					if ( cap = this.rules.code.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						out += this.renderer.codespan( escape( cap[ 2 ], true ) );
						continue;
					}
					if ( cap = this.rules.br.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						out += this.renderer.br();
						continue;
					}
					if ( cap = this.rules.del.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						out += this.renderer.del( this.output( cap[ 1 ] ) );
						continue;
					}
					if ( cap = this.rules.text.exec( src ) ) {
						src = src.substring( cap[ 0 ].length );
						out += escape( this.smartypants( cap[ 0 ] ) );
						continue;
					}
					if ( src ) {
						throw new Error( 'Infinite loop on byte: ' + src.charCodeAt( 0 ) );
					}
				}
				return out;
			};
			InlineLexer.prototype.outputLink = function( cap, link ) {
				var href = escape( link.href ),
					title = link.title ? escape( link.title ) : null;
				return cap[ 0 ].charAt( 0 ) !== '!' ? this.renderer.link( href, title, this.output( cap[ 1 ] ) ) : this.renderer.image( href, title, escape( cap[ 1 ] ) );
			};
			InlineLexer.prototype.smartypants = function( text ) {
				if ( !this.options.smartypants )
					return text;
				return text.replace( /--/g, '\u2014' ).replace( /(^|[-\u2014/(\[{"\s])'/g, '$1\u2018' ).replace( /'/g, '\u2019' ).replace( /(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201C' ).replace( /"/g, '\u201D' ).replace( /\.{3}/g, '\u2026' );
			};
			InlineLexer.prototype.mangle = function( text ) {
				var out = '',
					l = text.length,
					i = 0,
					ch;
				for ( ; i < l; i++ ) {
					ch = text.charCodeAt( i );
					if ( Math.random() > 0.5 ) {
						ch = 'x' + ch.toString( 16 );
					}
					out += '&#' + ch + ';';
				}
				return out;
			};

			function Renderer( options ) {
				this.options = options || {};
			}
			Renderer.prototype.code = function( code, lang, escaped ) {
				if ( this.options.highlight ) {
					var out = this.options.highlight( code, lang );
					if ( out != null && out !== code ) {
						escaped = true;
						code = out;
					}
				}
				if ( !lang ) {
					return '<pre><code>' + ( escaped ? code : escape( code, true ) ) + '\n</code></pre>';
				}
				return '<pre><code class="' + this.options.langPrefix + escape( lang, true ) + '">' + ( escaped ? code : escape( code, true ) ) + '\n</code></pre>\n';
			};
			Renderer.prototype.blockquote = function( quote ) {
				return '<blockquote>\n' + quote + '</blockquote>\n';
			};
			Renderer.prototype.html = function( html ) {
				return html;
			};
			Renderer.prototype.heading = function( text, level, raw ) {
				return '<h' + level + ' id="' + this.options.headerPrefix + raw.toLowerCase().replace( /[^\w]+/g, '-' ) + '">' + text + '</h' + level + '>\n';
			};
			Renderer.prototype.hr = function() {
				return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
			};
			Renderer.prototype.list = function( body, ordered ) {
				var type = ordered ? 'ol' : 'ul';
				return '<' + type + '>\n' + body + '</' + type + '>\n';
			};
			Renderer.prototype.listitem = function( text ) {
				return '<li>' + text + '</li>\n';
			};
			Renderer.prototype.paragraph = function( text ) {
				return '<p>' + text + '</p>\n';
			};
			Renderer.prototype.table = function( header, body ) {
				return '<table>\n' + '<thead>\n' + header + '</thead>\n' + '<tbody>\n' + body + '</tbody>\n' + '</table>\n';
			};
			Renderer.prototype.tablerow = function( content ) {
				return '<tr>\n' + content + '</tr>\n';
			};
			Renderer.prototype.tablecell = function( content, flags ) {
				var type = flags.header ? 'th' : 'td';
				var tag = flags.align ? '<' + type + ' style="text-align:' + flags.align + '">' : '<' + type + '>';
				return tag + content + '</' + type + '>\n';
			};
			Renderer.prototype.strong = function( text ) {
				return '<strong>' + text + '</strong>';
			};
			Renderer.prototype.em = function( text ) {
				return '<em>' + text + '</em>';
			};
			Renderer.prototype.codespan = function( text ) {
				return '<code>' + text + '</code>';
			};
			Renderer.prototype.styled = function( text, style ) {
				return '<span style="' + style + '">' + text + '</span>';
			};
			Renderer.prototype.br = function() {
				return this.options.xhtml ? '<br/>' : '<br>';
			};
			Renderer.prototype.del = function( text ) {
				return '<del>' + text + '</del>';
			};
			Renderer.prototype.link = function( href, title, text ) {
				if ( this.options.sanitize ) {
					try {
						var prot = decodeURIComponent( unescape( href ) ).replace( /[^\w:]/g, '' ).toLowerCase();
					} catch ( e ) {
						return '';
					}
					if ( prot.indexOf( 'javascript:' ) === 0 ) {
						return '';
					}
				}
				var out = '<a href="' + href + '"';
				if ( title ) {
					out += ' title="' + title + '"';
				}
				out += '>' + text + '</a>';
				return out;
			};
			Renderer.prototype.image = function( href, title, text ) {
				var out = '<img src="' + href + '" alt="' + text + '"';
				if ( title ) {
					out += ' title="' + title + '"';
				}
				out += this.options.xhtml ? '/>' : '>';
				return out;
			};

			function Parser( options ) {
				this.tokens = [];
				this.token = null;
				this.options = options || marked.defaults;
				this.options.renderer = this.options.renderer || new Renderer();
				this.renderer = this.options.renderer;
				this.renderer.options = this.options;
			}
			Parser.parse = function( src, options, renderer ) {
				var parser = new Parser( options, renderer );
				return parser.parse( src );
			};
			Parser.prototype.parse = function( src ) {
				this.inline = new InlineLexer( src.links, this.options, this.renderer );
				this.tokens = src.reverse();
				var out = '';
				while ( this.next() ) {
					out += this.tok();
				}
				return out;
			};
			Parser.prototype.next = function() {
				return this.token = this.tokens.pop();
			};
			Parser.prototype.peek = function() {
				return this.tokens[ this.tokens.length - 1 ] || 0;
			};
			Parser.prototype.parseText = function() {
				var body = this.token.text;
				while ( this.peek().type === 'text' ) {
					body += '\n' + this.next().text;
				}
				return this.inline.output( body );
			};
			Parser.prototype.tok = function() {
				switch ( this.token.type ) {
					case 'space':
						{
							return '';
						}
					case 'hr':
						{
							return this.renderer.hr();
						}
					case 'heading':
						{
							return this.renderer.heading( this.inline.output( this.token.text ), this.token.depth, this.token.text );
						}
					case 'code':
						{
							return this.renderer.code( this.token.text, this.token.lang, this.token.escaped );
						}
					case 'table':
						{
							var header = '',
								body = '',
								i, row, cell, flags, j;
							cell = '';
							for ( i = 0; i < this.token.header.length; i++ ) {
								flags = {
									header: true,
									align: this.token.align[ i ]
								};
								cell += this.renderer.tablecell( this.inline.output( this.token.header[ i ] ), {
									header: true,
									align: this.token.align[ i ]
								} );
							}
							header += this.renderer.tablerow( cell );
							for ( i = 0; i < this.token.cells.length; i++ ) {
								row = this.token.cells[ i ];
								cell = '';
								for ( j = 0; j < row.length; j++ ) {
									cell += this.renderer.tablecell( this.inline.output( row[ j ] ), {
										header: false,
										align: this.token.align[ j ]
									} );
								}
								body += this.renderer.tablerow( cell );
							}
							return this.renderer.table( header, body );
						}
					case 'blockquote_start':
						{
							var body = '';
							while ( this.next().type !== 'blockquote_end' ) {
								body += this.tok();
							}
							return this.renderer.blockquote( body );
						}
					case 'list_start':
						{
							var body = '',
								ordered = this.token.ordered;
							while ( this.next().type !== 'list_end' ) {
								body += this.tok();
							}
							return this.renderer.list( body, ordered );
						}
					case 'list_item_start':
						{
							var body = '';
							while ( this.next().type !== 'list_item_end' ) {
								body += this.token.type === 'text' ? this.parseText() : this.tok();
							}
							return this.renderer.listitem( body );
						}
					case 'loose_item_start':
						{
							var body = '';
							while ( this.next().type !== 'list_item_end' ) {
								body += this.tok();
							}
							return this.renderer.listitem( body );
						}
					case 'html':
						{
							var html = !this.token.pre && !this.options.pedantic ? this.inline.output( this.token.text ) : this.token.text;
							return this.renderer.html( html );
						}
					case 'paragraph':
						{
							return this.renderer.paragraph( this.inline.output( this.token.text ) );
						}
					case 'text':
						{
							return this.renderer.paragraph( this.parseText() );
						}
				}
			};

			function escape( html, encode ) {
				return html.replace( !encode ? /&(?!#?\w+;)/g : /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /"/g, '&quot;' ).replace( /'/g, '&#39;' );
			}

			function unescape( html ) {
				return html.replace( /&([#\w]+);/g, function( _, n ) {
					n = n.toLowerCase();
					if ( n === 'colon' )
						return ':';
					if ( n.charAt( 0 ) === '#' ) {
						return n.charAt( 1 ) === 'x' ? String.fromCharCode( parseInt( n.substring( 2 ), 16 ) ) : String.fromCharCode( +n.substring( 1 ) );
					}
					return '';
				} );
			}

			function replace( regex, opt ) {
				regex = regex.source;
				opt = opt || '';
				return function self( name, val ) {
					if ( !name )
						return new RegExp( regex, opt );
					val = val.source || val;
					val = val.replace( /(^|[^\[])\^/g, '$1' );
					regex = regex.replace( name, val );
					return self;
				};
			}

			function noop() {}
			noop.exec = noop;

			function merge( obj ) {
				var i = 1,
					target, key;
				for ( ; i < arguments.length; i++ ) {
					target = arguments[ i ];
					for ( key in target ) {
						if ( Object.prototype.hasOwnProperty.call( target, key ) ) {
							obj[ key ] = target[ key ];
						}
					}
				}
				return obj;
			}

			function marked( src, opt, callback ) {
				if ( callback || typeof opt === 'function' ) {
					if ( !callback ) {
						callback = opt;
						opt = null;
					}
					opt = merge( {}, marked.defaults, opt || {} );
					var highlight = opt.highlight,
						tokens, pending, i = 0;
					try {
						tokens = Lexer.lex( src, opt );
					} catch ( e ) {
						return callback( e );
					}
					pending = tokens.length;
					var done = function( err ) {
						if ( err ) {
							opt.highlight = highlight;
							return callback( err );
						}
						var out;
						try {
							out = Parser.parse( tokens, opt );
						} catch ( e ) {
							err = e;
						}
						opt.highlight = highlight;
						return err ? callback( err ) : callback( null, out );
					};
					if ( !highlight || highlight.length < 3 ) {
						return done();
					}
					delete opt.highlight;
					if ( !pending )
						return done();
					for ( ; i < tokens.length; i++ ) {
						( function( token ) {
							if ( token.type !== 'code' ) {
								return --pending || done();
							}
							return highlight( token.text, token.lang, function( err, code ) {
								if ( err )
									return done( err );
								if ( code == null || code === token.text ) {
									return --pending || done();
								}
								token.text = code;
								token.escaped = true;
								--pending || done();
							} );
						}( tokens[ i ] ) );
					}
					return;
				}
				try {
					if ( opt )
						opt = merge( {}, marked.defaults, opt );
					return Parser.parse( Lexer.lex( src, opt ), opt );
				} catch ( e ) {
					e.message += '\nPlease report this to https://github.com/chjj/marked.';
					if ( ( opt || marked.defaults ).silent ) {
						return '<p>An error occured:</p><pre>' + escape( e.message + '', true ) + '</pre>';
					}
					throw e;
				}
			}
			marked.options = marked.setOptions = function( opt ) {
				merge( marked.defaults, opt );
				return marked;
			};
			marked.defaults = {
				gfm: true,
				tables: true,
				breaks: false,
				pedantic: false,
				sanitize: false,
				smartLists: false,
				silent: false,
				highlight: null,
				langPrefix: 'lang-',
				smartypants: false,
				headerPrefix: '',
				renderer: new Renderer(),
				xhtml: false
			};
			marked.Parser = Parser;
			marked.parser = Parser.parse;
			marked.Renderer = Renderer;
			marked.Lexer = Lexer;
			marked.lexer = Lexer.lex;
			marked.InlineLexer = InlineLexer;
			marked.inlineLexer = InlineLexer.output;
			marked.parse = marked;
			return marked;
		}();
		return markAMD;
	}();

	var lines_LineCompiler = function( marked, stylesCollection ) {
		var LineCompiler = function( Line ) {
			var lineSegments = Line.getLineDataSegments(),
				stringToCompile = '';
			lineSegments.forEach( function( lineSegment ) {
				stringToCompile += buildWithStyles( lineSegment.styles, lineSegment.text );
			} );
			return marked( stringToCompile );
		};

		function buildWithStyles( styles, text ) {
			var stringToWrap = text,
				frontWrap = '{[',
				frontCloseWrap = ']: ',
				backClose = ' :}',
				style, styleCompile = '';
			for ( style in styles ) {
				if ( styles.hasOwnProperty( style ) ) {
					styleCompile += stylesCollection[ style ].style( styles[ style ] );
				}
			}
			if ( !styleCompile ) {
				return stringToWrap;
			}
			stringToWrap = frontWrap + styleCompile + frontCloseWrap + stringToWrap + backClose;
			return stringToWrap;
		}
		return LineCompiler;
	}( libs_marked_lib_marked, styles_styles );

	var NonRTE__NonRTE = function( KeyHandler, LineHandler, Cursor, init, pubsub, Data, SelectHandler, Selection, marked, LineCompiler, getOffsetFromClick ) {
		var NonRTE = function( element ) {
			this.marked = marked;
			this.element = element;
			this.keyhandler = new KeyHandler();
			this.lineHandler = new LineHandler( this.element );
			this.cursor = new Cursor();
			this.selectHandler = new SelectHandler( this.element, this.handleSelect );
			this.data = new Data( this.lineHandler );
			this.focusPosition = {
				line: 0,
				character: 0
			};
			init( this );
			this.cursor.positionOnLine( this.lineHandler.createLine() );
			this.keyhandler.init();
			this.cursor.setHeight( this.lineHandler.getLine( this.focusPosition.line ).getLineHeight( this.focusPosition.character ) );
			pubsub.subscribe( 'keypress.backspace', function() {
				var focusLine = this.lineHandler.getLine( this.focusPosition.line ),
					textEl = focusLine.getTextNode();
				if ( textEl && textEl.length && this.focusPosition.character - 1 >= 0 ) {
					this.focusPosition.character--;
					textEl.deleteData( this.focusPosition.character, 1 );
				} else if ( textEl && this.focusPosition.line - 1 >= 0 ) {
					if ( this.focusPosition.line ) {
						this.focusPosition.line--;
					}
					focusLine = this.lineHandler.getLine( this.focusPosition.line );
					this.focusPosition.character = focusLine.getTextNode().data.length;
				}
				this.cursor.positionOnLine( focusLine, this.focusPosition.character );
			}.bind( this ) );
			pubsub.subscribe( 'keypress.enter', function() {
				var line = this.lineHandler.createLine( this.focusPosition.line + 1 ),
					focusLine = this.lineHandler.getLine( this.focusPosition.line ),
					textData = focusLine.getLineData(),
					moveData = textData.substring( this.focusPosition.character, textData.length ),
					oldData = textData.substring( 0, this.focusPosition.character );
				if ( moveData ) {
					line.setLineData( moveData );
					focusLine.setLineData( oldData );
				}
				this.focusPosition.line += 1;
				this.focusPosition.character = 0;
				this.cursor.positionOnLine( line, this.focusPosition.character );
			}.bind( this ) );
			pubsub.subscribe( 'keypress.spacebar', function( subName, e ) {
				e.preventDefault();
				pubsub.publish( 'keypress.character', '\xA0' );
			}.bind( this ) );
			pubsub.subscribe( 'keypress.character', function( subName, key ) {
				var line = this.lineHandler.getLine( this.focusPosition.line ),
					lineNode = line.getLineNode();
				line.insertCharacter( key, this.focusPosition.character );
				line.setLineHtml( LineCompiler( line ) );
				this.focusPosition.character++;
			}.bind( this ) );
			pubsub.subscribe( 'lineClick', function( sub, e ) {
				var offset = {
					target: e.original.target,
					originalOffset: e.original.target.parentNode.offsetLeft,
					offsetInisde: e.original.offsetX - e.original.target.parentNode.offsetLeft
				};
				this.focusPosition.character = e.characterOffset.clickedCharacter;
				this.focusPosition.line = e.line.getPosition();
				this.cursor.positionOnLine( e.line, this.focusPosition.character );
			}.bind( this ) );
			pubsub.subscribe( 'keypress.left', function( subName, e ) {
				if ( this.focusPosition.character == 0 && this.focusPosition.line - 1 >= 0 ) {
					this.focusPosition.line--;
					this.focusPosition.character = this.lineHandler.getLine( this.focusPosition.line ).dataLength();
				} else if ( this.focusPosition.character != 0 ) {
					this.focusPosition.character--;
				}
				pubsub.publish( 'updateCursorPosition' );
			}.bind( this ) );
			pubsub.subscribe( 'keypress.right', function( subName, e ) {
				var focusLine = this.lineHandler.getLine( this.focusPosition.line ),
					focusLength = focusLine.dataLength();
				if ( this.focusPosition.character + 1 > focusLine.dataLength() && this.lineHandler.linesLength() < this.focusPosition.line + 1 ) {
					this.focusPosition.line++;
					this.focusPosition.character = 0;
				} else if ( this.focusPosition.character + 1 <= focusLine.dataLength() ) {
					this.focusPosition.character++;
				}
				pubsub.publish( 'updateCursorPosition' );
			}.bind( this ) );
			pubsub.subscribe( 'keypress.up', function( subName, e ) {
				var focusLine = this.lineHandler.getLine( this.focusPosition.line ),
					focusLength = focusLine.dataLength(),
					prevLine;
				if ( this.focusPosition.line - 1 >= 0 ) {
					this.focusPosition.line--;
					prevLine = this.lineHandler.getLine( this.focusPosition.line );
					if ( this.focusPosition.character >= prevLine.dataLength() ) {
						this.focusPosition.character = prevLine.dataLength();
					}
				}
				pubsub.publish( 'updateCursorPosition' );
			}.bind( this ) );
			pubsub.subscribe( 'keypress.down', function( subName, e ) {
				e.preventDefault();
				e.stopPropagation();
				var focusLine = this.lineHandler.getLine( this.focusPosition.line ),
					focusLength = focusLine.dataLength(),
					nextLine;
				if ( this.focusPosition.line + 1 < this.lineHandler.linesLength() ) {
					this.focusPosition.line++;
					nextLine = this.lineHandler.getLine( this.focusPosition.line );
					if ( this.focusPosition.character >= nextLine.dataLength() ) {
						this.focusPosition.character = nextLine.dataLength();
					}
				}
				pubsub.publish( 'updateCursorPosition' );
			}.bind( this ) );
			pubsub.subscribe( 'updateCursorPosition', function() {
				this.cursor.positionOnLine( this.lineHandler.getLine( this.focusPosition.line ), this.focusPosition.character );
			}.bind( this ) );
			pubsub.subscribe( 'selection.start', function( subName, e ) {
				var line = this.lineHandler.getLine( this.focusPosition.line ),
					offset = getOffsetFromClick( line.getLineNode(), e.offsetX );
				this.startSelection = offset;
			}.bind( this ) );
			pubsub.subscribe( 'selection.change', function( subName, e ) {
				var line = this.lineHandler.getLine( this.focusPosition.line ),
					offset = getOffsetFromClick( line.getLineNode(), e.offsetX );
				line.highlight( this.startSelection, offset );
			}.bind( this ) );
			pubsub.subscribe( 'selection.end', function( subName, e ) {
				var line = this.lineHandler.getLine( this.focusPosition.line ),
					offset = getOffsetFromClick( line.getLineNode(), e.offsetX );
				this.endSelection = offset;
				line.highlight( this.startSelection, this.endSelection );
			}.bind( this ) );
			pubsub.subscribe( 'style.bold', function( subName, e ) {
				this.lineHandler.getLine( this.focusPosition.line ).addStyle( 'bold' );
				pubsub.publish( 'recompileLine', this.focusPosition.line );
			}.bind( this ) );
			pubsub.subscribe( 'style.italic', function( subName, e ) {
				this.lineHandler.getLine( this.focusPosition.line ).addStyle( 'italic' );
				pubsub.publish( 'recompileLine', this.focusPosition.line );
			}.bind( this ) );
			pubsub.subscribe( 'style.strikethrough', function( subName, e ) {
				this.lineHandler.getLine( this.focusPosition.line ).addStyle( 'strikethrough' );
				pubsub.publish( 'recompileLine', this.focusPosition.line );
			}.bind( this ) );
			pubsub.subscribe( 'style.underline', function( subName, e ) {
				this.lineHandler.getLine( this.focusPosition.line ).addStyle( 'underline' );
				pubsub.publish( 'recompileLine', this.focusPosition.line );
			}.bind( this ) );
			pubsub.subscribe( 'recompileLine', function( subName, lineNumber ) {
				var line = this.lineHandler.getLine( lineNumber );
				line.setLineHtml( LineCompiler( line ) );
			}.bind( this ) );
		};
		NonRTE.prototype.handleSelect = function( subName, e ) {
			var offset = {
				x: e.offsetX,
				y: e.offsetY
			};
			if ( e.type === 'mousedown' ) {
				this.currentSelection = new Selection( this.lineHandler, offset );
			} else if ( e.type === 'mousemove' ) {} else {}
		};
		NonRTE.prototype.registerKey = function( key, fn ) {
			this.keyHandler.registerKeyListener( key, fn );
		};
		NonRTE.prototype.registerKeySequence = function() {};
		NonRTE.prototype.registerKeyObserveTrigger = function( key, fn ) {
			this.keyHandler.registerKeyListener( key, fn );
			return {
				stop: function() {}
			};
		};
		return NonRTE;
	}( keys_KeyHandler, lines_LineHandler, cursor_Cursor, NonRTE_init_init, libs_pubsub, data_Data, events_SelectHandler, selection_Selection, libs_marked_lib_marked, lines_LineCompiler, coords_getOffsetFromClick );

	var NonRTE = function( NonRTE ) {
		return NonRTE;
	}( NonRTE__NonRTE );


	// export as Common JS module...
	if ( typeof module !== "undefined" && module.exports ) {
		module.exports = NonRTE;
	}

	// ... or as AMD module
	else if ( typeof define === "function" && define.amd ) {
		define( function() {
			return NonRTE;
		} );
	}

	// ... or as browser global
	else {
		global.NonRTE = NonRTE;
	}

}( typeof window !== 'undefined' ? window : this ) );
