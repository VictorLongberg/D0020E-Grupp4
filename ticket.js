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
		if (typeof(this.entity) == "student") {
			ret.push(this.entity.get_socket());
		} else {
			// unsuported
		}

		return ret;
	}
}

module.exports = {Ticket}
