var Retag = {};
Retag.Collection = function () {
	function TagCollection(options) {
		this._index = 0;
		this._tags = [];
		this._observers = [];
		this._onAdd = null;
		this._onDelete = null;
		this._onAdd = options && typeof options.onAdd === 'function' ? options.onAdd : null;
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
		}
	};
	TagCollection.prototype._fire = function () {
		for (var i = 0; i < this._observers.length; i++) {
			this._observers[i]();
		}
	};
	TagCollection.prototype._has = function (tag, arr) {
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
	return TagCollection;
}();
Retag.Input = React.createClass({
	displayName: 'Input',

	getInitialState: function getInitialState() {
		return {
			text: '',
			breaks: this.props.breaks || [',', ' '],
			lTags: []
		};
	},
	propTypes: {
		breaks: React.PropTypes.array,
		autocomplete: React.PropTypes.array,
		collection: React.PropTypes.object.isRequired,
		css: React.PropTypes.string,
		handleBlur: React.PropTypes.bool,
		handleEnter: React.PropTypes.bool,
		handleInput: React.PropTypes.bool
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

	setFocus: function setFocus() {
		this.refs.txt_tag.getDOMNode().focus();
	},

	onTextChange: function onTextChange(e) {
		var txt = e.target.value;

		if (this.breaks(txt)) {
			if (txt.length !== 1) {
				this.addTag(e);
			}
		} else {
			this.queryAutoComplete(txt);
			this.setState({ text: e.target.value });
		}
	},

	addTag: function addTag(e) {
		var txt = e.target.value;

		this.props.collection.addRange(txt.split(new RegExp('[' + this.state.breaks.join('') + ']')));

		this.setState({ lTags: [], text: '' });
	},

	onKeyInput: function onKeyInput(e) {
		if (e.keyCode === 13) {
			if (e.preventDefault) {
				e.preventDefault();
			}
			this.addTag(e);
			return false;
		}
	},

	onInputSelect: function onInputSelect(e) {
		var tag = e.target.value;
		for (var i = 0; i < this.props.autocomplete.length; i++) {
			if (this.props.autocomplete[i].toLowerCase() === tag.toLowerCase()) {
				this.addTag(e);
				this.setState({ text: '' });
				this.refs.txt_tag.value = '';
				break;
			}
		}
	},

	queryAutoComplete: function queryAutoComplete(query) {
		var lTags = [];
		if (query.length > 0) for (var i = 0; i < this.props.autocomplete.length; i++) {
			if (this.props.autocomplete[i].toLowerCase().contains(query.toLowerCase())) {
				lTags.push(this.props.autocomplete[i]);
			}
		}
		this.setState({ lTags: lTags });
	},

	render: function render() {
		var input = React.createElement('input', { ref: 'txt_tag',
			className: this.props.css || 'tag-input',
			type: 'text',
			value: this.state.text,
			onChange: this.onTextChange,
			list: 'lTags',
			onInput: this.onInputSelect
		}),
		    dataList = null;

		if (this.props.handleBlur) input.props.onBlur = this.addTag;

		if (this.props.handleEnter) input.props.onKeyUp = this.onKeyInput;

		if (this.state.lTags.length > 0) {
			dataList = React.createElement(
				'datalist',
				{ id: 'lTags' },
				this.state.lTags.map(function (val, inx) {
					return React.createElement('option', { key: inx, value: val });
				})
			);
		}

		return React.createElement(
			'div',
			null,
			input,
			dataList
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
		collection: React.PropTypes.object.isRequired
	},

	componentDidMount: function componentDidMount() {
		var _ = this;
		var src = this.props.collection;
		src.listen(function () {
			_.setState({
				tags: src._tags
			});
		});
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
			React.createElement(
				'button',
				{ 'data-tag': e.key, style: { display: 'inline' }, className: _.props.deleteCss || 'tag-delete', onClick: _.removeTag },
				'  '
			)
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