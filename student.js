/** Class representing a Student. */
class Student {
	/**
	 * @param  {string} id id - Session-ID
	 * @param  {string} name name - Name of student
	 */
	constructor(id, name, socket) {
		this.session_id = id;
		this.name = name;
		this.timeJoined = this.timeJoined;
		//this.timeLeft = timeLeft;
		this.msg = [];
		this.socket = socket; // for the socket a student is connected thru
	}

	get_name() {
		return this.name;
	}

	set_name(name) {
		this.name = name;
	}

	get_socket() {
		return this.socket;
	}
}

module.exports = {Student};
