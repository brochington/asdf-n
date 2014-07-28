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

	function DomObjArray(data){

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
					if(child.id){
						this.processIDAsProp(child);
					}
					if(child.classList.length > 0){
						this.processClassesAsProps(child);
					}
				}
				if(this.domNode.children[i].children){
					this.fillDomNodeCacheArr(domNode.children[i]);
				};
			}
		}
	}

	Playground.prototype.processIDAsProp = function(domNode){
		console.log('reached....');
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

	Playground.prototype.processClassesAsProps = function(domNode){
		console.log(domNode.classList);

		for(var i = 0; i < domNode.classList.length; i++){
			var className = domNode.classList[i];

			if(ns.hasOwnProperty(className)){
				// add to class array...
			} else {
				// create and add to class array.
				// Object.defineProperty(domObjects, className, {
				// 	value: new DomObjArr(domNode)
				// });

				Object.defineProperty(ns, className, {
					get: function(){

					},
					set: function(val){

					}
				})
			}
		}	
	}

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