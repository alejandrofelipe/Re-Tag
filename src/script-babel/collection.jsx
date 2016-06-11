Retag.Collection = (function () {
	function TagCollection(options) {
		this._index = 0;
		this._tags = [];
		this._observers = [];
		this._onAdd = null;
		this._onDelete = null;
		this._onAdd = options && typeof (options.onAdd) === 'function' ? options.onAdd : null;
		this._onAdded = options && typeof (options.onAdded) === 'function' ? options.onAdded : null;
		this._onDelete = options && typeof (options.onDelete) === 'function' ? options.onDelete : null;
		this._allowEquals = options && typeof (options.allowEquals) === 'boolean' ? options.allowEquals : true;
		this._minLength = options && typeof (options.minLength) == 'number' ? options.minLength : 2;
	}

	TagCollection.prototype._add = function (tag) {
		if (!this._allowEquals && this._has(tag)) return false;
		if (this._minLength > tag.length) return false;

		tag = this._onAdd ? this._onAdd(tag, this._tags) : tag;
		if (tag) {
			this._index++;
			this._tags.push({tag: tag, key: '' + this._index});
			if (this._onAdded) this._onAdded(tag, this._tags)
		}
	};
	TagCollection.prototype._fire = function () {
		for (var i = 0; i < this._observers.length; i++) {
			this._observers[i]();
		}
	};
	TagCollection.prototype._has = function (tag) {
		for (var i = 0; i < this._tags.length; i++) {
			if (this._tags[i].tag.toLowerCase() === tag.toLowerCase())
				return true;
		}
		return false;
	};
	TagCollection.prototype.addRange = function (tags) {
		for (var i = 0; i < tags.length; i++) {
			var t = tags[i];
			if (t && t !== '') {
				this._add(t);
			}
		}
		this._fire();
	};
	TagCollection.prototype.add = function (tag) {
		if (tag && tag !== '') {
			this._add(tag);
			this._fire();
		}
	};
	TagCollection.prototype.remove = function (key) {
		var remove = this._onDelete ? this._onDelete(key, this._tags) : true;
		if (remove) {
			for (var i = 0; i < this._tags.length; i++) {
				if (this._tags[i].key === key) {
					this._tags.splice(i, 1);
					this._fire();
					return;
				}
			}
		}
	};
	TagCollection.prototype.clear = function () {
		this._index = 0;
		this._tags = [];
		this._fire();
	};
	TagCollection.prototype.getTags = function () {
		var result = new Array(this._tags.length);
		for (var i = 0; i < this._tags.length; i++) {
			result[i] = this._tags[i].tag;
		}
		return result;
	};
	TagCollection.prototype.listen = function (callback) {
		if (callback) {
			this._observers.push(callback);
		}
	};

	TagCollection.prototype.addListener = function (eName, cb) {
		this['_' + eName] = cb;
	};

	return TagCollection;
})();