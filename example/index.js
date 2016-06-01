(function () {
	var arr = new Retag.Collection({
		onAdd: function onAdd(i, l) {
			return i;
		},
		onDelete: function onDelete(i, l) {
			return i;
		},
		allowEquals: false,
		minLength: 2
	});

	ReactDOM.render(React.createElement(Retag.Input, {
		collection: arr,
		suggestions: ['alejandro', 'felipe', 'silva', 'react', 'tags', 'input', 'npm', 'nodejs', 'retag', 'javascript', 'module', 'component', 'form', 'array', 'object'],
		// suggestions_max: 1,
		handleEnter: true,
		handleBlur: true
	}), document.getElementById('input'));

	ReactDOM.render(React.createElement(Retag.Tags, {
		collection: arr
	}), document.getElementById('tags'));
})();