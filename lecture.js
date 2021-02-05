var student = require('./student.js');

/** Class representing a Lecture. */
class Lecture {
	constructor(){
		this.students = [];
	}

	get_student_by_id(id){
		for (var i = 0; i < this.students.length; i++){
			if (this.students[i].session_id == id){
				return this.students[i];
			}
		}
		return null;
	}

	student_exist(id){
		if (this.get_student_by_id(id) == null){
			return false;
		}
		return true;
	}

	add_student(id, name){
		var stud = this.get_student_by_id(id);
		if (stud == null){
			var stud = new student.Student(id, name);
			this.students.push(stud);
		} else {
			stud.set_name(name);
		}
	}

	get_student_name(id){
		var student = this.get_student_by_id(id);
		if (student == null){
			return "Unknown";
		}
		return student.get_name();
	}
}

module.exports = {Lecture};
