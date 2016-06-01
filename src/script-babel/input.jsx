Retag.Input = React.createClass({
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
	getDefaultProps: function () {
		return {
			breaks: [',', ' '],
			suggestions: [],
			suggestions_max: 15,
			suggestions_start_size: 1,
			css: 'tag-input',
			handleBlur: false,
			handleEnter: false
		}
	},
	getInitialState: function () {
		return {
			text: '',
			breaks: this.props.breaks,
			lTags: []
		};
	},
	breaks: function (txt) {
		var chars = this.state.breaks;
		for (var i = 0; i < chars.length; i++) {
			if (txt.indexOf(chars[i]) !== -1) {
				return true;
			}
		}
		return false;
	},

	checkEvent: function (e) {
		var txt = e.target.value;
		if (e.type === 'blur' && this.props.handleBlur)
			this.addTag(txt);
		else if (e.type === 'change')
			this.textChange(txt);
		else if (e.type === 'keyup') {
			if ((e.keyCode === 13) && this.props.handleEnter) {
				e.preventDefault();
				this.addTag(txt);
			}
		}
	},

	addTag: function (txt) {
		this.props.collection.addRange(txt.split(new RegExp('[' + this.state.breaks.join('') + ']')));
		this.setState({lTags: [], text: ''});
	},

	textChange: function (txt) {
		if (this.breaks(txt) || txt === this.state.text) {
			if (txt.length !== 1) this.addTag(txt);
		} else {
			this.queryAutoComplete(txt);
			this.setState({text: txt});
		}
	},

	queryAutoComplete: function (query) {
		var lTags = [];
		if (query.length >= this.props.suggestions_start_size) {
			lTags =
				this.props.suggestions.filter(function (val) {
					return val.toLowerCase()
							.indexOf(query.toLowerCase()) > -1
				}).sort(function (val) {
					return val.toLowerCase()
						.indexOf(query.toLowerCase());
				}).slice(0, this.props.suggestions_max);
		}
		this.setState({lTags: lTags});
	},
	render: function () {
		var input = <input ref="txt_tag"
						   className={this.props.css}
						   type={'text'}
						   value={this.state.text}
						   onChange={this.checkEvent}
						   onBlur={this.checkEvent}
						   onKeyUp={this.checkEvent}
						   list="lTags"
		/>;

		var dataList = <datalist id="lTags">{
			this.state.lTags.map(function (val, inx) {
				return <option key={inx} value={val}/>;
			}.bind(this))
		}</datalist>;

		return <div> {input} {dataList} </div>;
	}
});