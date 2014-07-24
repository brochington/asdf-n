define([
	'lodash',
	'vendor/lazy',
	'asdf/classes/utility'
	], function (_, Lazy, utils){

	var ns = {
			playgroundNodeList: null, // holds the playground NodeList.
			playgrounds: [], // array of references to playground dome nodes. 
			animUpdateArr: [],
			asdfTemplateNodes: [],
			asdfTemplates: {}
		},
		domNodeCacheObj = {}, // stores references to Dom nodes.
		domObjects = {},
		
		animCount = 0,
		
		animId = null;


	function DomObj(domNode) {
		var self = this;

		this.__internal__ = {
			domNode: domNode,
			styleObj: {},
			computedStyles: window.getComputedStyle(domNode),
			lastStyleValues: {},
			styleKeys: Object.keys(domNode.style),
		};

		this.__internal__.styleKeys.forEach(function(v, i, arr){
			Object.defineProperty(self.__internal__.lastStyleValues, v, {
				value: self.__internal__.computedStyles[v]
			})

			Object.defineProperty(self.__internal__.styleObj, v, {
				value: new DomStyleObj(v)
			});

			Object.defineProperty(self, v, {
				get: function(){
					// console.log('get: ',v);
					return self.__internal__.computedStyles[v];
				},
				set: function(val){

					var varType = utils.determineType(val);

					console.log(varType);

					if(varType === 'String' || varType === 'Number' || varType === 'Boolean'){
						console.log('bang')
						self.__internal__.lastStyleValues[v] = val;

						tempFunc = self.updateStyle.bind(self, {
							DomObj: self,
							style: v, 
							value: val
						});

						ns.animUpdateArr.push(tempFunc);	
					}
				}
			})
		});
		

		// add css properties to this object when creating.
	};

	DomObj.prototype.rawDomNode = function(){
		return this.__internal__.domNode;
	}

	DomObj.prototype.updateStyles = function(){

		this.styleObj.styleUpdateArr.forEach(function(v, i, arr){
			console.log(v);
		});
	}

	DomObj.prototype.updateStyle = function(data){
		// console.log('updateStyle', data);
		// console.log(data.DomObj.__internal__.computedStyles[data.style]);
		data.DomObj.__internal__.domNode.style[data.style] = data.value;
		// console.log(data.DomObj.__internal__.computedStyles[data.style]);
	}

	// Constructor for styles obj.
	function DomStyleObj(styleName){
		
		this.styleName = styleName;
	}
	// adds style and val to queue of things to be updated on next animationFrame.
	DomStyleObj.prototype.addStyleToUpdate = function(style, val){
		
	}

	function getStyleName(styleName){
		console.log(styleName);
		return styleName;
	};

	function AsdfTemplate(node){
		this.id = node.id;
		this.originalScriptNode = node;
	};

	function initAsdfTemplates(){
		ns.asdfTemplateNodes = document.querySelectorAll('script[type="text/asdf-template"]');

		console.log(ns.asdfTemplateNodes);

		for(var i = 0; i < ns.asdfTemplateNodes.length; i++){
			Object.defineProperty(ns.asdfTemplates, ns.asdfTemplateNodes[i].id, {
				value: new AsdfTemplate(ns.asdfTemplateNodes[i])
			});
		};

		console.log(ns.asdfTemplates);
	};

	// It doesn't make sense to make a d domeNode for EVERY
	// dom node on the page, so we create playgrounds, where
	// all the elements inside are created on the d object. 
	function initAsdfPlaygrounds(){
		//NOTE: ns.playgroundNodeList is a NodeList, NOT an array!
		ns.playgroundNodeList = document.querySelectorAll('[data-playground]');

		for(var i = 0; i < ns.playgroundNodeList.length; i++){
			var node = ns.playgroundNodeList[i];
			fillDomNodeCacheArr(node);
			ns.playgrounds.push(node);
		};
	};

	// this function is called recursively to add properties in the domNodeCacheArr Object.
	function fillDomNodeCacheArr(domNode){

		if(domNode && domNode.children){
			for(var i = 0; i < domNode.children.length; i++){
				var child = domNode.children[i];
				// console.dir(child);
				// need to sort and add properties to the domNodeCacheArr for: 
				// 1) ids
				// 2) classes (will be an array)
				// 3) tag name
				// others for later like childNode, parentNode, and whatever else you want.

				// process for ids:
				if(child){
					if(child.id){
						processIdAsProp(child);	
					};

					if(child.classList.length > 0){
						processClassesAsProps(child);
					};
				};

				// call function recursively to process any more children.
				if(domNode.children[i].children){
					fillDomNodeCacheArr(domNode.children[i]);
				};
			};
		};
	};

	function processIdAsProp(domNode){
		// console.log('processIdAsProp');
		var id = domNode.id;

		if(!ns[id]){
			// add domNode to domNodeCacheObj
			Object.defineProperty(domNodeCacheObj, id, {
				value: domNode
			});
			// create new DomObj, place it in domObjects
			Object.defineProperty(domObjects, id, {
				value: new DomObj(domNode)
			});

			// create accessor to domObject
			// pubsub actions will most likely be handled here.''
			Object.defineProperty(ns, id, {
				get: function(){
					return domObjects[id];
				},
				set: function(val){

				}
			});
		}
	}

	function processClassesAsProps(domNode){
		// console.log('processClassesAsProps');
	}

	function animationFrameFunc(){
		if(ns.animUpdateArr.length > 0){
			console.log('render frame');
			for(var i = 0; i < ns.animUpdateArr.length;i++){
				// console.log(i);
				var func = ns.animUpdateArr.pop();
				// console.log(func);
				func();

			}	
		}
		animId = requestAnimationFrame(animationFrameFunc);
	}

	animId = requestAnimationFrame(animationFrameFunc);

	function initDom(){
		console.log('initDom');
		initAsdfTemplates();
		initAsdfPlaygrounds();
	};

	// maybe this should be an IIFE instead?
	initDom();

	return ns;
});