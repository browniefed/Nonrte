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
		};
		KeyHandler.prototype.registerKeyHandler = function( cb ) {
			this.keyHandlers.push( cb );
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

	var coords_getOffsetFromClick = function( buildCharacterWidths ) {
		var getOffsetFromClick = function( text, offset ) {
			var currentOffset = 0,
				characterWidth = 0,
				offsetX = 0,
				clickedCharacter = 0;
			text.split( '' ).forEach( function( character, iterator ) {
				characterWidth = buildCharacterWidths.getCharacterWidth( character );
				if ( currentOffset + characterWidth < offset.x ) {
					currentOffset += characterWidth;
					offsetX = currentOffset + characterWidth;
					clickedCharacter = iterator;
				}
			} );
			return {
				offsetX: offsetX,
				clickedCharacter: clickedCharacter
			};
		};
		return getOffsetFromClick;
	}( utils_text_buildCharacterWidths );

	/*
	CreateLine

	Will create a new line at a specified area. If it is beyond the length of the current lines then it will be created at the end.
*/
	var lines_Line = function( ClickHandler, getOffsetFromClick, pubsub ) {
		var CreateLine = function( linePosition ) {
			this.linePosition = linePosition;
			this.node = document.createElement( 'div' );
			this.innerLine = document.createElement( 'div' );
			this.innerLine.classList.add( 'nonrte-line-inner' );
			this.node.classList.add( 'nonrte-line' );
			this.textNode = document.createTextNode( '' );
			this.node.appendChild( this.innerLine );
			this.innerLine.appendChild( this.textNode );
			ClickHandler( this.innerLine, this.lineClickHandle.bind( this ) );
			return this;
		};
		CreateLine.prototype.getNode = function() {
			return this.node;
		};
		CreateLine.prototype.getTextNode = function() {
			return this.textNode;
		};
		CreateLine.prototype.dataLength = function() {
			return this.textNode.data.length;
		};
		CreateLine.prototype.setLineData = function( textData ) {
			this.textNode.data = textData;
		};
		CreateLine.prototype.getLineData = function() {
			return this.textNode.data;
		};
		CreateLine.prototype.getPosition = function() {
			return this.linePosition;
		};
		CreateLine.prototype.getLineHeight = function( characterPosition ) {
			return this.innerLine.clientHeight;
		};
		CreateLine.prototype.lineClickHandle = function( e ) {
			var offset = getOffsetFromClick( this.textNode.data, {
				x: e.offsetX,
				y: e.offsetY
			} );
			offset.offsetX += 2;
			var message = {
				line: this,
				original: e,
				offsets: {
					x: e.offsetX,
					y: e.offsetY
				},
				characterOffset: offset
			};
			pubsub.publish( 'lineClick', message );
		};
		return CreateLine;
	}( events_ClickHandler, coords_getOffsetFromClick, libs_pubsub );

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
		var Data = function() {
			this.lines = [];
		};
		Data.prototype.addCharacterToLineEnd = function( line, character ) {};
		Data.prototype.addCharacterToPositionOnLine = function( line, position, character ) {};
		Data.prototype.export = function() {};
		return Data;
	}( libs_pubsub );

	var NonRTE__NonRTE = function( KeyHandler, LineHandler, Cursor, init, pubsub, Data ) {
		var NonRTE = function( element ) {
			this.element = element;
			this.keyhandler = new KeyHandler();
			this.lineHandler = new LineHandler( this.element );
			this.cursor = new Cursor();
			this.data = new Data();
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
				var textEl = this.lineHandler.getLine( this.focusPosition.line ).getTextNode();
				textEl.insertData( this.focusPosition.character, key );
				this.focusPosition.character++;
				this.cursor.moveToCharacterPosition( this.lineHandler.getLine( this.focusPosition.line ), this.focusPosition.character );
			}.bind( this ) );
			pubsub.subscribe( 'lineClick', function( sub, e ) {
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
	}( keys_KeyHandler, lines_LineHandler, cursor_Cursor, NonRTE_init_init, libs_pubsub, data_Data );

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
