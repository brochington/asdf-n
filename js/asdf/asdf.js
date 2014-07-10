define([
	'asdf/classes/pubsub',
	'asdf/classes/dom',
	'asdf/classes/liveVar',
	'lodash'
	], function (ps, dom, LiveVar, _){
	// Main define function of asdf

	var asdf = {};

	asdf.LiveVar = LiveVar;
	asdf.Dom = dom;
	asdf.ps = ps;

	return asdf;
});