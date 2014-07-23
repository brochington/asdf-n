require([
	'asdf/asdf',
	'lodash'
	], function (asdf, _){

	window.asdf = asdf;
	var a = asdf.LiveVar,
		d = asdf.Dom,
		testFlag = false;



	a.newLiveVar('myFirstVar', 'Hello');
	a.newLiveVar('mySecondVar', 'SecondVar');
	a.newLiveVar('myThird', 'third');

	// test 1

	// a.myFirstVar = 'there';
	// if(a.myFirstVar() == 'there' && testFlag){
	// 	console.log('test 1 pass');
	// }else{
	// 	console.log('test 1 fail');
	// };

	// test 2

	// a.myFirstVar = 'update in test 2';
	// a.mySecondVar = a.myFirstVar;
	// a.myFirstVar = 'update in test again';

	// if(testFlag && a.mySecondVar() == 'update in test again'){
	// 	console.log('test 2 pass');
	// }else{
	// 	console.log('test 2 fail');
	// }

	// test 3

	var test3Function = function(text){
		// console.log('test 3 print: ' + text);
		return 'test 3 return: ' + text;
	};

	a.newLiveVar('testFunction', test3Function, {myarg1: 'starting value'});

	// if(testFlag && a.testFunction() == 'test 3 return: starting value'){
	// 	console.log('test 3 pass');
	// }else{
	// 	console.log('test 3 fail');
	// 	console.log(a.testFunction());
	// };

	// test 4 

	var testFunction4 = function(arg1, arg2){
		return arg1 + arg2;
	};

	a.newLiveVar('testFuncFour', testFunction4, {arg1: 10, arg2: 20});

	// if(testFlag && a.testFuncFour() == 30){
	// 	console.log('test 4 pass');
	// } else{
	// 	console.log('test 4 fail');
	// 	a.testFuncFour();
	// };

	// test 5

	// a.myFirstVar = 'first';
	// a.mySecondVar = 'second';

	// console.log(a.mySecondVar.asdfType);

	// a.newLiveVar('testFuncWithInternalLiveVars', function (stuff){
	// 	console.log('run testFuncWithInternalLiveVars');

	// 	return a.myFirstVar() + ' ' + a.mySecondVar();

	// }, {arg1: 'detect liveVars in args...'});

	// if(testFlag && a.testFuncWithInternalLiveVars() == 'first second'){
	// 	console.log('test 5 pass');
	// } else {
	// 	console.log('test 5 fail');
	// 	console.log(a.testFuncWithInternalLiveVars());
	// }

	// test 6

	// a.mySecondVar = 'change';

	// console.log(a.testFuncWithInternalLiveVars());

	// if(testFlag && a.testFuncWithInternalLiveVars() == 'first change'){
	// 	console.log('test 6 pass');
	// } else {
	// 	console.log('test 6 fail');
	// 	console.log(a.testFuncWithInternalLiveVars());
	// };

	var testCount = 1;
	var cancelAnim = requestAnimationFrame(runTest);

	function runTest(){

		for(var i = 1; i<= 200; i++){
			// console.log('here');
			var testDiv = d[('test_div_' + i)];

			console.log(('test_div_' + i), testDiv.width);

			testDiv.width = (parseInt(testDiv.width) + 2) + 'px';
			console.log((parseInt(testDiv.width) + 2) + 'px');
			if((parseInt(testDiv.width)) > 200){
				console.log('reset');
				testDiv.width = '20px';
			};
		};
		// cancelAnim = requestAnimationFrame(runTest);
	};

	// runTest();

	// console.time ('loop1');

	// for(var i = 0; i<1000;i++){
	// 	var testStr = 'testValue' + i;
	// 	a.newLiveVar(testStr, i);
	// };

	// console.timeEnd('loop1');
});

