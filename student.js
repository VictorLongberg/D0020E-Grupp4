
/** Class representing a Student. */
class Student {
	/**
	 * @param  {string} id id - Session-ID
	 * @param  {string} name name - Name of student
	 */
	constructor(id, name) {
		this.session_id = id;
		this.name = name;
		this.timeJoined = this.timeJoined;
		//this.timeLeft = timeLeft;
		this.msg = [];
	}

	get_name() {
		return this.name;
	}

	set_name(name) {
		this.name = name;
	}
}

module.exports = {Student};
