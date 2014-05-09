(function ( global ) {


var keys_keyNames = function () {
        
        var displayKeys = [], key;
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
        for (var i = 0; i < 10; i++) {
            displayKeys.push('' + i);
        }
        for (var i = 65; i <= 90; i++) {
            key = String.fromCharCode(i).toLowerCase();
            displayKeys.push('shift+' + key);
            displayKeys.push(key);
        }
        return displayKeys;
    }();

var keys_Keys = function (keyNames) {
        
        return keyNames;
    }(keys_keyNames);

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
var libs_keyboard = function () {
        var KeyboardMouseTrap;
        KeyboardMouseTrap = function (window, document, undefined) {
            /**
             * mapping of special keycodes to their corresponding keys
             *
             * everything in this dictionary cannot use keypress events
             * so it has to be here to map to the correct keycodes for
             * keyup/keydown events
             *
             * @type {Object}
             */
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
                },
                /**
                 * mapping for special characters so they can support
                 *
                 * this dictionary is only used incase you want to bind a
                 * keyup or keydown event to one of these keys
                 *
                 * @type {Object}
                 */
                _KEYCODE_MAP = {
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
                },
                /**
                 * this is a mapping of keys that require shift on a US keypad
                 * back to the non shift equivelents
                 *
                 * this is so you can use keyup events with these keys
                 *
                 * note that this will only work reliably on US keyboards
                 *
                 * @type {Object}
                 */
                _SHIFT_MAP = {
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
                },
                /**
                 * this is a list of special strings you can use to map
                 * to modifier keys when you specify your keyboard shortcuts
                 *
                 * @type {Object}
                 */
                _SPECIAL_ALIASES = {
                    'option': 'alt',
                    'command': 'meta',
                    'return': 'enter',
                    'escape': 'esc',
                    'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
                },
                /**
                 * variable to store the flipped version of _MAP from above
                 * needed to check if we should use keypress or not when no action
                 * is specified
                 *
                 * @type {Object|undefined}
                 */
                _REVERSE_MAP,
                /**
                 * a list of all the callbacks setup via Mousetrap.bind()
                 *
                 * @type {Object}
                 */
                _callbacks = {},
                /**
                 * direct map of string combinations to callbacks used for trigger()
                 *
                 * @type {Object}
                 */
                _directMap = {},
                /**
                 * keeps track of what level each sequence is at since multiple
                 * sequences can start out with the same sequence
                 *
                 * @type {Object}
                 */
                _sequenceLevels = {},
                /**
                 * variable to store the setTimeout call
                 *
                 * @type {null|number}
                 */
                _resetTimer,
                /**
                 * temporary state where we will ignore the next keyup
                 *
                 * @type {boolean|string}
                 */
                _ignoreNextKeyup = false,
                /**
                 * temporary state where we will ignore the next keypress
                 *
                 * @type {boolean}
                 */
                _ignoreNextKeypress = false,
                /**
                 * are we currently inside of a sequence?
                 * type of action ("keyup" or "keydown" or "keypress") or false
                 *
                 * @type {boolean|string}
                 */
                _nextExpectedAction = false;
            /**
             * loop through the f keys, f1 to f19 and add them to the map
             * programatically
             */
            for (var i = 1; i < 20; ++i) {
                _MAP[111 + i] = 'f' + i;
            }
            /**
             * loop through to map numbers on the numeric keypad
             */
            for (i = 0; i <= 9; ++i) {
                _MAP[i + 96] = i;
            }
            /**
             * cross browser add event method
             *
             * @param {Element|HTMLDocument} object
             * @param {string} type
             * @param {Function} callback
             * @returns void
             */
            function _addEvent(object, type, callback) {
                if (object.addEventListener) {
                    object.addEventListener(type, callback, false);
                    return;
                }
                object.attachEvent('on' + type, callback);
            }
            /**
             * takes the event and returns the key character
             *
             * @param {Event} e
             * @return {string}
             */
            function _characterFromEvent(e) {
                // for keypress events we should return the character as is
                if (e.type == 'keypress') {
                    var character = String.fromCharCode(e.which);
                    // if the shift key is not pressed then it is safe to assume
                    // that we want the character to be lowercase.  this means if
                    // you accidentally have caps lock on then your key bindings
                    // will continue to work
                    //
                    // the only side effect that might not be desired is if you
                    // bind something like 'A' cause you want to trigger an
                    // event when capital A is pressed caps lock will no longer
                    // trigger the event.  shift+a will though.
                    if (!e.shiftKey) {
                        character = character.toLowerCase();
                    }
                    return character;
                }
                // for non keypress events the special maps are needed
                if (_MAP[e.which]) {
                    return _MAP[e.which];
                }
                if (_KEYCODE_MAP[e.which]) {
                    return _KEYCODE_MAP[e.which];
                }
                // if it is not in the special map
                // with keydown and keyup events the character seems to always
                // come in as an uppercase character whether you are pressing shift
                // or not.  we should make sure it is always lowercase for comparisons
                return String.fromCharCode(e.which).toLowerCase();
            }
            /**
             * checks if two arrays are equal
             *
             * @param {Array} modifiers1
             * @param {Array} modifiers2
             * @returns {boolean}
             */
            function _modifiersMatch(modifiers1, modifiers2) {
                return modifiers1.sort().join(',') === modifiers2.sort().join(',');
            }
            /**
             * resets all sequence counters except for the ones passed in
             *
             * @param {Object} doNotReset
             * @returns void
             */
            function _resetSequences(doNotReset) {
                doNotReset = doNotReset || {};
                var activeSequences = false, key;
                for (key in _sequenceLevels) {
                    if (doNotReset[key]) {
                        activeSequences = true;
                        continue;
                    }
                    _sequenceLevels[key] = 0;
                }
                if (!activeSequences) {
                    _nextExpectedAction = false;
                }
            }
            /**
             * finds all callbacks that match based on the keycode, modifiers,
             * and action
             *
             * @param {string} character
             * @param {Array} modifiers
             * @param {Event|Object} e
             * @param {string=} sequenceName - name of the sequence we are looking for
             * @param {string=} combination
             * @param {number=} level
             * @returns {Array}
             */
            function _getMatches(character, modifiers, e, sequenceName, combination, level) {
                var i, callback, matches = [], action = e.type;
                // if there are no events related to this keycode
                if (!_callbacks[character]) {
                    return [];
                }
                // if a modifier key is coming up on its own we should allow it
                if (action == 'keyup' && _isModifier(character)) {
                    modifiers = [character];
                }
                // loop through all callbacks for the key that was pressed
                // and see if any of them match
                for (i = 0; i < _callbacks[character].length; ++i) {
                    callback = _callbacks[character][i];
                    // if a sequence name is not specified, but this is a sequence at
                    // the wrong level then move onto the next match
                    if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
                        continue;
                    }
                    // if the action we are looking for doesn't match the action we got
                    // then we should keep going
                    if (action != callback.action) {
                        continue;
                    }
                    // if this is a keypress event and the meta key and control key
                    // are not pressed that means that we need to only look at the
                    // character, otherwise check the modifiers as well
                    //
                    // chrome will not fire a keypress if meta or control is down
                    // safari will fire a keypress if meta or meta+shift is down
                    // firefox will fire a keypress if meta or control is down
                    if (action == 'keypress' && !e.metaKey && !e.ctrlKey || _modifiersMatch(modifiers, callback.modifiers)) {
                        // when you bind a combination or sequence a second time it
                        // should overwrite the first one.  if a sequenceName or
                        // combination is specified in this call it does just that
                        //
                        // @todo make deleting its own method?
                        var deleteCombo = !sequenceName && callback.combo == combination;
                        var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
                        if (deleteCombo || deleteSequence) {
                            _callbacks[character].splice(i, 1);
                        }
                        matches.push(callback);
                    }
                }
                return matches;
            }
            /**
             * takes a key event and figures out what the modifiers are
             *
             * @param {Event} e
             * @returns {Array}
             */
            function _eventModifiers(e) {
                var modifiers = [];
                if (e.shiftKey) {
                    modifiers.push('shift');
                }
                if (e.altKey) {
                    modifiers.push('alt');
                }
                if (e.ctrlKey) {
                    modifiers.push('ctrl');
                }
                if (e.metaKey) {
                    modifiers.push('meta');
                }
                return modifiers;
            }
            /**
             * prevents default for this event
             *
             * @param {Event} e
             * @returns void
             */
            function _preventDefault(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                    return;
                }
                e.returnValue = false;
            }
            /**
             * stops propogation for this event
             *
             * @param {Event} e
             * @returns void
             */
            function _stopPropagation(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                    return;
                }
                e.cancelBubble = true;
            }
            /**
             * actually calls the callback function
             *
             * if your callback function returns false this will use the jquery
             * convention - prevent default and stop propogation on the event
             *
             * @param {Function} callback
             * @param {Event} e
             * @returns void
             */
            function _fireCallback(callback, e, combo, sequence) {
                // if this event should not happen stop here
                if (Mousetrap.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
                    return;
                }
                if (callback(e, combo) === false) {
                    _preventDefault(e);
                    _stopPropagation(e);
                }
            }
            /**
             * handles a character key event
             *
             * @param {string} character
             * @param {Array} modifiers
             * @param {Event} e
             * @returns void
             */
            function _handleKey(character, modifiers, e) {
                var callbacks = _getMatches(character, modifiers, e), i, doNotReset = {}, maxLevel = 0, processedSequenceCallback = false;
                // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
                for (i = 0; i < callbacks.length; ++i) {
                    if (callbacks[i].seq) {
                        maxLevel = Math.max(maxLevel, callbacks[i].level);
                    }
                }
                // loop through matching callbacks for this key event
                for (i = 0; i < callbacks.length; ++i) {
                    // fire for all sequence callbacks
                    // this is because if for example you have multiple sequences
                    // bound such as "g i" and "g t" they both need to fire the
                    // callback for matching g cause otherwise you can only ever
                    // match the first one
                    if (callbacks[i].seq) {
                        // only fire callbacks for the maxLevel to prevent
                        // subsequences from also firing
                        //
                        // for example 'a option b' should not cause 'option b' to fire
                        // even though 'option b' is part of the other sequence
                        //
                        // any sequences that do not match here will be discarded
                        // below by the _resetSequences call
                        if (callbacks[i].level != maxLevel) {
                            continue;
                        }
                        processedSequenceCallback = true;
                        // keep a list of which sequences were matches for later
                        doNotReset[callbacks[i].seq] = 1;
                        _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
                        continue;
                    }
                    // if there were no sequence matches but we are still here
                    // that means this is a regular match so we should fire that
                    if (!processedSequenceCallback) {
                        _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                    }
                }
                // if the key you pressed matches the type of sequence without
                // being a modifier (ie "keyup" or "keypress") then we should
                // reset all sequences that were not matched by this event
                //
                // this is so, for example, if you have the sequence "h a t" and you
                // type "h e a r t" it does not match.  in this case the "e" will
                // cause the sequence to reset
                //
                // modifier keys are ignored because you can have a sequence
                // that contains modifiers such as "enter ctrl+space" and in most
                // cases the modifier key will be pressed before the next key
                //
                // also if you have a sequence such as "ctrl+b a" then pressing the
                // "b" key will trigger a "keypress" and a "keydown"
                //
                // the "keydown" is expected when there is a modifier, but the
                // "keypress" ends up matching the _nextExpectedAction since it occurs
                // after and that causes the sequence to reset
                //
                // we ignore keypresses in a sequence that directly follow a keydown
                // for the same character
                var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;
                if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
                    _resetSequences(doNotReset);
                }
                _ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
            }
            /**
             * handles a keydown event
             *
             * @param {Event} e
             * @returns void
             */
            function _handleKeyEvent(e) {
                // normalize e.which for key events
                // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
                if (typeof e.which !== 'number') {
                    e.which = e.keyCode;
                }
                var character = _characterFromEvent(e);
                // no character found then stop
                if (!character) {
                    return;
                }
                // need to use === for the character check because the character can be 0
                if (e.type == 'keyup' && _ignoreNextKeyup === character) {
                    _ignoreNextKeyup = false;
                    return;
                }
                Mousetrap.handleKey(character, _eventModifiers(e), e);
            }
            /**
             * determines if the keycode specified is a modifier key or not
             *
             * @param {string} key
             * @returns {boolean}
             */
            function _isModifier(key) {
                return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
            }
            /**
             * called to set a 1 second timeout on the specified sequence
             *
             * this is so after each key press in the sequence you have 1 second
             * to press the next key before you have to start over
             *
             * @returns void
             */
            function _resetSequenceTimer() {
                clearTimeout(_resetTimer);
                _resetTimer = setTimeout(_resetSequences, 1000);
            }
            /**
             * reverses the map lookup so that we can look for specific keys
             * to see what can and can't use keypress
             *
             * @return {Object}
             */
            function _getReverseMap() {
                if (!_REVERSE_MAP) {
                    _REVERSE_MAP = {};
                    for (var key in _MAP) {
                        // pull out the numeric keypad from here cause keypress should
                        // be able to detect the keys from the character
                        if (key > 95 && key < 112) {
                            continue;
                        }
                        if (_MAP.hasOwnProperty(key)) {
                            _REVERSE_MAP[_MAP[key]] = key;
                        }
                    }
                }
                return _REVERSE_MAP;
            }
            /**
             * picks the best action based on the key combination
             *
             * @param {string} key - character for key
             * @param {Array} modifiers
             * @param {string=} action passed in
             */
            function _pickBestAction(key, modifiers, action) {
                // if no action was picked in we should try to pick the one
                // that we think would work best for this key
                if (!action) {
                    action = _getReverseMap()[key] ? 'keydown' : 'keypress';
                }
                // modifier keys don't work as expected with keypress,
                // switch to keydown
                if (action == 'keypress' && modifiers.length) {
                    action = 'keydown';
                }
                return action;
            }
            /**
             * binds a key sequence to an event
             *
             * @param {string} combo - combo specified in bind call
             * @param {Array} keys
             * @param {Function} callback
             * @param {string=} action
             * @returns void
             */
            function _bindSequence(combo, keys, callback, action) {
                // start off by adding a sequence level record for this combination
                // and setting the level to 0
                _sequenceLevels[combo] = 0;
                /**
                 * callback to increase the sequence level for this sequence and reset
                 * all other sequences that were active
                 *
                 * @param {string} nextAction
                 * @returns {Function}
                 */
                function _increaseSequence(nextAction) {
                    return function () {
                        _nextExpectedAction = nextAction;
                        ++_sequenceLevels[combo];
                        _resetSequenceTimer();
                    };
                }
                /**
                 * wraps the specified callback inside of another function in order
                 * to reset all sequence counters as soon as this sequence is done
                 *
                 * @param {Event} e
                 * @returns void
                 */
                function _callbackAndReset(e) {
                    _fireCallback(callback, e, combo);
                    // we should ignore the next key up if the action is key down
                    // or keypress.  this is so if you finish a sequence and
                    // release the key the final key will not trigger a keyup
                    if (action !== 'keyup') {
                        _ignoreNextKeyup = _characterFromEvent(e);
                    }
                    // weird race condition if a sequence ends with the key
                    // another sequence begins with
                    setTimeout(_resetSequences, 10);
                }
                // loop through keys one at a time and bind the appropriate callback
                // function.  for any key leading up to the final one it should
                // increase the sequence. after the final, it should reset all sequences
                //
                // if an action is specified in the original bind call then that will
                // be used throughout.  otherwise we will pass the action that the
                // next key in the sequence should match.  this allows a sequence
                // to mix and match keypress and keydown events depending on which
                // ones are better suited to the key provided
                for (var i = 0; i < keys.length; ++i) {
                    var isFinal = i + 1 === keys.length;
                    var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
                    _bindSingle(keys[i], wrappedCallback, action, combo, i);
                }
            }
            /**
             * Converts from a string key combination to an array
             *
             * @param  {string} combination like "command+shift+l"
             * @return {Array}
             */
            function _keysFromString(combination) {
                if (combination === '+') {
                    return ['+'];
                }
                return combination.split('+');
            }
            /**
             * Gets info for a specific key combination
             *
             * @param  {string} combination key combination ("command+s" or "a" or "*")
             * @param  {string=} action
             * @returns {Object}
             */
            function _getKeyInfo(combination, action) {
                var keys, key, i, modifiers = [];
                // take the keys from this pattern and figure out what the actual
                // pattern is all about
                keys = _keysFromString(combination);
                for (i = 0; i < keys.length; ++i) {
                    key = keys[i];
                    // normalize key names
                    if (_SPECIAL_ALIASES[key]) {
                        key = _SPECIAL_ALIASES[key];
                    }
                    // if this is not a keypress event then we should
                    // be smart about using shift keys
                    // this will only work for US keyboards however
                    if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                        key = _SHIFT_MAP[key];
                        modifiers.push('shift');
                    }
                    // if this key is a modifier then add it to the list of modifiers
                    if (_isModifier(key)) {
                        modifiers.push(key);
                    }
                }
                // depending on what the key combination is
                // we will try to pick the best event for it
                action = _pickBestAction(key, modifiers, action);
                return {
                    key: key,
                    modifiers: modifiers,
                    action: action
                };
            }
            /**
             * binds a single keyboard combination
             *
             * @param {string} combination
             * @param {Function} callback
             * @param {string=} action
             * @param {string=} sequenceName - name of sequence if part of sequence
             * @param {number=} level - what part of the sequence the command is
             * @returns void
             */
            function _bindSingle(combination, callback, action, sequenceName, level) {
                // store a direct mapped reference for use with Mousetrap.trigger
                _directMap[combination + ':' + action] = callback;
                // make sure multiple spaces in a row become a single space
                combination = combination.replace(/\s+/g, ' ');
                var sequence = combination.split(' '), info;
                // if this pattern is a sequence of keys then run through this method
                // to reprocess each pattern one key at a time
                if (sequence.length > 1) {
                    _bindSequence(combination, sequence, callback, action);
                    return;
                }
                info = _getKeyInfo(combination, action);
                // make sure to initialize array if this is the first time
                // a callback is added for this key
                _callbacks[info.key] = _callbacks[info.key] || [];
                // remove an existing match if there is one
                _getMatches(info.key, info.modifiers, { type: info.action }, sequenceName, combination, level);
                // add this call back to the array
                // if it is a sequence put it at the beginning
                // if not put it at the end
                //
                // this is important because the way these are processed expects
                // the sequence ones to come first
                _callbacks[info.key][sequenceName ? 'unshift' : 'push']({
                    callback: callback,
                    modifiers: info.modifiers,
                    action: info.action,
                    seq: sequenceName,
                    level: level,
                    combo: combination
                });
            }
            /**
             * binds multiple combinations to the same callback
             *
             * @param {Array} combinations
             * @param {Function} callback
             * @param {string|undefined} action
             * @returns void
             */
            function _bindMultiple(combinations, callback, action) {
                for (var i = 0; i < combinations.length; ++i) {
                    _bindSingle(combinations[i], callback, action);
                }
            }
            // start!
            _addEvent(document, 'keypress', _handleKeyEvent);
            _addEvent(document, 'keydown', _handleKeyEvent);
            _addEvent(document, 'keyup', _handleKeyEvent);
            var Mousetrap = {
                    /**
                     * binds an event to mousetrap
                     *
                     * can be a single key, a combination of keys separated with +,
                     * an array of keys, or a sequence of keys separated by spaces
                     *
                     * be sure to list the modifier keys first to make sure that the
                     * correct key ends up getting bound (the last key in the pattern)
                     *
                     * @param {string|Array} keys
                     * @param {Function} callback
                     * @param {string=} action - 'keypress', 'keydown', or 'keyup'
                     * @returns void
                     */
                    bind: function (keys, callback, action) {
                        keys = keys instanceof Array ? keys : [keys];
                        _bindMultiple(keys, callback, action);
                        return this;
                    },
                    /**
                     * unbinds an event to mousetrap
                     *
                     * the unbinding sets the callback function of the specified key combo
                     * to an empty function and deletes the corresponding key in the
                     * _directMap dict.
                     *
                     * TODO: actually remove this from the _callbacks dictionary instead
                     * of binding an empty function
                     *
                     * the keycombo+action has to be exactly the same as
                     * it was defined in the bind method
                     *
                     * @param {string|Array} keys
                     * @param {string} action
                     * @returns void
                     */
                    unbind: function (keys, action) {
                        return Mousetrap.bind(keys, function () {
                        }, action);
                    },
                    /**
                     * triggers an event that has already been bound
                     *
                     * @param {string} keys
                     * @param {string=} action
                     * @returns void
                     */
                    trigger: function (keys, action) {
                        if (_directMap[keys + ':' + action]) {
                            _directMap[keys + ':' + action]({}, keys);
                        }
                        return this;
                    },
                    /**
                     * resets the library back to its initial state.  this is useful
                     * if you want to clear out the current keyboard shortcuts and bind
                     * new ones - for example if you switch to another page
                     *
                     * @returns void
                     */
                    reset: function () {
                        _callbacks = {};
                        _directMap = {};
                        return this;
                    },
                    /**
                    * should we stop this event before firing off callbacks
                    *
                    * @param {Event} e
                    * @param {Element} element
                    * @return {boolean}
                    */
                    stopCallback: function (e, element) {
                        // if the element has the class "mousetrap" then no need to stop
                        if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
                            return false;
                        }
                        // stop for input, select, and textarea
                        return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
                    },
                    /**
                     * exposes _handleKey publicly so it can be overwritten by extensions
                     */
                    handleKey: _handleKey
                };
            // expose mousetrap to the global object
            // expose mousetrap as an AMD module
            return Mousetrap;
        }(window, document);
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
var libs_pubsub = function () {
        
        var PubSub = {}, messages = {}, lastUid = -1;
        function hasKeys(obj) {
            var key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return true;
                }
            }
            return false;
        }
        /**
        *	Returns a function that throws the passed exception, for use as argument for setTimeout
        *	@param { Object } ex An Error object
        */
        function throwException(ex) {
            return function reThrowException() {
                throw ex;
            };
        }
        function callSubscriberWithDelayedExceptions(subscriber, message, data) {
            try {
                subscriber(message, data);
            } catch (ex) {
                setTimeout(throwException(ex), 0);
            }
        }
        function callSubscriberWithImmediateExceptions(subscriber, message, data) {
            subscriber(message, data);
        }
        function deliverMessage(originalMessage, matchedMessage, data, immediateExceptions) {
            var subscribers = messages[matchedMessage], callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions, s;
            if (!messages.hasOwnProperty(matchedMessage)) {
                return;
            }
            for (s in subscribers) {
                if (subscribers.hasOwnProperty(s)) {
                    callSubscriber(subscribers[s], originalMessage, data);
                }
            }
        }
        function createDeliveryFunction(message, data, immediateExceptions) {
            return function deliverNamespaced() {
                var topic = String(message), position = topic.lastIndexOf('.');
                // deliver the message as it is now
                deliverMessage(message, message, data, immediateExceptions);
                // trim the hierarchy and deliver message to each level
                while (position !== -1) {
                    topic = topic.substr(0, position);
                    position = topic.lastIndexOf('.');
                    deliverMessage(message, topic, data);
                }
            };
        }
        function messageHasSubscribers(message) {
            var topic = String(message), found = Boolean(messages.hasOwnProperty(topic) && hasKeys(messages[topic])), position = topic.lastIndexOf('.');
            while (!found && position !== -1) {
                topic = topic.substr(0, position);
                position = topic.lastIndexOf('.');
                found = Boolean(messages.hasOwnProperty(topic) && hasKeys(messages[topic]));
            }
            return found;
        }
        function publish(message, data, sync, immediateExceptions) {
            var deliver = createDeliveryFunction(message, data, immediateExceptions), hasSubscribers = messageHasSubscribers(message);
            if (!hasSubscribers) {
                return false;
            }
            if (sync === true) {
                deliver();
            } else {
                setTimeout(deliver, 0);
            }
            return true;
        }
        /**
        	 *	PubSub.publish( message[, data] ) -> Boolean
        	 *	- message (String): The message to publish
        	 *	- data: The data to pass to subscribers
        	 *	Publishes the the message, passing the data to it's subscribers
        	**/
        PubSub.publish = function (message, data) {
            return publish(message, data, false, PubSub.immediateExceptions);
        };
        /**
        	 *	PubSub.publishSync( message[, data] ) -> Boolean
        	 *	- message (String): The message to publish
        	 *	- data: The data to pass to subscribers
        	 *	Publishes the the message synchronously, passing the data to it's subscribers
        	**/
        PubSub.publishSync = function (message, data) {
            return publish(message, data, true, PubSub.immediateExceptions);
        };
        /**
        	 *	PubSub.subscribe( message, func ) -> String
        	 *	- message (String): The message to subscribe to
        	 *	- func (Function): The function to call when a new message is published
        	 *	Subscribes the passed function to the passed message. Every returned token is unique and should be stored if
        	 *	you need to unsubscribe
        	**/
        PubSub.subscribe = function (message, func) {
            if (typeof func !== 'function') {
                return false;
            }
            // message is not registered yet
            if (!messages.hasOwnProperty(message)) {
                messages[message] = {};
            }
            // forcing token as String, to allow for future expansions without breaking usage
            // and allow for easy use as key names for the 'messages' object
            var token = 'uid_' + String(++lastUid);
            messages[message][token] = func;
            // return token for unsubscribing
            return token;
        };
        /**
        	 *	PubSub.unsubscribe( tokenOrFunction ) -> String | Boolean
        	 *  - tokenOrFunction (String|Function): The token of the function to unsubscribe or func passed in on subscribe
        	 *  Unsubscribes a specific subscriber from a specific message using the unique token
        	 *  or if using Function as argument, it will remove all subscriptions with that function
        	**/
        PubSub.unsubscribe = function (tokenOrFunction) {
            var isToken = typeof tokenOrFunction === 'string', result = false, m, message, t, token;
            for (m in messages) {
                if (messages.hasOwnProperty(m)) {
                    message = messages[m];
                    if (isToken && message[tokenOrFunction]) {
                        delete message[tokenOrFunction];
                        result = tokenOrFunction;
                        // tokens are unique, so we can just stop here
                        break;
                    } else if (!isToken) {
                        for (t in message) {
                            if (message.hasOwnProperty(t) && message[t] === tokenOrFunction) {
                                delete message[t];
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

var keys_KeyHandler = function (Keys, keyboard, pubsub) {
        var KeyHandler = function () {
        };
        KeyHandler.prototype.init = function () {
            this.attachGenericKeys();
            this.keyHandlers = [];
        };
        KeyHandler.prototype.attachGenericKeys = function () {
            keyboard.bind(Keys, this.emitKey.bind(this), 'keypress');
            keyboard.bind('space', this.emitSpace.bind(this));
            keyboard.bind('backspace', this.emitBackspace.bind(this));
            keyboard.bind('enter', this.emitEnter.bind(this));
            keyboard.bind('up', this.emitUp.bind(this));
            keyboard.bind('down', this.emitDown.bind(this));
            keyboard.bind('left', this.emitLeft.bind(this));
            keyboard.bind('right', this.emitRight.bind(this));
        };
        KeyHandler.prototype.registerKeyHandler = function (cb) {
            this.keyHandlers.push(cb);
        };
        //This should be a map that maps events to functions and such but just typing it out to get my head around everything that is needed
        KeyHandler.prototype.emitKey = function (e) {
            pubsub.publish('keypress.character', String.fromCharCode(e.which));
        };
        KeyHandler.prototype.emitSpace = function (e) {
            pubsub.publish('keypress.spacebar', e);
        };
        KeyHandler.prototype.emitBackspace = function (e) {
            pubsub.publish('keypress.backspace', e);
        };
        KeyHandler.prototype.emitEnter = function (e) {
            pubsub.publish('keypress.enter', e);
        };
        KeyHandler.prototype.emitUp = function (e) {
            pubsub.publish('keypress.up', e);
        };
        KeyHandler.prototype.emitDown = function (e) {
            pubsub.publish('keypress.down', e);
        };
        KeyHandler.prototype.emitLeft = function (e) {
            pubsub.publish('keypress.left', e);
        };
        KeyHandler.prototype.emitRight = function (e) {
            pubsub.publish('keypress.right', e);
        };
        KeyHandler.prototype;
        return KeyHandler;
    }(keys_Keys, libs_keyboard, libs_pubsub);

var events_ClickHandler = function () {
        /*
        Create a ClickHandler binding
        */
        var ClickHandler = function (node, fn) {
            node.addEventListener('click', fn, false);
        };
        return ClickHandler;
    }();

var utils_text_buildCharacterWidths = function () {
        var buildCharacterWidths = function () {
                var _maxWidth = 0, _charWidthArray = {};
                var generateASCIIwidth = function (cssStyle) {
                    var container, divWrapper, charWrapper, testDrive, obj, character, totalWidth = 0, oldTotalWidth = 0, charWidth = 0, _cssStyle = cssStyle || 'font-family: arial; font-size: 12pt';
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
                    charWrapper.appendChild(document.createTextNode('f'));
                    charWrapper.appendChild(testDrive);
                    totalWidth = charWrapper.offsetWidth;
                    // Space char
                    charWrapper.insertBefore(document.createTextNode('\xA0'), testDrive);
                    oldTotalWidth = totalWidth;
                    totalWidth = charWrapper.offsetWidth;
                    charWidth = totalWidth - oldTotalWidth + 0.4;
                    // hack: add 0.4px to every space 
                    _charWidthArray['_\xA0'] = charWidth;
                    // Other ASCII chars
                    for (var i = 33; i <= 126; i++) {
                        character = String.fromCharCode(i);
                        charWrapper.insertBefore(document.createTextNode('' + character + character), testDrive);
                        oldTotalWidth = totalWidth;
                        totalWidth = charWrapper.offsetWidth;
                        charWidth = (totalWidth - oldTotalWidth) / 2;
                        // While cache is generating add two the same chars at once, and then divide per 2 to get better kerning accuracy.
                        _charWidthArray['_' + character] = charWidth;
                        // Finds max width for char - it will be given for every undefined char like: Ą or Ć
                        if (_maxWidth < _charWidthArray['_' + character]) {
                            _maxWidth = _charWidthArray['_' + character];
                        }
                    }
                    document.body.removeChild(divWrapper);
                };
                generateASCIIwidth();
                var getCharacterWidth = function (character) {
                    // If there is a char in cache
                    if (!!_charWidthArray['_' + character]) {
                        return _charWidthArray['_' + character];
                    } else {
                        _charWidthArray['_' + character] = _maxWidth;
                        return _maxWidth;
                    }
                };
                return { getCharacterWidth: getCharacterWidth };
            }();
        return buildCharacterWidths;
    }();

var coords_getOffsetFromClick = function (buildCharacterWidths) {
        var getOffsetFromClick = function (text, offset) {
            var currentOffset = 0, characterWidth = 0, offsetX = 0, clickedCharacter = 0;
            text.split('').forEach(function (character, iterator) {
                characterWidth = buildCharacterWidths.getCharacterWidth(character);
                if (currentOffset + characterWidth < offset.x) {
                    currentOffset += characterWidth;
                    offsetX = currentOffset + characterWidth;
                    clickedCharacter = iterator;
                }
            });
            return {
                offsetX: offsetX,
                clickedCharacter: clickedCharacter
            };
        };
        return getOffsetFromClick;
    }(utils_text_buildCharacterWidths);

var utils_text_insertCharacter = function () {
        var insertCharacter = function (str, idx, istr) {
            return str.substr(0, idx) + istr + str.substr(idx);
        };
        return insertCharacter;
    }();

/*
	Line

	Will create a new line at a specified area. If it is beyond the length of the current lines then it will be created at the end.
*/
var lines_Line = function (ClickHandler, getOffsetFromClick, pubsub, insertCharacter) {
        var Line = function (linePosition) {
            this.linePosition = linePosition;
            this.node = document.createElement('div');
            this.innerLine = document.createElement('div');
            this.innerLine.classList.add('nonrte-line-inner');
            this.node.classList.add('nonrte-line');
            this.textNode = document.createTextNode('');
            this.node.appendChild(this.innerLine);
            this.innerLine.appendChild(this.textNode);
            this.lineSegmentData = [{
                    text: '',
                    wrappers: []
                }];
            ClickHandler(this.innerLine, this.lineClickHandle.bind(this));
            return this;
        };
        Line.prototype.getNode = function () {
            return this.node;
        };
        Line.prototype.getTextNode = function () {
            return this.textNode;
        };
        Line.prototype.getLineNode = function () {
            return this.innerLine;
        };
        Line.prototype.dataLength = function () {
            return this.textNode.data.length;
        };
        Line.prototype.setLineData = function (textData) {
            this.textNode.data = textData;
        };
        Line.prototype.setLineHtml = function (html) {
            this.getLineNode().innerHTML = html;
        };
        Line.prototype.insertCharacter = function (character, position) {
            debugger;
            var op = {}, lineOffset = 0, insertAtIndex = insertCharacter;
            if (this.lineSegmentData.length == 0) {
                op.text = character;
                op.wrappers = [];
            } else {
                this.lineSegmentData.forEach(function (lineSegment) {
                    var offset = lineSegment.text.length, insert;
                    if (offset + lineOffset >= position) {
                        insert = position - lineOffset;
                        lineSegment.text = insertAtIndex(lineSegment.text, insert, character);
                    }
                    lineOffset += offset;
                });
            }
        };
        Line.prototype.getLineData = function () {
            return this.textNode.data;
        };
        Line.prototype.getLineDataSegments = function () {
            return this.lineSegmentData;
        };
        //THIS IS REALLY BAD AND PROBABLY SHOULDNT BE IN EXISTENCE
        Line.prototype.getPosition = function () {
            return this.linePosition;
        };
        Line.prototype.getLineHeight = function (characterPosition) {
            //In the future we need to adjust based upon what character the cursor is next to
            return this.innerLine.clientHeight;
        };
        Line.prototype.lineClickHandle = function (e) {
            var offset = getOffsetFromClick(this.textNode.data, {
                    x: e.offsetX,
                    y: e.offsetY
                });
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
            pubsub.publish('lineClick', message);
        };
        return Line;
    }(events_ClickHandler, coords_getOffsetFromClick, libs_pubsub, utils_text_insertCharacter);

var lines_LineHandler = function (Line) {
        var LineHandler = function (el) {
            this.el = el;
            this.lines = [];
        };
        LineHandler.prototype.createLine = function (position) {
            var isFirstLine = this.lines.length, addAsLastLine = this.lines.length === position;
            var line = new Line(this.lines.length);
            if (position) {
                this.lines.splice(position, 0, line);
            } else {
                this.lines.push(line);
            }
            if (isFirstLine === 0 || addAsLastLine) {
                this.el.appendChild(line.getNode());
            } else {
                this.el.insertBefore(line.getNode(), this.getLine(position + 1).getNode());
            }
            return line;
        };
        LineHandler.prototype.getLine = function (lineIndex) {
            return this.lines[lineIndex];
        };
        LineHandler.prototype.getLines = function () {
            return this.lines;
        };
        LineHandler.prototype.linesLength = function () {
            return this.lines.length;
        };
        return LineHandler;
    }(lines_Line);

var cursor_Cursor = function (buildCharacterWidths) {
        var cursorClasses = {
                standard: 'nonrte-cursor',
                focus: 'blink',
                hidden: 'hidden'
            };
        var Cursor = function () {
            this.cursorNode = document.createElement('div');
            this.cursorNode.classList.add(cursorClasses.standard);
            this.cursorNode.classList.add(cursorClasses.focus);
        };
        Cursor.prototype.positionOnLine = function (line, characterPosition) {
            line.getNode().appendChild(this.cursorNode);
            if (typeof characterPosition === 'number') {
                this.moveToCharacterPosition(line, characterPosition);
            }
        };
        Cursor.prototype.position = function (x) {
            this.cursorNode.style.left = x + 'px';
        };
        Cursor.prototype.moveToCharacterPosition = function (line, characterPosition) {
            var text = line.getTextNode().data.split(''), offset = 0;
            text.forEach(function (character, iterator) {
                if (iterator < characterPosition) {
                    offset += buildCharacterWidths.getCharacterWidth(character);
                }
            });
            this.position(offset);
        };
        Cursor.prototype.setHeight = function (height) {
            this.cursorNode.style.height = height + 'px';
        };
        Cursor.prototype.hide = function () {
            this.cursorNode.classList.add('hidden');
        };
        Cursor.prototype.show = function () {
            this.cursorNode.classList.remove('hidden');
        };
        return Cursor;
    }(utils_text_buildCharacterWidths);

var NonRTE_init_init = function (buildCharacterWidths) {
        var init = function () {
        };
        return init;
    }(utils_text_buildCharacterWidths);

/*
	Data is the top most level of tracking data changes.
	It will have a representation of everything in the DOM in a structure format
	It will be queryable, and when modified will update the DOM
	It is the heart of the app. It's like Ractive but for just RTE
 */
var data_Data = function (pubsub) {
        var Data = function (lineHandler) {
            this.lineHandler = lineHandler;
        };
        Data.prototype.set = function () {
        };
        Data.prototype.addCharacterToLineEnd = function (line, character) {
        };
        Data.prototype.addCharacterToPositionOnLine = function (line, position, character) {
        };
        Data.prototype.export = function () {
        };
        return Data;
    }(libs_pubsub);

var events_SelectHandler = function () {
        var wrapEvent = function (fn) {
            return fn;
        };
        var SelectionHandler = function (node, fn) {
            this.fn = fn;
            this.node = node;
            this.fnMouseMove = wrapEvent(this.handleMouseMove.bind(this));
            this.fnMouseEnd = wrapEvent(this.handleMouseUp.bind(this));
            node.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
        };
        SelectionHandler.prototype.handleMouseDown = function (e) {
            e.preventDefault();
            this.fn('selectionstart', e);
            this.node.addEventListener('mousemove', this.fnMouseMove, false);
            this.node.addEventListener('mouseup', this.fnMouseEnd, false);
        };
        SelectionHandler.prototype.handleMouseUp = function (e) {
            e.preventDefault();
            this.fn('selectionend', e);
            this.node.removeEventListener('mousemove', this.fnMouseMove, false);
            this.node.removeEventListener('mouseup', this.fnMouseEnd, false);
        };
        SelectionHandler.prototype.handleMouseMove = function (e) {
            e.preventDefault();
            this.fn('selectionchange', e);
        };
        return SelectionHandler;
    }();

var range_Range = function () {
        var Range = function (line, from, to) {
            this.line = line;
            this.from = from;
            this.to = to;
        };
        return Range;
    }();

var selection_Selection = function (Range, getOffsetFromClick) {
        //Range could be a single character, an entire line.
        var drawSelectionForRange = function (Range) {
        };
        var Selection = function (lineHandler, offset) {
        };
        Selection.prototype.getLineFromOffset = function (offset) {
            var lines = this.lineHandler.getLines();
        };
        Selection.prototype.getRangeOnLine = function (line, startOffset, endOffset) {
        };
        Selection.prototype.highlight = function () {
            this.selectionRange.forEach(function (Range) {
            });
        };
        return Selection;
    }(range_Range, coords_getOffsetFromClick);    //Selections need to create DOM elements on each line
                                                  //The DOM element varys in length from X character to Y 

;
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */
var libs_marked_lib_marked = function () {
        var markAMD = function () {
                /**
                 * Block-Level Grammar
                 */
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
                block.item = replace(block.item, 'gm')(/bull/g, block.bullet)();
                block.list = replace(block.list)(/bull/g, block.bullet)('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')('def', '\\n+(?=' + block.def.source + ')')();
                block.blockquote = replace(block.blockquote)('def', block.def)();
                block._tag = '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code' + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo' + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';
                block.html = replace(block.html)('comment', /<!--[\s\S]*?-->/)('closed', /<(tag)[\s\S]+?<\/\1>/)('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g, block._tag)();
                block.paragraph = replace(block.paragraph)('hr', block.hr)('heading', block.heading)('lheading', block.lheading)('blockquote', block.blockquote)('tag', '<' + block._tag)('def', block.def)();
                /**
                 * Normal Block Grammar
                 */
                block.normal = merge({}, block);
                /**
                 * GFM Block Grammar
                 */
                block.gfm = merge({}, block.normal, {
                    fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
                    paragraph: /^/
                });
                block.gfm.paragraph = replace(block.paragraph)('(?!', '(?!' + block.gfm.fences.source.replace('\\1', '\\2') + '|' + block.list.source.replace('\\1', '\\3') + '|')();
                /**
                 * GFM + Tables Block Grammar
                 */
                block.tables = merge({}, block.gfm, {
                    nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
                    table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
                });
                /**
                 * Block Lexer
                 */
                function Lexer(options) {
                    this.tokens = [];
                    this.tokens.links = {};
                    this.options = options || marked.defaults;
                    this.rules = block.normal;
                    if (this.options.gfm) {
                        if (this.options.tables) {
                            this.rules = block.tables;
                        } else {
                            this.rules = block.gfm;
                        }
                    }
                }
                /**
                 * Expose Block Rules
                 */
                Lexer.rules = block;
                /**
                 * Static Lex Method
                 */
                Lexer.lex = function (src, options) {
                    var lexer = new Lexer(options);
                    return lexer.lex(src);
                };
                /**
                 * Preprocessing
                 */
                Lexer.prototype.lex = function (src) {
                    src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ').replace(/\u00a0/g, ' ').replace(/\u2424/g, '\n');
                    return this.token(src, true);
                };
                /**
                 * Lexing
                 */
                Lexer.prototype.token = function (src, top, bq) {
                    var src = src.replace(/^ +$/gm, ''), next, loose, cap, bull, b, item, space, i, l;
                    while (src) {
                        // newline
                        if (cap = this.rules.newline.exec(src)) {
                            src = src.substring(cap[0].length);
                            if (cap[0].length > 1) {
                                this.tokens.push({ type: 'space' });
                            }
                        }
                        // code
                        if (cap = this.rules.code.exec(src)) {
                            src = src.substring(cap[0].length);
                            cap = cap[0].replace(/^ {4}/gm, '');
                            this.tokens.push({
                                type: 'code',
                                text: !this.options.pedantic ? cap.replace(/\n+$/, '') : cap
                            });
                            continue;
                        }
                        // fences (gfm)
                        if (cap = this.rules.fences.exec(src)) {
                            src = src.substring(cap[0].length);
                            this.tokens.push({
                                type: 'code',
                                lang: cap[2],
                                text: cap[3]
                            });
                            continue;
                        }
                        // heading
                        if (cap = this.rules.heading.exec(src)) {
                            src = src.substring(cap[0].length);
                            this.tokens.push({
                                type: 'heading',
                                depth: cap[1].length,
                                text: cap[2]
                            });
                            continue;
                        }
                        // table no leading pipe (gfm)
                        if (top && (cap = this.rules.nptable.exec(src))) {
                            src = src.substring(cap[0].length);
                            item = {
                                type: 'table',
                                header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                                align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                                cells: cap[3].replace(/\n$/, '').split('\n')
                            };
                            for (i = 0; i < item.align.length; i++) {
                                if (/^ *-+: *$/.test(item.align[i])) {
                                    item.align[i] = 'right';
                                } else if (/^ *:-+: *$/.test(item.align[i])) {
                                    item.align[i] = 'center';
                                } else if (/^ *:-+ *$/.test(item.align[i])) {
                                    item.align[i] = 'left';
                                } else {
                                    item.align[i] = null;
                                }
                            }
                            for (i = 0; i < item.cells.length; i++) {
                                item.cells[i] = item.cells[i].split(/ *\| */);
                            }
                            this.tokens.push(item);
                            continue;
                        }
                        // lheading
                        if (cap = this.rules.lheading.exec(src)) {
                            src = src.substring(cap[0].length);
                            this.tokens.push({
                                type: 'heading',
                                depth: cap[2] === '=' ? 1 : 2,
                                text: cap[1]
                            });
                            continue;
                        }
                        // hr
                        if (cap = this.rules.hr.exec(src)) {
                            src = src.substring(cap[0].length);
                            this.tokens.push({ type: 'hr' });
                            continue;
                        }
                        // blockquote
                        if (cap = this.rules.blockquote.exec(src)) {
                            src = src.substring(cap[0].length);
                            this.tokens.push({ type: 'blockquote_start' });
                            cap = cap[0].replace(/^ *> ?/gm, '');
                            // Pass `top` to keep the current
                            // "toplevel" state. This is exactly
                            // how markdown.pl works.
                            this.token(cap, top, true);
                            this.tokens.push({ type: 'blockquote_end' });
                            continue;
                        }
                        // list
                        if (cap = this.rules.list.exec(src)) {
                            src = src.substring(cap[0].length);
                            bull = cap[2];
                            this.tokens.push({
                                type: 'list_start',
                                ordered: bull.length > 1
                            });
                            // Get each top-level item.
                            cap = cap[0].match(this.rules.item);
                            next = false;
                            l = cap.length;
                            i = 0;
                            for (; i < l; i++) {
                                item = cap[i];
                                // Remove the list item's bullet
                                // so it is seen as the next token.
                                space = item.length;
                                item = item.replace(/^ *([*+-]|\d+\.) +/, '');
                                // Outdent whatever the
                                // list item contains. Hacky.
                                if (~item.indexOf('\n ')) {
                                    space -= item.length;
                                    item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
                                }
                                // Determine whether the next list item belongs here.
                                // Backpedal if it does not belong in this list.
                                if (this.options.smartLists && i !== l - 1) {
                                    b = block.bullet.exec(cap[i + 1])[0];
                                    if (bull !== b && !(bull.length > 1 && b.length > 1)) {
                                        src = cap.slice(i + 1).join('\n') + src;
                                        i = l - 1;
                                    }
                                }
                                // Determine whether item is loose or not.
                                // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
                                // for discount behavior.
                                loose = next || /\n\n(?!\s*$)/.test(item);
                                if (i !== l - 1) {
                                    next = item.charAt(item.length - 1) === '\n';
                                    if (!loose)
                                        loose = next;
                                }
                                this.tokens.push({ type: loose ? 'loose_item_start' : 'list_item_start' });
                                // Recurse.
                                this.token(item, false, bq);
                                this.tokens.push({ type: 'list_item_end' });
                            }
                            this.tokens.push({ type: 'list_end' });
                            continue;
                        }
                        // html
                        if (cap = this.rules.html.exec(src)) {
                            src = src.substring(cap[0].length);
                            this.tokens.push({
                                type: this.options.sanitize ? 'paragraph' : 'html',
                                pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
                                text: cap[0]
                            });
                            continue;
                        }
                        // def
                        if (!bq && top && (cap = this.rules.def.exec(src))) {
                            src = src.substring(cap[0].length);
                            this.tokens.links[cap[1].toLowerCase()] = {
                                href: cap[2],
                                title: cap[3]
                            };
                            continue;
                        }
                        // table (gfm)
                        if (top && (cap = this.rules.table.exec(src))) {
                            src = src.substring(cap[0].length);
                            item = {
                                type: 'table',
                                header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                                align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                                cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
                            };
                            for (i = 0; i < item.align.length; i++) {
                                if (/^ *-+: *$/.test(item.align[i])) {
                                    item.align[i] = 'right';
                                } else if (/^ *:-+: *$/.test(item.align[i])) {
                                    item.align[i] = 'center';
                                } else if (/^ *:-+ *$/.test(item.align[i])) {
                                    item.align[i] = 'left';
                                } else {
                                    item.align[i] = null;
                                }
                            }
                            for (i = 0; i < item.cells.length; i++) {
                                item.cells[i] = item.cells[i].replace(/^ *\| *| *\| *$/g, '').split(/ *\| */);
                            }
                            this.tokens.push(item);
                            continue;
                        }
                        // top-level paragraph
                        if (top && (cap = this.rules.paragraph.exec(src))) {
                            src = src.substring(cap[0].length);
                            this.tokens.push({
                                type: 'paragraph',
                                text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
                            });
                            continue;
                        }
                        // text
                        if (cap = this.rules.text.exec(src)) {
                            // Top-level should never reach here.
                            src = src.substring(cap[0].length);
                            this.tokens.push({
                                type: 'text',
                                text: cap[0]
                            });
                            continue;
                        }
                        if (src) {
                            throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
                        }
                    }
                    return this.tokens;
                };
                /**
                 * Inline-Level Grammar
                 */
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
                        text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
                    };
                inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
                inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;
                inline.link = replace(inline.link)('inside', inline._inside)('href', inline._href)();
                inline.reflink = replace(inline.reflink)('inside', inline._inside)();
                /**
                 * Normal Inline Grammar
                 */
                inline.normal = merge({}, inline);
                /**
                 * Pedantic Inline Grammar
                 */
                inline.pedantic = merge({}, inline.normal, {
                    strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
                    em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
                });
                /**
                 * GFM Inline Grammar
                 */
                inline.gfm = merge({}, inline.normal, {
                    escape: replace(inline.escape)('])', '~|])')(),
                    url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
                    del: /^~~(?=\S)([\s\S]*?\S)~~/,
                    text: replace(inline.text)(']|', '~]|')('|', '|https?://|')()
                });
                /**
                 * GFM + Line Breaks Inline Grammar
                 */
                inline.breaks = merge({}, inline.gfm, {
                    br: replace(inline.br)('{2,}', '*')(),
                    text: replace(inline.gfm.text)('{2,}', '*')()
                });
                /**
                 * Inline Lexer & Compiler
                 */
                function InlineLexer(links, options) {
                    this.options = options || marked.defaults;
                    this.links = links;
                    this.rules = inline.normal;
                    this.renderer = this.options.renderer || new Renderer();
                    this.renderer.options = this.options;
                    if (!this.links) {
                        throw new Error('Tokens array requires a `links` property.');
                    }
                    if (this.options.gfm) {
                        if (this.options.breaks) {
                            this.rules = inline.breaks;
                        } else {
                            this.rules = inline.gfm;
                        }
                    } else if (this.options.pedantic) {
                        this.rules = inline.pedantic;
                    }
                }
                /**
                 * Expose Inline Rules
                 */
                InlineLexer.rules = inline;
                /**
                 * Static Lexing/Compiling Method
                 */
                InlineLexer.output = function (src, links, options) {
                    var inline = new InlineLexer(links, options);
                    return inline.output(src);
                };
                /**
                 * Lexing/Compiling
                 */
                InlineLexer.prototype.output = function (src) {
                    var out = '', link, text, href, cap;
                    while (src) {
                        // escape
                        if (cap = this.rules.escape.exec(src)) {
                            src = src.substring(cap[0].length);
                            out += cap[1];
                            continue;
                        }
                        // autolink
                        if (cap = this.rules.autolink.exec(src)) {
                            src = src.substring(cap[0].length);
                            if (cap[2] === '@') {
                                text = cap[1].charAt(6) === ':' ? this.mangle(cap[1].substring(7)) : this.mangle(cap[1]);
                                href = this.mangle('mailto:') + text;
                            } else {
                                text = escape(cap[1]);
                                href = text;
                            }
                            out += this.renderer.link(href, null, text);
                            continue;
                        }
                        // url (gfm)
                        if (!this.inLink && (cap = this.rules.url.exec(src))) {
                            src = src.substring(cap[0].length);
                            text = escape(cap[1]);
                            href = text;
                            out += this.renderer.link(href, null, text);
                            continue;
                        }
                        // tag
                        if (cap = this.rules.tag.exec(src)) {
                            if (!this.inLink && /^<a /i.test(cap[0])) {
                                this.inLink = true;
                            } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
                                this.inLink = false;
                            }
                            src = src.substring(cap[0].length);
                            out += this.options.sanitize ? escape(cap[0]) : cap[0];
                            continue;
                        }
                        // link
                        if (cap = this.rules.link.exec(src)) {
                            src = src.substring(cap[0].length);
                            this.inLink = true;
                            out += this.outputLink(cap, {
                                href: cap[2],
                                title: cap[3]
                            });
                            this.inLink = false;
                            continue;
                        }
                        // reflink, nolink
                        if ((cap = this.rules.reflink.exec(src)) || (cap = this.rules.nolink.exec(src))) {
                            src = src.substring(cap[0].length);
                            link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
                            link = this.links[link.toLowerCase()];
                            if (!link || !link.href) {
                                out += cap[0].charAt(0);
                                src = cap[0].substring(1) + src;
                                continue;
                            }
                            this.inLink = true;
                            out += this.outputLink(cap, link);
                            this.inLink = false;
                            continue;
                        }
                        // strong
                        if (cap = this.rules.strong.exec(src)) {
                            src = src.substring(cap[0].length);
                            out += this.renderer.strong(this.output(cap[2] || cap[1]));
                            continue;
                        }
                        // em
                        if (cap = this.rules.em.exec(src)) {
                            src = src.substring(cap[0].length);
                            out += this.renderer.em(this.output(cap[2] || cap[1]));
                            continue;
                        }
                        // code
                        if (cap = this.rules.code.exec(src)) {
                            src = src.substring(cap[0].length);
                            out += this.renderer.codespan(escape(cap[2], true));
                            continue;
                        }
                        // br
                        if (cap = this.rules.br.exec(src)) {
                            src = src.substring(cap[0].length);
                            out += this.renderer.br();
                            continue;
                        }
                        // del (gfm)
                        if (cap = this.rules.del.exec(src)) {
                            src = src.substring(cap[0].length);
                            out += this.renderer.del(this.output(cap[1]));
                            continue;
                        }
                        // text
                        if (cap = this.rules.text.exec(src)) {
                            src = src.substring(cap[0].length);
                            out += escape(this.smartypants(cap[0]));
                            continue;
                        }
                        if (src) {
                            throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
                        }
                    }
                    return out;
                };
                /**
                 * Compile Link
                 */
                InlineLexer.prototype.outputLink = function (cap, link) {
                    var href = escape(link.href), title = link.title ? escape(link.title) : null;
                    return cap[0].charAt(0) !== '!' ? this.renderer.link(href, title, this.output(cap[1])) : this.renderer.image(href, title, escape(cap[1]));
                };
                /**
                 * Smartypants Transformations
                 */
                InlineLexer.prototype.smartypants = function (text) {
                    if (!this.options.smartypants)
                        return text;
                    return text.replace(/--/g, '\u2014').replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018').replace(/'/g, '\u2019').replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201C').replace(/"/g, '\u201D').replace(/\.{3}/g, '\u2026');
                };
                /**
                 * Mangle Links
                 */
                InlineLexer.prototype.mangle = function (text) {
                    var out = '', l = text.length, i = 0, ch;
                    for (; i < l; i++) {
                        ch = text.charCodeAt(i);
                        if (Math.random() > 0.5) {
                            ch = 'x' + ch.toString(16);
                        }
                        out += '&#' + ch + ';';
                    }
                    return out;
                };
                /**
                 * Renderer
                 */
                function Renderer(options) {
                    this.options = options || {};
                }
                Renderer.prototype.code = function (code, lang, escaped) {
                    if (this.options.highlight) {
                        var out = this.options.highlight(code, lang);
                        if (out != null && out !== code) {
                            escaped = true;
                            code = out;
                        }
                    }
                    if (!lang) {
                        return '<pre><code>' + (escaped ? code : escape(code, true)) + '\n</code></pre>';
                    }
                    return '<pre><code class="' + this.options.langPrefix + escape(lang, true) + '">' + (escaped ? code : escape(code, true)) + '\n</code></pre>\n';
                };
                Renderer.prototype.blockquote = function (quote) {
                    return '<blockquote>\n' + quote + '</blockquote>\n';
                };
                Renderer.prototype.html = function (html) {
                    return html;
                };
                Renderer.prototype.heading = function (text, level, raw) {
                    return '<h' + level + ' id="' + this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-') + '">' + text + '</h' + level + '>\n';
                };
                Renderer.prototype.hr = function () {
                    return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
                };
                Renderer.prototype.list = function (body, ordered) {
                    var type = ordered ? 'ol' : 'ul';
                    return '<' + type + '>\n' + body + '</' + type + '>\n';
                };
                Renderer.prototype.listitem = function (text) {
                    return '<li>' + text + '</li>\n';
                };
                Renderer.prototype.paragraph = function (text) {
                    return '<p>' + text + '</p>\n';
                };
                Renderer.prototype.table = function (header, body) {
                    return '<table>\n' + '<thead>\n' + header + '</thead>\n' + '<tbody>\n' + body + '</tbody>\n' + '</table>\n';
                };
                Renderer.prototype.tablerow = function (content) {
                    return '<tr>\n' + content + '</tr>\n';
                };
                Renderer.prototype.tablecell = function (content, flags) {
                    var type = flags.header ? 'th' : 'td';
                    var tag = flags.align ? '<' + type + ' style="text-align:' + flags.align + '">' : '<' + type + '>';
                    return tag + content + '</' + type + '>\n';
                };
                // span level renderer
                Renderer.prototype.strong = function (text) {
                    return '<strong>' + text + '</strong>';
                };
                Renderer.prototype.em = function (text) {
                    return '<em>' + text + '</em>';
                };
                Renderer.prototype.codespan = function (text) {
                    return '<code>' + text + '</code>';
                };
                Renderer.prototype.br = function () {
                    return this.options.xhtml ? '<br/>' : '<br>';
                };
                Renderer.prototype.del = function (text) {
                    return '<del>' + text + '</del>';
                };
                Renderer.prototype.link = function (href, title, text) {
                    if (this.options.sanitize) {
                        try {
                            var prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g, '').toLowerCase();
                        } catch (e) {
                            return '';
                        }
                        if (prot.indexOf('javascript:') === 0) {
                            return '';
                        }
                    }
                    var out = '<a href="' + href + '"';
                    if (title) {
                        out += ' title="' + title + '"';
                    }
                    out += '>' + text + '</a>';
                    return out;
                };
                Renderer.prototype.image = function (href, title, text) {
                    var out = '<img src="' + href + '" alt="' + text + '"';
                    if (title) {
                        out += ' title="' + title + '"';
                    }
                    out += this.options.xhtml ? '/>' : '>';
                    return out;
                };
                /**
                 * Parsing & Compiling
                 */
                function Parser(options) {
                    this.tokens = [];
                    this.token = null;
                    this.options = options || marked.defaults;
                    this.options.renderer = this.options.renderer || new Renderer();
                    this.renderer = this.options.renderer;
                    this.renderer.options = this.options;
                }
                /**
                 * Static Parse Method
                 */
                Parser.parse = function (src, options, renderer) {
                    var parser = new Parser(options, renderer);
                    return parser.parse(src);
                };
                /**
                 * Parse Loop
                 */
                Parser.prototype.parse = function (src) {
                    this.inline = new InlineLexer(src.links, this.options, this.renderer);
                    this.tokens = src.reverse();
                    var out = '';
                    while (this.next()) {
                        out += this.tok();
                    }
                    return out;
                };
                /**
                 * Next Token
                 */
                Parser.prototype.next = function () {
                    return this.token = this.tokens.pop();
                };
                /**
                 * Preview Next Token
                 */
                Parser.prototype.peek = function () {
                    return this.tokens[this.tokens.length - 1] || 0;
                };
                /**
                 * Parse Text Tokens
                 */
                Parser.prototype.parseText = function () {
                    var body = this.token.text;
                    while (this.peek().type === 'text') {
                        body += '\n' + this.next().text;
                    }
                    return this.inline.output(body);
                };
                /**
                 * Parse Current Token
                 */
                Parser.prototype.tok = function () {
                    switch (this.token.type) {
                    case 'space': {
                            return '';
                        }
                    case 'hr': {
                            return this.renderer.hr();
                        }
                    case 'heading': {
                            return this.renderer.heading(this.inline.output(this.token.text), this.token.depth, this.token.text);
                        }
                    case 'code': {
                            return this.renderer.code(this.token.text, this.token.lang, this.token.escaped);
                        }
                    case 'table': {
                            var header = '', body = '', i, row, cell, flags, j;
                            // header
                            cell = '';
                            for (i = 0; i < this.token.header.length; i++) {
                                flags = {
                                    header: true,
                                    align: this.token.align[i]
                                };
                                cell += this.renderer.tablecell(this.inline.output(this.token.header[i]), {
                                    header: true,
                                    align: this.token.align[i]
                                });
                            }
                            header += this.renderer.tablerow(cell);
                            for (i = 0; i < this.token.cells.length; i++) {
                                row = this.token.cells[i];
                                cell = '';
                                for (j = 0; j < row.length; j++) {
                                    cell += this.renderer.tablecell(this.inline.output(row[j]), {
                                        header: false,
                                        align: this.token.align[j]
                                    });
                                }
                                body += this.renderer.tablerow(cell);
                            }
                            return this.renderer.table(header, body);
                        }
                    case 'blockquote_start': {
                            var body = '';
                            while (this.next().type !== 'blockquote_end') {
                                body += this.tok();
                            }
                            return this.renderer.blockquote(body);
                        }
                    case 'list_start': {
                            var body = '', ordered = this.token.ordered;
                            while (this.next().type !== 'list_end') {
                                body += this.tok();
                            }
                            return this.renderer.list(body, ordered);
                        }
                    case 'list_item_start': {
                            var body = '';
                            while (this.next().type !== 'list_item_end') {
                                body += this.token.type === 'text' ? this.parseText() : this.tok();
                            }
                            return this.renderer.listitem(body);
                        }
                    case 'loose_item_start': {
                            var body = '';
                            while (this.next().type !== 'list_item_end') {
                                body += this.tok();
                            }
                            return this.renderer.listitem(body);
                        }
                    case 'html': {
                            var html = !this.token.pre && !this.options.pedantic ? this.inline.output(this.token.text) : this.token.text;
                            return this.renderer.html(html);
                        }
                    case 'paragraph': {
                            return this.renderer.paragraph(this.inline.output(this.token.text));
                        }
                    case 'text': {
                            return this.renderer.paragraph(this.parseText());
                        }
                    }
                };
                /**
                 * Helpers
                 */
                function escape(html, encode) {
                    return html.replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                }
                function unescape(html) {
                    return html.replace(/&([#\w]+);/g, function (_, n) {
                        n = n.toLowerCase();
                        if (n === 'colon')
                            return ':';
                        if (n.charAt(0) === '#') {
                            return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
                        }
                        return '';
                    });
                }
                function replace(regex, opt) {
                    regex = regex.source;
                    opt = opt || '';
                    return function self(name, val) {
                        if (!name)
                            return new RegExp(regex, opt);
                        val = val.source || val;
                        val = val.replace(/(^|[^\[])\^/g, '$1');
                        regex = regex.replace(name, val);
                        return self;
                    };
                }
                function noop() {
                }
                noop.exec = noop;
                function merge(obj) {
                    var i = 1, target, key;
                    for (; i < arguments.length; i++) {
                        target = arguments[i];
                        for (key in target) {
                            if (Object.prototype.hasOwnProperty.call(target, key)) {
                                obj[key] = target[key];
                            }
                        }
                    }
                    return obj;
                }
                /**
                 * Marked
                 */
                function marked(src, opt, callback) {
                    if (callback || typeof opt === 'function') {
                        if (!callback) {
                            callback = opt;
                            opt = null;
                        }
                        opt = merge({}, marked.defaults, opt || {});
                        var highlight = opt.highlight, tokens, pending, i = 0;
                        try {
                            tokens = Lexer.lex(src, opt);
                        } catch (e) {
                            return callback(e);
                        }
                        pending = tokens.length;
                        var done = function (err) {
                            if (err) {
                                opt.highlight = highlight;
                                return callback(err);
                            }
                            var out;
                            try {
                                out = Parser.parse(tokens, opt);
                            } catch (e) {
                                err = e;
                            }
                            opt.highlight = highlight;
                            return err ? callback(err) : callback(null, out);
                        };
                        if (!highlight || highlight.length < 3) {
                            return done();
                        }
                        delete opt.highlight;
                        if (!pending)
                            return done();
                        for (; i < tokens.length; i++) {
                            (function (token) {
                                if (token.type !== 'code') {
                                    return --pending || done();
                                }
                                return highlight(token.text, token.lang, function (err, code) {
                                    if (err)
                                        return done(err);
                                    if (code == null || code === token.text) {
                                        return --pending || done();
                                    }
                                    token.text = code;
                                    token.escaped = true;
                                    --pending || done();
                                });
                            }(tokens[i]));
                        }
                        return;
                    }
                    try {
                        if (opt)
                            opt = merge({}, marked.defaults, opt);
                        return Parser.parse(Lexer.lex(src, opt), opt);
                    } catch (e) {
                        e.message += '\nPlease report this to https://github.com/chjj/marked.';
                        if ((opt || marked.defaults).silent) {
                            return '<p>An error occured:</p><pre>' + escape(e.message + '', true) + '</pre>';
                        }
                        throw e;
                    }
                }
                /**
                 * Options
                 */
                marked.options = marked.setOptions = function (opt) {
                    merge(marked.defaults, opt);
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
                /**
                 * Expose
                 */
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

var lines_LineCompiler = function (marked) {
        var LineCompiler = function (Line) {
            var lineSegments = Line.getLineDataSegments(), stringToCompile = '';
            lineSegments.forEach(function (lineSegment) {
                stringToCompile += buildWithWrappers(lineSegment.wrappers, lineSegment.text);
            });
            console.log(marked('__ *dd* __'));
            return marked(stringToCompile);
        };
        function buildWithWrappers(wrappers, text) {
            var stringToWrap = text;
            wrappers.forEach(function (wrapper) {
                stringToWrap = wrapper.start + stringToWrap + wrapper.end;
            });
            return stringToWrap;
        }
        return LineCompiler;
    }(libs_marked_lib_marked);

var NonRTE__NonRTE = function (KeyHandler, LineHandler, Cursor, init, pubsub, Data, SelectHandler, Selection, marked, LineCompiler) {
        var NonRTE = function (element) {
            this.marked = marked;
            this.element = element;
            this.keyhandler = new KeyHandler();
            this.lineHandler = new LineHandler(this.element);
            this.cursor = new Cursor();
            this.selectHandler = new SelectHandler(this.element, this.handleSelect);
            this.data = new Data(this.lineHandler);
            this.focusPosition = {
                line: 0,
                character: 0
            };
            init(this);
            //Create the first line and position the cursor on it
            this.cursor.positionOnLine(this.lineHandler.createLine());
            this.keyhandler.init();
            this.cursor.setHeight(this.lineHandler.getLine(this.focusPosition.line).getLineHeight(this.focusPosition.character));
            pubsub.subscribe('keypress.backspace', function () {
                //Needs to take into account the cursor position
                var focusLine = this.lineHandler.getLine(this.focusPosition.line), textEl = focusLine.getTextNode();
                if (textEl && textEl.length && this.focusPosition.character - 1 >= 0) {
                    this.focusPosition.character--;
                    textEl.deleteData(this.focusPosition.character, 1);
                } else if (textEl && this.focusPosition.line - 1 >= 0) {
                    if (this.focusPosition.line) {
                        this.focusPosition.line--;
                    }
                    focusLine = this.lineHandler.getLine(this.focusPosition.line);
                    this.focusPosition.character = focusLine.getTextNode().data.length;
                }
                this.cursor.positionOnLine(focusLine, this.focusPosition.character);
            }.bind(this));
            pubsub.subscribe('keypress.enter', function () {
                var line = this.lineHandler.createLine(this.focusPosition.line + 1), focusLine = this.lineHandler.getLine(this.focusPosition.line), textData = focusLine.getLineData(), moveData = textData.substring(this.focusPosition.character, textData.length), oldData = textData.substring(0, this.focusPosition.character);
                if (moveData) {
                    line.setLineData(moveData);
                    focusLine.setLineData(oldData);
                }
                this.focusPosition.line += 1;
                this.focusPosition.character = 0;
                this.cursor.positionOnLine(line, this.focusPosition.character);
            }.bind(this));
            pubsub.subscribe('keypress.spacebar', function (subName, e) {
                e.preventDefault();
                pubsub.publish('keypress.character', '\xA0');
            }.bind(this));
            pubsub.subscribe('keypress.character', function (subName, key) {
                var line = this.lineHandler.getLine(this.focusPosition.line), lineNode = line.getLineNode();
                line.insertCharacter(key, this.focusPosition.character);
                line.setLineHtml(LineCompiler(line));
                this.focusPosition.character++;
            }.bind(this));
            pubsub.subscribe('lineClick', function (sub, e) {
                this.focusPosition.character = e.characterOffset.clickedCharacter;
                this.focusPosition.line = e.line.getPosition();
                this.cursor.positionOnLine(e.line, this.focusPosition.character);
            }.bind(this));
            pubsub.subscribe('keypress.left', function (subName, e) {
                if (this.focusPosition.character == 0 && this.focusPosition.line - 1 >= 0) {
                    this.focusPosition.line--;
                    this.focusPosition.character = this.lineHandler.getLine(this.focusPosition.line).dataLength();
                } else if (this.focusPosition.character != 0) {
                    this.focusPosition.character--;
                }
                pubsub.publish('updateCursorPosition');
            }.bind(this));
            pubsub.subscribe('keypress.right', function (subName, e) {
                var focusLine = this.lineHandler.getLine(this.focusPosition.line), focusLength = focusLine.dataLength();
                if (this.focusPosition.character + 1 > focusLine.dataLength() && this.lineHandler.linesLength() < this.focusPosition.line + 1) {
                    this.focusPosition.line++;
                    this.focusPosition.character = 0;
                } else if (this.focusPosition.character + 1 <= focusLine.dataLength()) {
                    this.focusPosition.character++;
                }
                pubsub.publish('updateCursorPosition');
            }.bind(this));
            pubsub.subscribe('keypress.up', function (subName, e) {
                var focusLine = this.lineHandler.getLine(this.focusPosition.line), focusLength = focusLine.dataLength(), prevLine;
                if (this.focusPosition.line - 1 >= 0) {
                    this.focusPosition.line--;
                    prevLine = this.lineHandler.getLine(this.focusPosition.line);
                    if (this.focusPosition.character >= prevLine.dataLength()) {
                        this.focusPosition.character = prevLine.dataLength();
                    }
                }
                pubsub.publish('updateCursorPosition');
            }.bind(this));
            pubsub.subscribe('keypress.down', function (subName, e) {
                e.preventDefault();
                e.stopPropagation();
                var focusLine = this.lineHandler.getLine(this.focusPosition.line), focusLength = focusLine.dataLength(), nextLine;
                if (this.focusPosition.line + 1 < this.lineHandler.linesLength()) {
                    this.focusPosition.line++;
                    nextLine = this.lineHandler.getLine(this.focusPosition.line);
                    if (this.focusPosition.character >= nextLine.dataLength()) {
                        this.focusPosition.character = nextLine.dataLength();
                    }
                }
                pubsub.publish('updateCursorPosition');
            }.bind(this));
            pubsub.subscribe('updateCursorPosition', function () {
                this.cursor.positionOnLine(this.lineHandler.getLine(this.focusPosition.line), this.focusPosition.character);
            }.bind(this));
            pubsub.subscribe('selection', function (subName, e) {
                console.log(e);
            }.bind(this));
        };
        NonRTE.prototype.handleSelect = function (subName, e) {
            var offset = {
                    x: e.offsetX,
                    y: e.offsetY
                };
            if (e.type === 'mousedown') {
                this.currentSelection = new Selection(this.lineHandler, offset);
            } else if (e.type === 'mousemove') {
            } else {
            }
        };
        //CREATE MIXIN HERE
        NonRTE.prototype.registerKey = function (key, fn) {
            this.keyHandler.registerKeyListener(key, fn);
        };
        NonRTE.prototype.registerKeySequence = function () {
        };
        //What the hell kind of name is this
        //This creates a key trigger for a function to be called after a key is pressed until the 'stop()' on the called object is called
        //Mainly a developer thing but might come in handy
        NonRTE.prototype.registerKeyObserveTrigger = function (key, fn) {
            //register keypress
            this.keyHandler.registerKeyListener(key, fn);
            //register it as a observer keypress
            //return an event with various positioning, range, and info
            //This method should provide original line + position and current line + position, if deletions happened etc to help the dev figure out what they need to do
            return {
                stop: function () {
                }
            };
        };
        return NonRTE;
    }(keys_KeyHandler, lines_LineHandler, cursor_Cursor, NonRTE_init_init, libs_pubsub, data_Data, events_SelectHandler, selection_Selection, libs_marked_lib_marked, lines_LineCompiler);

var NonRTE = function (NonRTE) {
        return NonRTE;
    }(NonRTE__NonRTE);


// export as Common JS module...
if ( typeof module !== "undefined" && module.exports ) {
	module.exports = NonRTE;
}

// ... or as AMD module
else if ( typeof define === "function" && define.amd ) {
	define( function () {
		return NonRTE;
	});
}

// ... or as browser global
else {
	global.NonRTE = NonRTE;
}

}( typeof window !== 'undefined' ? window : this ));