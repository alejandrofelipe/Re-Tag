(function () {
	var arr = new RTCollection({
		onAdd: function onAdd(i, l) {
			return i;
		},
		onDelete: function onDelete(i, l) {
			return i;
		},
		allowEquals: false,
		minLength: 2
	});

	ReactDOM.render(React.createElement(RTInput, { collection: arr,
		autocomplete: ['ok', 'fio', 'alejandro', 'felipe'],
		handleInput: true
	}), document.getElementById('input'));

	ReactDOM.render(React.createElement(RTTags, { collection: arr
	}), document.getElementById('tags'));
})();