define([
	'libs/pubsub'

	], function(
		pubsub
		) {
	
	var wrapEvent = function(fn) {
		return fn;
	}


	var SelectionHandler = function(node, fn) {
		this.fn = fn;
		this.node = node;
		this.fnMouseMove = wrapEvent(this.handleMouseMove.bind(this));
		this.fnMouseEnd = wrapEvent(this.handleMouseUp.bind(this));

		node.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
	};

	SelectionHandler.prototype.handleMouseDown = function(e) {
		e.preventDefault();
		pubsub.publish('selection.start', e);

		this.node.addEventListener('mousemove', this.fnMouseMove , false);
		this.node.addEventListener('mouseup', this.fnMouseEnd, false);
	}

	SelectionHandler.prototype.handleMouseUp = function(e) {
		e.preventDefault();
		pubsub.publish('selection.end', e);
		this.node.removeEventListener('mousemove', this.fnMouseMove, false);
		this.node.removeEventListener('mouseup', this.fnMouseEnd, false);
	}

	SelectionHandler.prototype.handleMouseMove = function(e) {
		e.preventDefault();
		pubsub.publish('selection.change', e)
	}



	return SelectionHandler;
})