// queue system
//
var FIFO = require('./FIFO_queue.js');
var student = require('./student.js');
var ticket = require('./ticket.js');

class queue {

	constructor(name, socket) {
		this.name = name;
		this.l_fifo_q = new FIFO.FIFO_queue();
		this.socket = socket;
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
	add_ticket(ticket) {
		this.l_fifo_q.add(ticket);
		this.update_positions();
	}

	//returns true if student was in queue
	remove_ticket(studID) {
		var tmpt = this.l_fifo_q.last;
		while (tmpt != null) {
			if (tmpt.value.entity.class_string() == "Group"){
				var members = tmpt.value.entity.member_list;
				for (var i = 0; i < members.length; i++){
					if (studID == members[i].get_id()){
						if (tmpt.next == null && tmpt.prev == null){ //lonely
							this.l_fifo_q.first = null;
							this.l_fifo_q.last = null;
						} else if (tmpt.next == null){ //last
							this.l_fifo_q.last = tmpt.prev;
							this.l_fifo_q.last.next = null;
						} else if (tmpt.prev == null){ // first
							this.l_fifo_q.first = tmpt.next;
							this.l_fifo_q.first.prev = null;
						} else { // in the middle
							tmpt.prev.next = tmpt.next;
							tmpt.next.prev = tmpt.prev;
						}
						tmpt.value.entity.get_socket_list().forEach((s) => {
							s.emit('queue_leave_f');
						});
						this.l_fifo_q.size -= 1;
						this.update_positions();

						return true;
					}
				}
			} else if (tmpt.value.entity.class_string() == "Student"){
				if (tmpt.value.entity.get_id() == studID) {
					if (tmpt.next == null && tmpt.prev == null){ //lonely
						this.l_fifo_q.first = null;
						this.l_fifo_q.last = null;
					} else if (tmpt.next == null){ //last
						this.l_fifo_q.last = tmpt.prev;
						this.l_fifo_q.last.next = null;
					} else if (tmpt.prev == null){ // first
						this.l_fifo_q.first = tmpt.next;
						this.l_fifo_q.first.prev = null;
					} else { // in the middle
						tmpt.prev.next = tmpt.next;
						tmpt.next.prev = tmpt.prev;
					}
					tmpt.value.entity.get_socket_list().forEach((s) => {
						s.emit('queue_leave_f');
					});
					this.l_fifo_q.size -= 1;
					this.update_positions();

					return true;
				}
			} else {
				console.log("unsuported entity in remove_ticket");
			}
			tmpt = tmpt.prev;
		}
		return false;
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

	to_json() {
		var arr = this.l_fifo_q.to_array();
		var ret = {
			qname: this.name,
			rarr: []
		};

		//console.log(arr, arr.length);

		for (var i = 0; i < arr.length; i++){
			if (arr[i].entity.class_string() == "Student"){
				var ent = {
					type: "Student",
					name: arr[i].entity.name,
					message: arr[i].message
				}
				ret.rarr.push(ent);
			} else if (arr[i].entity.class_string() == "Group"){
				var ent = {
					type: "Group",
					name: arr[i].entity.name,
					member_list: arr[i].entity.to_json().member_list,
					message: arr[i].message
				}
				ret.rarr.push(ent);
			}
		}

		return JSON.stringify(ret);
	}
}
module.exports = {queue};

function test(){
	console.log("queue test");

	var q = new queue('test', null);

	q.add_ticket('1');
	q.add_ticket('2');
	q.add_ticket('3');

	console.log(q);

	console.log(q.get_first());
	console.log(q.get_first());
	console.log(q.get_first());
}

//test();
