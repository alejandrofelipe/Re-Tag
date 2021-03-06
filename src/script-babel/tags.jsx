Retag.Tags = React.createClass({

	getInitialState: function () {
		return {
			tags: []
		}
	},
	propTypes: {
		collection: React.PropTypes.object.isRequired,
		onUpdate: React.PropTypes.func
	},

	getDefaultProps: function () {
		return {
			onUpdate: function () {

			}
		}
	},

	// once we mount check, we listen to model
	componentDidMount: function () {
		var src = this.props.collection;
		src.listen(function () {
			this.setState({
				tags: src._tags
			});
		}.bind(this));
	},

	componentDidUpdate: function () {
		this.props.onUpdate();
	},

	// every tag has data-tag attribute. It's the key used to uniquely id a tag
	// key is also used by react renderer
	removeTag: function (e) {
		var key = e.target.getAttribute('data-tag');
		this.props.collection.remove(key);
	},

	// map each element to a tag (html dom element)
	// each tag is div, it also has button 'x' to delete
	_mapper: function (e) {
		var _ = this;
		return (    <div key={e.key} className={ _.props.css || 'tag'}>
			{e.tag}
			<button data-tag={e.key} style={{ display: 'inline' }} className={ _.props.deleteCss || 'tag-delete'}
					onClick={_.removeTag} />
		</div>)
	},

	render: function () {
		return (
			<div>{ this.state.tags.map(this._mapper) }</div>
		);
	}
});