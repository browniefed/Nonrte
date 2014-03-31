
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