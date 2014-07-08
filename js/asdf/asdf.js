define([
	'asdf/classes/pubsub',
	'asdf/classes/dom',
	'lodash'
	], function (ps, _){
	// Main define function of asdf

	var asdf = { test: 'property', lodash: _};

	ps.subscribe('hello', function(){
		console.log('hello from pubsub');
	});


	return asdf;
})