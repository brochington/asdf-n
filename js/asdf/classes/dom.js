define([
	'lodash',
	'vendor/lazy',
	'asdf/classes/utility',
	'asdf/classes/template',
	'asdf/classes/bindings'
	], function (_, Lazy, utils, tpl, bindings){

	var ns = {
			playgroundNodeList: null, // holds the playground NodeList.
			playgrounds: [], // array of references to playground dome nodes. 
			animUpdateArr: [],
			asdfTemplateNodes: [],
			asdfTemplates: {},
		},
		domNodeCacheObj = {}, // stores references to Dom nodes.
		domObjects = {},
		
		animCount = 0,
		
		animId = null;

		console.log(tpl);


	function DomObj(domNode) {
		var self = this;

		this.__internal__ = {
			domNode: domNode,
			styleObj: {},
			computedStyles: window.getComputedStyle(domNode),
			lastStyleValues: {},
			styleKeys: Object.keys(domNode.style),
			renderConfigObj: null
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
						self.__internal__.lastStyleValues[v] = val;

						var tempFunc = self.updateStyle.bind(self, {
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
	};

	DomObj.prototype.updateStyles = function(){

		this.styleObj.styleUpdateArr.forEach(function(v, i, arr){
			console.log(v);
		});
	};

	DomObj.prototype.updateStyle = function(data){
		// console.log('updateStyle', data);
		// console.log(data.DomObj.__internal__.computedStyles[data.style]);
		data.DomObj.__internal__.domNode.style[data.style] = data.value;
		// console.log(data.DomObj.__internal__.computedStyles[data.style]);
	};

	DomObj.prototype.replaceInnerHTML = function(data){
		// NOTE: this should use document fragments to help reduce render times...
		console.log(this.__internal__.domNode.innerHTML);
		this.__internal__.domNode.innerHTML = data;
	};

	DomObj.prototype.appendChild = function(data){
		// this.__internal__.domNode.appendChild(data);

		this.__internal__.domNode.insertAdjacentHTML('beforeend', data);
	};

	DomObj.prototype.render = function(arg1, data){
		console.log('render');
		if(data){
			console.log('data:', data);
			var dataType = utils.determineType(data);

			if(dataType === 'Object'){
				//basic handling of object for now...
				var domString = template.domStringCompiled(data);

				var tempFunc = this.replaceInnerHTML.bind(this, domString);

				ns.animUpdateArr.push(tempFunc);
			}
		}else if(arg1 && arg1.template) {
			// arg1 is a template config object.
			console.log('has arg1');
			this.__internal__.renderConfigObj = arg1;
			this.renderWithConfigObj();

		}
	}

	DomObj.prototype.renderWithConfigObj = function(){
		console.log('renderWithConfigObj');
		var self = this,
			configObj = this.__internal__.renderConfigObj;



		if(configObj.template){
			console.log('configObj has template property');	
		}

		if(configObj.foreach){
			console.log('configObj has foreach property');
			var foreachVal = configObj.foreach;
			// test to see if foreach value is a liveVar or not.
			if(foreachVal.asdfType === 'asdfArray'){
				var val = foreachVal();

				val.forEach(function (v, i, arr){
					console.log(v);
					// console.log(configObj.template.domStringCompiled);
					var domString = configObj.template.domStringCompiled(v);
					// console.log(domString);

					var tempFunc = self.appendChild.bind(self, domString);

					ns.animUpdateArr.push(tempFunc);
				});
			}
		}	
	}
	// An Array of Dom Objects, Used in handling of classes, and Id's.
	function DomObjArray(data){
		console.log('inside dom array');
		console.dir(data);
		var self = this;
		var testObj = {};

		this.__internal__ = {
			DomObjArr: [new DomObj(data)]
		};

		console.time('secondTime');
		// add properties of the style names to the DomObjArray
		this.__internal__.DomObjArr[0].__internal__.styleKeys.forEach(function (v, i, arr){
			Object.defineProperty(self, v, {
				get: function(){
					console.log('get me!');
				},
				set: function(val){
					console.log('set me!', val);
				}
			})
		})
		// create properties on the main node for each style property.
		
		console.timeEnd('secondTime');

		// console.time('thirdTime');
		
		// console.timeEnd('thirdTime');
	}
	// set the prototype of the DomObjArray so that it can access array methods.
	DomObjArray.prototype = new Array();

	// a method created to be able to safely add a domNode to a DomObjArray
	DomObjArray.prototype.pushDomNode = function(domNode){
		console.log('reached pushDomNode');
		this.push(domNode);

		this.__internal__.DomObjArr.push(domNode);

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

	// Playground Contructor
	function Playground(domNode){

		this.domNode = domNode;

		this.fillDomNodeCacheArr(domNode);
	}

	Playground.prototype.fillDomNodeCacheArr = function(domNode){

		if(domNode && domNode.children){
			for(var i = 0; i < domNode.children.length; i++){
				var child = domNode.children[i];

				if(child){
					this.processDomNodeAsProp(child);
				}
				if(this.domNode.children[i].children){
					this.fillDomNodeCacheArr(domNode.children[i]);
				};
			}
		}
	}

	Playground.prototype.processDomNodeAsProp = function(domNode){
		if(domNode.id && !ns.hasOwnProperty(domNode.id)){
			// console.log('domNode has id');
			this.defineDomNodeAsProp(domNode, domNode.id);
		}
		if(domNode.classList.length > 0){
			// console.log('domNode has at least one class.');
			for(var i = 0, l = domNode.classList.length; i<l; i++){
				var className = domNode.classList[i];
				// console.log(className);
				//check to see if className has already been added to 
				// the ns object.
				if(ns.hasOwnProperty(className)){
					domObjects[className].pushDomNode(domNode);
					// add className to appropriate objects. 
				
				} else{
					this.defineDomNodeAsProp(domNode, className);
				}

			}
		}
	}

	Playground.prototype.defineDomNodeAsProp = function(domNode, propName){
		console.log(domNode);
		Object.defineProperty(domNodeCacheObj, propName, {
			value: domNode
		});

		Object.defineProperty(domObjects, propName, {
			value: new DomObjArray(domNode)
		});

		Object.defineProperty(ns, propName, {
			get: function(){
				return domObjects[propName];
			},
			set: function(val){

			}
		});
		// set an array value in the newly created DomObjArray as part of
		// the init process.
		domObjects[propName].push(domNode);
	}

	// Playground.prototype.addIDAsProp = function(domNode){
	// 	console.log('reached....');

	// 	// add domNode to domNodeCacheObj
	// 	Object.defineProperty(domNodeCacheObj, id, {
	// 		value: domNode
	// 	});
	// 	// create new DomObj, place it in domObjects
	// 	Object.defineProperty(domObjects, id, {
	// 		value: new DomObjArray(domNode)
	// 	});

	// 	// create accessor to domObject
	// 	// pubsub actions will most likely be handled here.''
	// 	Object.defineProperty(ns, id, {
	// 		get: function(){
	// 			return domObjects[id];
	// 		},
	// 		set: function(val){

	// 		}
	// 	});
	// }

	// Playground.prototype.processClassesAsProps = function(domNode){
	// 	console.log("processClassesAsProps: ");
	// 	console.dir(domNode.classList);

	// 	for(var i = 0; i < domNode.classList.length; i++){
	// 		var className = domNode.classList[i];

	// 		if(ns.hasOwnProperty(className)){
	// 			// console.log("has className");
	// 			// domObjects[className].push(new DomObj(domNode));
	// 			// add to class array...
	// 		} else {
	// 			// console.log(className);
	// 			// console.log('does not have class name');
	// 			// create and add to class array.
	// 			Object.defineProperty(domObjects, className, {
	// 				value: new DomObjArray(domNode)
	// 			});

	// 			Object.defineProperty(ns, className, {
	// 				get: function(){
	// 					return domObjects[className];
	// 				},
	// 				set: function(val){

	// 				}
	// 			})
	// 		}
	// 	}	
	// }

	// It doesn't make sense to make a d domeNode for EVERY
	// dom node on the page, so we create playgrounds, where
	// all the elements inside are created on the d object. 
	function initAsdfPlaygrounds(){
		//NOTE: ns.playgroundNodeList is a NodeList, NOT an array!
		ns.playgroundNodeList = document.querySelectorAll('[data-playground]');

		for(var i = 0; i < ns.playgroundNodeList.length; i++){
			var node = ns.playgroundNodeList[i];
			// fillDomNodeCacheArr(node);
			// ns.playgrounds.push(node);
			ns.playgrounds.push(new Playground(node))
		};
	};

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
		initAsdfPlaygrounds();
	};

	// maybe this should be an IIFE instead?
	initDom();

	return ns;
});