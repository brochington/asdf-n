define([
	'asdf/classes/pubsub',
	'lodash'
	], function (ps, _){
	// Main define function of asdf

	var ns = { test: 'property', lodash: _};

	ps.subscribe('hello', function(){
		console.log('hello from pubsub');
	});


	return ns;
})