define([
	'asdf/classes/pubsub',
	'asdf/classes/template',
	'asdf/classes/dom',
	'asdf/classes/liveVar',
	'lodash'
	], function (ps, tpl, dom, LiveVar, _){
	// Main define function of asdf

	var asdf = {};

	asdf.LiveVar = LiveVar;
	asdf.Template = tpl;
	asdf.Dom = dom;
	asdf.ps = ps;

	return asdf;
});