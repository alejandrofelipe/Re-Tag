var Retag = {};
Retag.Collection = function () {
	function TagCollection(options) {
		this._index = 0;
		this._tags = [];
		this._observers = [];
		this._onAdd = null;
		this._onDelete = null;
		this._onAdd = options && typeof options.onAdd === 'function' ? options.onAdd : null;
		this._onAdded = options && typeof options.onAdded === 'function' ? options.onAdded : null;
		this._onDelete = options && typeof options.onDelete === 'function' ? options.onDelete : null;
		this._allowEquals = options && typeof options.allowEquals === 'boolean' ? options.allowEquals : true;
		this._minLength = options && typeof options.minLength == 'number' ? options.minLength : 2;
	}

	TagCollection.prototype._add = function (tag) {
		if (!this._allowEquals && this._has(tag)) return false;
		if (this._minLength > tag.length) return false;

		tag = this._onAdd ? this._onAdd(tag, this._tags) : tag;
		if (tag) {
			this._index++;
			this._tags.push({ tag: tag, key: '' + this._index });
			if (this._onAdded) this._onAdded(tag, this._tags);
		}
	};
	TagCollection.prototype._fire = function () {
		for (var i = 0; i < this._observers.length; i++) {
			this._observers[i]();
		}
	};
	TagCollection.prototype._has = function (tag) {
		for (var i = 0; i < this._tags.length; i++) {
			if (this._tags[i].tag.toLowerCase() === tag.toLowerCase()) return true;
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
}();
Retag.Input = React.createClass({
	displayName: 'Input',

	propTypes: {
		breaks: React.PropTypes.array,
		suggestions: React.PropTypes.array,
		suggestions_max: React.PropTypes.number,
		suggestions_start_size: React.PropTypes.number,
		collection: React.PropTypes.object.isRequired,
		css: React.PropTypes.string,
		handleBlur: React.PropTypes.bool,
		handleEnter: React.PropTypes.bool
	},
	getDefaultProps: function getDefaultProps() {
		return {
			breaks: [',', ' '],
			suggestions: [],
			suggestions_max: 15,
			suggestions_start_size: 1,
			css: 'tag-input',
			handleBlur: false,
			handleEnter: false
		};
	},
	getInitialState: function getInitialState() {
		return {
			text: '',
			breaks: this.props.breaks,
			lTags: []
		};
	},
	breaks: function breaks(txt) {
		var chars = this.state.breaks;
		for (var i = 0; i < chars.length; i++) {
			if (txt.indexOf(chars[i]) !== -1) {
				return true;
			}
		}
		return false;
	},

	checkEvent: function checkEvent(e) {
		var txt = e.target.value;
		if (e.type === 'blur' && this.props.handleBlur) this.addTag(txt);else if (e.type === 'change') this.textChange(txt);else if (e.type === 'keyup') {
			if (e.keyCode === 13 && this.props.handleEnter) {
				e.preventDefault();
				this.addTag(txt);
			}
		}
	},

	addTag: function addTag(txt) {
		this.props.collection.addRange(txt.split(new RegExp('[' + this.state.breaks.join('') + ']')));
		this.setState({ lTags: [], text: '' });
	},

	textChange: function textChange(txt) {
		if (this.breaks(txt) || txt === this.state.text) {
			if (txt.length !== 1) this.addTag(txt);
		} else {
			this.queryAutoComplete(txt);
			this.setState({ text: txt });
		}
	},

	queryAutoComplete: function queryAutoComplete(query) {
		var lTags = [];
		if (query.length >= this.props.suggestions_start_size) {
			lTags = this.props.suggestions.filter(function (val) {
				return val.toLowerCase().indexOf(query.toLowerCase()) > -1;
			}).sort(function (val) {
				return val.toLowerCase().indexOf(query.toLowerCase());
			}).slice(0, this.props.suggestions_max);
		}
		this.setState({ lTags: lTags });
	},
	render: function render() {
		var input = React.createElement('input', { ref: 'txt_tag',
			className: this.props.css,
			type: 'text',
			value: this.state.text,
			onChange: this.checkEvent,
			onBlur: this.checkEvent,
			onKeyUp: this.checkEvent,
			list: 'lTags'
		});

		var dataList = React.createElement(
			'datalist',
			{ id: 'lTags' },
			this.state.lTags.map(function (val, inx) {
				return React.createElement('option', { key: inx, value: val });
			}.bind(this))
		);

		return React.createElement(
			'div',
			null,
			' ',
			input,
			' ',
			dataList,
			' '
		);
	}
});
Retag.Tags = React.createClass({
	displayName: 'Tags',


	getInitialState: function getInitialState() {
		return {
			tags: []
		};
	},
	propTypes: {
		collection: React.PropTypes.object.isRequired,
		onUpdate: React.PropTypes.func
	},

	getDefaultProps: function getDefaultProps() {
		return {
			onUpdate: function onUpdate() {}
		};
	},

	componentDidMount: function componentDidMount() {
		var src = this.props.collection;
		src.listen(function () {
			this.setState({
				tags: src._tags
			});
		}.bind(this));
	},

	componentDidUpdate: function componentDidUpdate() {
		this.props.onUpdate();
	},

	removeTag: function removeTag(e) {
		var key = e.target.getAttribute('data-tag');
		this.props.collection.remove(key);
	},

	_mapper: function _mapper(e) {
		var _ = this;
		return React.createElement(
			'div',
			{ key: e.key, className: _.props.css || 'tag' },
			e.tag,
			React.createElement('button', { 'data-tag': e.key, style: { display: 'inline' }, className: _.props.deleteCss || 'tag-delete',
				onClick: _.removeTag })
		);
	},

	render: function render() {
		return React.createElement(
			'div',
			null,
			this.state.tags.map(this._mapper)
		);
	}
});