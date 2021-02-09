// queue system
//
var FIFO_queue = require('./FIFO_queue.js');

class queue {

	constructor(name, socket) {
		this.name = name;
		this.l_fifo_queue = FIFO_queue();
		this.socket = socket;
	}

	// update all clients with there position in the queue
	update_positions(socket) {
	}

	// add a student to the queue and send the position in queue
	add_student(id, socket) {
		this.l_fifo_queue.add(id);
		update_positions(this.socket);
	}

	get_first() {
		var first = remove_last();
		if (first == null) {
			return null;
		} else if (this.l_fifo_queue.size == 0) {
			return first;
		} else {
			update_positions();
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
	}
}
