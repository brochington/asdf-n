require([
	'asdf/asdf',
	'lodash'
	], function (asdf, _){

	window.asdf = asdf;
	var a = asdf.LiveVar,
		testFlag = true;



	a.newLiveVar('myFirstVar', 'Hello');
	a.newLiveVar('mySecondVar', 'SecondVar');
	a.newLiveVar('myThird', 'third');

	// test 1

	a.myFirstVar = 'there';
	if(a.myFirstVar() == 'there' && testFlag){
		console.log('test 1 pass');
	}else{
		console.log('test 1 fail');
	};

	// test 2

	a.myFirstVar = 'update in test 2';
	a.mySecondVar = a.myFirstVar;
	a.myFirstVar = 'update in test again';

	if(testFlag && a.mySecondVar() == 'update in test again'){
		console.log('test 2 pass');
	}else{
		console.log('test 2 fail');
	}

	// test 3

	var test3Function = function(text){
		// console.log('test 3 print: ' + text);
		return 'test 3 return: ' + text;
	};

	a.newLiveVar('testFunction', test3Function, 'starting value');

	if(testFlag && a.testFunction() == 'test 3 return: starting value'){
		console.log('test 3 pass');
	}else{
		console.log('test 3 fail');
		console.log(a.testFunction());
	};

	// test 4 

	var testFunction4 = function(arg1, arg2){
		return arg1 + arg2;
	};

	a.newLiveVar('testFuncFour', testFunction4, 10, 20);

	if(testFlag && a.testFuncFour() == 30){
		console.log('test 4 pass');
	} else{
		console.log('test 4 fail');
		a.testFuncFour();
	};

	// a.newLiveVar('testFuncWithInternalLiveVars', function (stuff){
	// 	return a.myFirstVar + ' ' + a.mySecondVar;
	// }, 'detect liveVars in args...')



	// console.time ('loop1');

	// for(var i = 0; i<1000;i++){
	// 	var testStr = 'testValue' + i;
	// 	a.newLiveVar(testStr, i);
	// };

	// console.timeEnd('loop1');
});