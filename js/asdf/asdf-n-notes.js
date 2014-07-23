// asdf usecase:

// Question: how am I going to take out logic from the template portion of the code?

// create forEach of a domNode... 

// Create a basic todo app, starting with a simple click on elements appends a dom node into another.

d.clickBtn = new asdfEvent('stuff', function(){console.log('stuff, man.')});


domNode.onclick = function(){
	console.log('traditional...');
	$('.something').append(templateThing);
};

a.newVar.events('appendDom', {
	click: function(ev, curried){

	},
	dragover: function(ev)

})

a.myVar = d.clickBtn.click('curryValue');

//controller replacement...

// example of 
<button type="button" class="clickBtn">Add Task</button>
<input type="textarea" class="someTextArea">

<div class="containerDom">
	hello, ${name}!
	${tasks}
</div>

// prevent showing of templates by assigning a 'display: none' to them?
<div class="task" data-asdfTemplate>
	task #${taskNumber}.
</div>

d.containerDom.forEach(d.task, [{taskNumber: 1},{taskNumber: 2}]);
// or
d.containerDom.forEach(d.task, a.tasks);

d.containerDom.forEach(/*d to repeat*/, /*array of objects with props to use in each d*/)
d.containerDom.ifElse(/*arg to evaluate*/, /*if true*/, /*else*/);
d.containerDom.show(a.showContainerDom);
d.containerDom.actions({
	show: a.showContainerDom,
	ifElse: [/*arg to evaluate*/, /*if true*/, /*else*/]
});


/*****************************************/
a.newVar('tasks', []);

a.tasks.events({
	click: function(ev, selfValue){
		selfValue.push(new Task(ev));
	}
});

// OR:

a.newVar('tasks', []).events({
	click: function(ev, selfValue){
		selfValue.push(new Task(ev));
	}
});

/*****************************************/

a.tasks = d.clickBtn.click;

d.containerDom.forEach(d.task, a.tasks);

a.newVar('inputValue', {
	get: function(){

	},
	set: function(val) {

	}
	internalValue: 
})


a.inputValue = d.someTextArea.value;



