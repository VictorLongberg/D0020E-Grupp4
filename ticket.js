// queue system
//
var student = require('./student.js');

class Ticket {

	constructor(id, student_or_group, message) {
		this.id = id;
		this.entity = student_or_group;
		this.message = message;
	}

	get_message() {
		return message;
	}

	get_socketlist() {
		var ret = [];
		console.log("entity type:", this.entity.class_string());
		if (this.entity.class_string() == "Student") {
			ret.push(this.entity.get_socket());
		} else {
			ret = this.entity.get_socket_list();
		}

		return ret;
	}
}

module.exports = {Ticket}
