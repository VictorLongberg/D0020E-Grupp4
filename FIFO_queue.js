// Class for handeling FIFO queues
//

class node {
	constructor(prev, value, next) {
		this.prev = prev;
		this.value = value;
		this.next = next;
	}
}

class FIFO_queue {
	constructor() {
		this.first = null;
		this.last = null;
		this.size = 0;
	}

	add(value) {
		if (this.size == 0){
			var n = new node(null, value, null);
			this.first = n;
			this.last = n;
		} else {
			var n = new node(null, value, this.first);
			this.first.prev = n;
			this.first = n;
		}

		this.size += 1;
	}

	remove_last() {
		if (this.size == 0){
			return null;
		}

		var l = this.last;

		if (this.size == 1){
			this.last = null;
			this.first = null;
		} else {
			l.prev.next = null;
			this.last = l.prev;
		}

		this.size -= 1;
		return l.value;
	}

	to_array() {
		var ret = [];

		for (var cur = this.last; cur != null; cur = cur.prev) {
			ret.push(cur.value);
		}
		return ret;
	}
}

module.exports = {FIFO_queue};

function test() {
	console.log("FIFO test");

	var queue = new FIFO_queue();

	queue.add("one");
	queue.add("two");
	queue.add("tree");

	console.log(queue.remove_last());
	console.log(queue.remove_last());

	queue.add("four");
	console.log(queue.remove_last());
	console.log(queue.remove_last());
	console.log(queue.remove_last());
}

//test();
