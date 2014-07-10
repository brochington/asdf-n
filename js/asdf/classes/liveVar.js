define([
	'lodash',
	'asdf/classes/pubsub',
	'asdf/classes/dom',
	], function (_, ps, dom){

		var ns = {},
			liveVarValues = {},
			monitorLiveVars = false,
			liveVarMonitorArr = [],
			typeArr = ['Undefined','String','Number','Boolean','Function',
						'Array','Date','Null','Object','Null','NaN'];

		// Creates a new liveVar property and variable. 
		ns.newLiveVar = function(Varname, initValue, initArgVals){



			Object.defineProperty(liveVarValues, Varname, {
				value: new LiveVar({
					name: Varname,
					value: initValue,
					initArgVals: determineArgVals(arguments, 2)
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
				liveVarFunc;

			this.internal = {
				name: data.name,
				value: data.value,
				initArgVals: data.initArgVals,
				internalFunc: null
			};

			this.internal.internalFunc = this.createLiveVarFunction();

			Object.defineProperty(this, 'name', {
				get: function(){
					// return this.internal.name;
					// console.log('LiveVar name', this);
				},
				set: function(val){
					// console.log('name set');
				}
			});

			Object.defineProperty(this, 'value', {
				get: function(){
					// console.log('get value');
					
					// if monitorLiveVar flag is set, add ref to that liveVar in arr.
					if(monitorLiveVars){
						// console.log('liveVar in Function...', self);
						liveVarMonitorArr.push(self);	
					};

					return self.internal.internalFunc;
				},
				set: function(val){
					// console.log('set value:', val);
					var valType = determineType(val);
					// console.log('valType: ', valType);

					// handle type usecases here. 

					if(valType == 'asdfPrimitive'){
						console.dir(val);

						self.internal.value = val.asdfHome.internal.value;
						
						ps.subscribe(val.asdfHome.internal.name, self.updateLiveVars.bind(self));

						return;
					};

					if(valType == 'asdfFunction'){
						// console.log('val is asdf function');
					};

					if(valType == 'String' || valType == 'Number' || valType == 'Boolean'){
						// console.log('type1', self.internal.name, val);

						self.internal.value = val;

						ps.publish(self.internal.name, val);

						return;
					};
				}
			})
		};

		LiveVar.prototype.updateLiveVars = function(passedValue){
			// console.log('proto updateLiveVars');
			// console.log(this);
			// console.log(passedValue);

			this.internal.value = passedValue;
		};

		LiveVar.prototype.createLiveVarFunction = function (){
			// console.log('testing createLiveVarFunction', this);

			var tempFunc = new Function(),
				self = this,
				tempVal = null,
				dataValType = determineType(this.internal.value);

			// this is the magic function!
			tempFunc = function(){

				return self.internal.value;
			};	

			//setup the properties on the function that will be passed around.
			if(dataValType == 'String' || dataValType == 'Number' || dataValType == 'Boolean'){
				// console.log('is a primative...');
				tempFunc.asdfType = 'asdfPrimitive';				
			};

			// If value is a function, 
			if(dataValType == 'Function'){
				console.log('dataValType is Function.');
				tempFunc.asdfType = 'asdfFunction';

				// move function the internalFunc property so that value can be the evaluated value of
				// the function.
				
				this.internal.internalFunc = this.internal.value;
				// evaluate function with default value to determine init value and 
				// see if any liveVars are being used inside of the function. subscribe to them is so.
				monitorLiveVars = true;
				// TODO: figure out how to pass arguments as arguments to the internalFunc.
				arguments.length = this.internal.initArgVals.length;

				console.log(this.internal.initArgVals.length);
				console.log(arguments.length);
				this.internal.initArgVals.forEach(function(v, i, arr){
					arguments[i] = v;
					console.log(i,v, arguments[i]);
				});
				console.log(this.internal.initArgVals);
				console.log('arguments: ', arguments);

				this.internal.value = this.internal.internalFunc(arguments);

				_(liveVarMonitorArr).forEach(function (v){
					ps.subscribe(self.internal.name,self.updateLiveVars.bind(v));
				});
				// subscribe to all liveVars that are triggered while running the function
				monitorLiveVars = false;
			};

			if(dataValType == 'Array'){
				// console.log('dataValType is Array');
				tempFunc.asdfType = 'asdfArray';
			};

			if(dataValType == 'Object'){
				// console.log('dataValType is Object');
				tempFunc.asdfType = 'asdfObject';
			};

			// set reference to Home of liveVar.
			tempFunc.asdfHome = self;	

			return tempFunc;
		};

		function determineType(value){
			// console.log('determineType type: ',value);

			if(value.asdfType){
				return value.asdfType;
			};

			for(var i = 0;i<typeArr.length;i++){
				if(_[('is' + typeArr[i])](value)){
					// console.log(typeArr[i]);
					return typeArr[i];
				};
			};
		};
		// creates an array of arguments that can be used by functions as values.
		function determineArgVals(args, amountToSkip){
			var argArr = Array.prototype.slice.call(args);

			for(var i = 0; i < amountToSkip; i++){
				argArr.shift();
			};
			
			return argArr;
		}

		return ns;
});