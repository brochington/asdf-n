define([
	'lodash',
	'asdf/classes/pubsub',
	'asdf/classes/dom',
	], function (_, ps, dom){

		var ns = {},
			liveVarValues = {},
			typeArr = ['Undefined','String','Number','Boolean','Function',
						'Array','Date','Null','Object','Null','NaN'];

		// Creates a new liveVar property and variable. 
		ns.newLiveVar = function(Varname, initValue){

			Object.defineProperty(liveVarValues, Varname, {
				value: new LiveVar({
					name: Varname,
					value: initValue
				})
			});

			Object.defineProperty(ns, Varname, {
				get: function(){
					// console.log('liveVar GET');
					return liveVarValues[Varname].value;
				},
				set: function(val){
					// console.log('liveVAR SET');
					liveVarValues[Varname].value = val;
				}
			});
		};
		// liveVar class 
		function LiveVar(data) {
			var self = this,
				liveVarFunc = createLiveVarFunction(data, self);

				liveVarFunc.asdfType = 'asdfFunction';
				liveVarFunc.asdfHome = self;

			this.internal = {
				name: data.name,
				internalFunc: liveVarFunc,
				value: data.value
			};

			Object.defineProperty(this, 'name', {
				get: function(){
					// return this.internal.name;
					console.log('LiveVar name', this);
				},
				set: function(val){
					console.log('name set');
				}
			});

			Object.defineProperty(this, 'value', {
				get: function(){
					// console.log('value get');
					return self.internal.internalFunc;
				},
				set: function(val){
					var valType = determineType(val);
					// console.log('valType: ', valType);

					// handle type usecases here. 

					if(valType == 'asdfFunction'){

						self.internal.value = val.asdfHome.internal.value;
						
						ps.subscribe(val.asdfHome.internal.name, self.updateLiveVars.bind(self));

						return;
					};

					if(valType == 'String' || valType == 'Number' || valType == 'Boolean'){
						console.log('type1', self.internal.name);

						self.internal.value = val;

						ps.publish(self.internal.name, val);

						return;
					};
				}
			})
		};

		LiveVar.prototype.updateLiveVars = function(passedValue){
			console.log('proto updateLiveVars');
			console.log(this);
			console.log(passedValue);

			this.internal.value = passedValue;
		};

		function createLiveVarFunction(data, self){
			var tempFunc = new Function(),
				value = data.value;

			//setup the properties on the function that will be passed around.

			// this is the magic function!
			tempFunc = function(){

				return self.internal.value;
			};

			return tempFunc;
		};

		function determineType(value){

			if(value.asdfType){
				return value.asdfType;
			};

			for(var i = 0;i<typeArr.length;i++){
				if(_[('is' + typeArr[i])](value)){
					console.log(typeArr[i]);
					return typeArr[i];
				};
			};
		};

		return ns;
});