Retag.Input = React.createClass({
	getInitialState: function () {
		return {
			text: '',
			breaks: this.props.breaks || [',', ' '],
			lTags: []
		};
	},
	propTypes: {
		breaks: React.PropTypes.array,
		suggestions: React.PropTypes.array,
		collection: React.PropTypes.object.isRequired,
		css: React.PropTypes.string,
		handleBlur: React.PropTypes.bool,
		handleEnter: React.PropTypes.bool,
		handleInput: React.PropTypes.bool
	},
	getDefaultProps: function () {
		return {
			suggestions: [],
		}
	},
	// check if delim exists in txt
	breaks: function (txt) {
		var chars = this.state.breaks;
		for (var i = 0; i < chars.length; i++) {
			if (txt.indexOf(chars[i]) !== -1) {
				return true;
			}
		}

		return false;
	},

	// set focus to input element (dom)
	setFocus: function () {
		this.refs.txt_tag.getDOMNode().focus();
	},

	// On text change of input
	onTextChange: function (e) {
		var txt = e.target.value;
		// We have delim
		if (this.breaks(txt)) {

			// And it's not the 1st char
			if (txt.length !== 1) {
				this.addTag(e);
			}
		} else {

			// Valid, continue with input
			this.queryAutoComplete(txt);
			this.setState({text: e.target.value});
		}
	},

	addTag: function (e) {
		var txt = e.target.value;
		// We create a regex [ ] with all delims and split using that
		// Send this over to model
		this.props.collection.addRange(txt.split(new RegExp('[' + this.state.breaks.join('') + ']')));

		this.setState({lTags: [], text: ''});
	},

	onKeyInput: function (e) {
		// Enter KEY
		if (e.keyCode === 13) {
			if (e.preventDefault) {
				e.preventDefault();
			}
			this.addTag(e);
			return false;
		}
	},

	onInputSelect: function (e) {
		var tag = e.target.value;
		for (var i = 0; i < this.props.autocomplete.length; i++) {
			if (this.props.autocomplete[i].toLowerCase() === tag.toLowerCase()) {
				this.addTag(e);
				this.setState({text: ''});
				this.refs.txt_tag.value = '';
				break;
			}
		}
	},

	queryAutoComplete: function (query) {
		var lTags = [];
		if (query.length > 0)
			for (var i = 0; i < this.props.suggestions.length; i++) {
				if (this.props.suggestions[i].toLowerCase()
						.indexOf(query.toLowerCase()) !== -1) {
					lTags.push(this.props.suggestions[i])
				}
			}
		this.setState({lTags: lTags});
	},
	render: function () {
		var input = <input ref="txt_tag"
						   className={this.props.css || 'tag-input'}
						   type={'text'}
						   value={this.state.text}
						   onChange={this.onTextChange}
						   list="lTags"
						   onInput={this.onInputSelect}
			/>,
			dataList = null;

		if (this.props.handleBlur)
			input.props.onBlur = this.addTag;

		if (this.props.handleEnter)
			input.props.onKeyUp = this.onKeyInput;

		if (this.state.lTags.length > 0) {
			dataList = <datalist id="lTags">
				{
					this.state.lTags.map(function (val, inx) {
						return <option key={inx} value={val}/>;
					})
				}
			</datalist>;
		}

		return <div>
			{input}
			{dataList}
		</div>;
	}
});