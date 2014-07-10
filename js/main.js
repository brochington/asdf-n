require([
	'asdf/asdf',
	'lodash'
	], function (asdf, _){

	window.asdf = asdf;
	var a = asdf.LiveVar;


	a.newLiveVar('myFirstVar', 'Hello');
	a.newLiveVar('mySecondVar', 'SecondVar');
	a.newLiveVar('myThird', 'third');

	// test 1

	// console.log('test 1:', a.myFirstVar);

	// a.myFirstVar = 'there';

	// console.log('test 1:', a.myFirstVar);

	// test 2

	// console.log('test 2: ', a.mySecondVar);
	console.log('test 2:', a.mySecondVar());

	a.myFirstVar = 'update in test 2';

	// console.log('test 2:', a.mySecondVar);
	console.log('test 2:', a.mySecondVar());

	a.mySecondVar = a.myFirstVar;

	a.myFirstVar = 'update in test again';

	// console.log('test 2:', a.mySecondVar);
	console.log('test 2:', a.mySecondVar());



	// console.time ('loop1');

	// for(var i = 0; i<1000;i++){
	// 	var testStr = 'testValue' + i;
	// 	a.newLiveVar(testStr, i);
	// };

	// console.timeEnd('loop1');
});