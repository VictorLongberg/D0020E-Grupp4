/** Class representing a Student. */
class Teacher {
	/**
	 * @param  {string} id id - Session-ID
	 * @param  {string} name name - Name of Teacher
	 */
	constructor(id, name, socket) {
		this.session_id = id;
		this.name = name;
		//this.timeJoined = this.timeJoined;
		//this.timeLeft = timeLeft;
		this.socket = socket; // for the socket a teacher is connected thru
	}
    
    //Skapa en Lecture med unique ID
    create_lecture(){
        return true
    }

	get_name() {
		return this.name;
	}

	set_name(name) {
		this.name = name;
	}

	set_session(session){
		this.session = session;
	}

	get_session(){
		return this.session;
	}
	
	get_socket() {
		return this.socket;
	}

	// to distiguish from group
	class_string() {
		return "Student";
	}
}

module.exports = {Teacher};
