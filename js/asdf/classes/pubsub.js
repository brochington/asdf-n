// Why choose pubsub over event emitters? Can I use Object.observe?

define(['lodash'], function (_){
	console.log('pubsub is loaded!');
	var ns = {},
		topics = {},
		uid = 0;

	ns.addToTopics = function(topicName, callback){
		topics[topicName] =[];

		if(callback){ callback(); };
	};

	ns.publish = function(topicName){
		console.log('publish!')
		var subscribers = topics[topicName];

		// which is faster here? for loop, forEach, or lodash .each?
		// test using console timer. 
		topics[topicName].forEach(function (v, i, arr){
			subscribers[i].functionToCall();
		});

	};

	ns.subscribe = function(topicName, functionToCall){
		console.log('subscribe!');
		var token = ++uid;

		if(!topics[topicName]){ns.addToTopics(topicName)};

		topics[topicName].push({
			token: token,
			functionToCall: functionToCall,
			name: topicName
		});

		return token;
	};

	ns.getTopics = function(){
		return topics;
	};

	ns.updateSubscribers = function(){

	};

	return ns;
})