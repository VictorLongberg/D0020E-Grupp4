// queue system
//
var FIFO = require('./FIFO_queue.js');

class queue {

	constructor(name) {
		this.name = name;
		this.l_fifo_q = new FIFO.FIFO_queue();
		//this.socket = socket;
	}

	// update all clients with there position in the queue
	update_positions() {
		var n = 1;
		var s = this.l_fifo_q.last;
		while (s != null) {
			let sl = s.value.get_socketlist();
			sl.forEach((i) => {
				i.emit('update_queue_place', n);
			});
			n++;
			s = s.prev;
		}
	}

	// add a student to the queue and send the position in queue
	add_student(id) {
		this.l_fifo_q.add(id);
		this.update_positions();
	}

	get_first() {
		var first = this.l_fifo_q.remove_last();
		if (first == null) {
			return null;
		} else if (this.l_fifo_q.size == 0) {
			return first;
		} else {
			this.update_positions();
			return first;
		}
	}

	get_n_first(n) {
		var ret = [];
		for (; n > 0; n--) {
			var first = this.get_first();
			if (first == null){
				return ret;
			}
			ret.push(first);
		}
		return ret;
	}

	get_all() {
		var ret = [];
		while (true) {
			var first = this.get_first();
			if (first == null){
				return ret;
			}
			ret.push(first);
		}
	}
}
module.exports = {queue};

function test(){
	console.log("queue test");

	var q = new queue('test', null);

	q.add_student('1');
	q.add_student('2');
	q.add_student('3');

	console.log(q);

	console.log(q.get_first());
	console.log(q.get_first());
	console.log(q.get_first());

	q.add_student('1');
	q.add_student('2');
	q.add_student('3');

	console.log(q.get_n_first(2));
	console.log(q.get_first());
	console.log(q.get_first());

	q.add_student('1');
	q.add_student('2');
	q.add_student('3');

	console.log(q.get_all());
	console.log(q.get_all());
}

//test();
