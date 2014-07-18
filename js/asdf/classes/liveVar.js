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

		// to temp expose liveVarValues:
		ns.liveVarValues = liveVarValues; 

		// Creates a new liveVar property and variable. 
		ns.newLiveVar = function(Varname, initValue, initArgVals, initContext){


			Object.defineProperty(liveVarValues, Varname, {
				value: new LiveVar({
					name: Varname,
					value: initValue,
					// initArgVals: determineArgVals(arguments, 2)
					initArgVals: initArgVals || null,
					initContext: initContext || window
				})
			});			

			Object.defineProperty(ns, Varname, {
				get: function(){
					// console.log('liveVar GET');
					// console.log(Varname);
					// console.log(liveVarValues);
					if(liveVarValues[Varname]){
						return liveVarValues[Varname].value;	
					}
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
				internalFunc: null,
				tempSetVal: null
			};

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
					// console.log('value set');
					this.internal.tempSetVal = val;

					var valType = determineType(val);
					// console.log('valType: ', valType);

					// handle type usecases here. 
					if(valType == 'asdfPrimitive'){
						console.log('it is an asdfPrimitive.');
						this.handleAsdfPrimitive();
					};

					if(valType == 'asdfFunction'){
						console.log('val is asdf function');
						this.handleAsdfFunction();
					};

					if(valType == 'String' || valType == 'Number' || valType == 'Boolean'){
						console.log('type1', self.internal.name, val);

						self.internal.value = val;
						console.log(self.internal.name);
						ps.publish(self.internal.name);

						return;
					};
				}
			});

			this.internal.internalFunc = this.createLiveVarFunction();
		};

		LiveVar.prototype.updateLiveVars = function(){
			console.log('proto updateLiveVars');
			console.dir(this);
			// console.log(passedValue);

			if(this.internal.internalFunc.asdfType == 'asdfPrimitive'){

			}

			if(this.internal.internalFunc.asdfType == 'asdfFunction'){
				console.log('bang');
				this.updateAsdfFunction();
			}

			// this.internal.value = passedValue;
		};

		LiveVar.prototype.updateAsdfFunction = function(){
			console.log('updateAsdfFunction');

			var argArr = getArgArr(this.internal.initArgVals);
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
				tempFunc.asdfType = 'asdfFunction';
				this.initAsdfFunction();
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

		LiveVar.prototype.initAsdfFunction = function(){
			var self = this;
			// console.log('initAsdfFunction');

			if(typeof this.internal.initArgVals == 'string'){
				console.log('initArgVals is a string, and shouldn\'t be!');
			};

			var argArr = _.map(this.internal.initArgVals, function(argVal){
				return argVal;
			});

			this.internal.internalFunc = this.internal.value;

			// evaluate function with default value to determine init value and 
			// see if any liveVars are being used inside of the function. subscribe to them is so.
			monitorLiveVars = true;
			// TODO: figure out how to pass arguments as arguments to the internalFunc.
			// use .apply() to pass an array of arguments.
			if(this.internal.initArgVals){
				for(var argKey in this.internal.initArgVals){
					this.internal.internalFunc[argKey] = this.internal.initArgVals[argKey];
				};	
			};
			// console.log(argArr);
			// console.log(this.internal.internalFunc);
			this.internal.value = this.internal.internalFunc.apply(this.internal.initContext, argArr);
			// console.log(this.internal.value);

			_(liveVarMonitorArr).forEach(function (v){
				console.log('v', v);
				ps.subscribe(v.internal.name,self.updateLiveVars.bind(self));
			});
			// subscribe to all liveVars that are triggered while running the function
			monitorLiveVars = false;
		};

		LiveVar.prototype.handleAsdfFunction = function(){
			console.log('handleAsdfFunction');

		};

		LiveVar.prototype.handleAsdfPrimitive = function(){
			console.log('handleAsdfPrimitive');
			var val = this.internal.tempSetVal;

			this.internal.value = val.asdfHome.internal.value;
			
			ps.subscribe(val.asdfHome.internal.name, this.updateLiveVars.bind(this));
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

		function getArgArr(argsInObj) {
			var tempArr = [];
			for(var key in argsInObj){
				tempArr.push(argsInObj[key]);
			}
			return tempArr;
		}

		return ns;
});