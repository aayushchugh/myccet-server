import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
	createStudent,
	getAllStudents,
	getStudentById,
	updateStudent,
	deleteStudent,
	updateStudentMarks,
	getStudentSemesterMarks,
	getStudentSemesters,
	deleteStudentSemesterMarks,
	createStudentMarksBulk,
} from "./student.service";
import {
	postCreateStudentSchema,
	PutStudentBody,
	PostMarksBody,
	PutMarksBody,
} from "./student.schema";
import { z } from "zod";
import { generateCertificate } from "../../services/certificate.service";
import { format } from "date-fns";

export async function postCreateStudentHandler(
	req: Request<{}, {}, z.infer<typeof postCreateStudentSchema>>,
	res: Response
) {
	try {
		await createStudent(req.body);

		res.status(StatusCodes.CREATED).json({
			message: "Student created successfully",
		});
	} catch (err: any) {
		console.error(err);

		// Handle database constraint violations
		if (err.code === "23505") {
			if (err.constraint === "user_email_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						email: "Account with same email already exists",
					},
				});
			} else if (err.constraint === "user_phone_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						phone: "Account with same phone already exists",
					},
				});
			} else if (
				err.constraint === "student_registration_number_unique" ||
				err.detail?.includes("registration_number")
			) {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						registration_number:
							"Student with same registration number already exists",
					},
				});
			}
			return;
		}

		// Handle custom errors from the service layer
		if (err.message === "Registration number already exists") {
			res.status(StatusCodes.CONFLICT).json({
				errors: {
					registration_number:
						"Student with same registration number already exists",
				},
			});
			return;
		}

		if (err.message === "Email already exists") {
			res.status(StatusCodes.CONFLICT).json({
				errors: {
					email: "Account with same email already exists",
				},
			});
			return;
		}

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getAllStudentsHandler(req: Request, res: Response) {
	try {
		const students = await getAllStudents();

		res.status(StatusCodes.OK).json({
			message: "Students fetched successfully",
			payload: students,
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getStudentHandler(
	req: Request<{ id: string }>,
	res: Response
): Promise<void> {
	try {
		const { id } = req.params;

		const student = await getStudentById(parseInt(id));

		if (!student) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Student not found",
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Student fetched successfully",
			payload: student,
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function putStudentHandler(
	req: Request<{ id: string }, {}, PutStudentBody>,
	res: Response
): Promise<void> {
	try {
		const { id } = req.params;
		const {
			first_name,
			middle_name,
			last_name,
			registration_number,
			email,
			phone,
			father_name,
			mother_name,
			category,
			current_semester_id,
		} = req.body;

		const updatedStudent = await updateStudent(parseInt(id), {
			first_name,
			middle_name,
			last_name,
			registration_number,
			email,
			phone,
			father_name,
			mother_name,
			category,
			current_semester_id,
		});

		if (!updatedStudent) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Student not found",
			});

			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Student updated successfully",
		});
		return;
	} catch (err: any) {
		console.error(err);

		if (err.code === "23505") {
			if (
				err.constraint === "student_email_unique" ||
				err.constraint === "user_email_unique"
			) {
				res.status(StatusCodes.CONFLICT).json({
					errors: { email: "Account with same email already exists" },
				});
				return;
			}
			if (err.constraint === "student_phone_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: { phone: "Account with same phone already exists" },
				});
				return;
			}

			if (err.constraint === "student_registration_number_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						registration_number:
							"Student with same registration number already exists",
					},
				});
			}
		}

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function deleteStudentHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const success = await deleteStudent(parseInt(id));

		if (!success) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Student not found",
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Student deleted successfully",
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function postMarksHandler(
	req: Request<{ id: string }, {}, PostMarksBody>,
	res: Response
) {
	try {
		const { id } = req.params;
		const { semester_id, marks } = req.body;

		// Check if student and semester exist
		const result = await getStudentSemesterMarks(parseInt(id), semester_id);
		if ("error" in result) {
			if (
				result.error === "STUDENT_NOT_FOUND" ||
				result.error === "SEMESTER_NOT_FOUND"
			) {
				res.status(StatusCodes.NOT_FOUND).json({
					message:
						result.error === "STUDENT_NOT_FOUND"
							? "Student not found"
							: "Semester not found",
				});
				return;
			}
			throw new Error(result.error);
		}

		// Separate marks into new and existing
		const existingMarks = result.data.subjects.filter(
			subject =>
				subject.internal_marks !== null || subject.external_marks !== null
		);
		const existingSubjectIds = existingMarks.map(subject => subject.id);

		const newMarks = marks.filter(
			mark => !existingSubjectIds.includes(mark.subject_id)
		);
		const updateMarks = marks.filter(mark =>
			existingSubjectIds.includes(mark.subject_id)
		);

		// Create new marks
		if (newMarks.length > 0) {
			const createResult = await createStudentMarksBulk({
				student_id: parseInt(id),
				semester_id,
				marks: newMarks,
			});

			if ("error" in createResult) {
				throw new Error(createResult.error);
			}
		}

		// Update existing marks
		if (updateMarks.length > 0) {
			await Promise.all(
				updateMarks.map(mark =>
					updateStudentMarks(parseInt(id), {
						internal_marks: mark.internal_marks,
						external_marks: mark.external_marks,
					})
				)
			);
		}

		res.status(StatusCodes.OK).json({
			message: "Marks processed successfully",
			details: {
				created: newMarks.length,
				updated: updateMarks.length,
			},
		});
	} catch (error: any) {
		console.error(error);

		switch (error.code) {
			case "INTERNAL_MARKS_EXCEEDED":
			case "EXTERNAL_MARKS_EXCEEDED":
				res.status(StatusCodes.BAD_REQUEST).json({
					message: error.message,
				});
				break;

			case "SUBJECT_NOT_FOUND":
			case "STUDENT_NOT_FOUND":
			case "SEMESTER_NOT_FOUND":
				res.status(StatusCodes.NOT_FOUND).json({
					message: error.message,
				});
				break;

			default:
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					message: "Internal server error",
				});
		}
	}
}

export async function putMarksHandler(
	req: Request<{ id: string }, {}, PutMarksBody>,
	res: Response
) {
	try {
		const { id } = req.params;
		await updateStudentMarks(parseInt(id), req.body);

		res.status(StatusCodes.OK).json({
			message: "Marks updated successfully",
		});
	} catch (error: any) {
		console.error(error);

		switch (error.code) {
			case "INTERNAL_MARKS_EXCEEDED":
			case "EXTERNAL_MARKS_EXCEEDED":
				res.status(StatusCodes.BAD_REQUEST).json({
					message: error.message,
				});
				break;

			case "SUBJECT_NOT_FOUND":
			case "STUDENT_NOT_FOUND":
			case "SEMESTER_NOT_FOUND":
			case "MARKS_NOT_FOUND":
				res.status(StatusCodes.NOT_FOUND).json({
					message: error.message,
				});
				break;

			default:
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					message: "Internal server error",
				});
		}
	}
}

export async function getStudentSemestersHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const result = await getStudentSemesters(parseInt(id));

		if ("error" in result) {
			if (result.error === "STUDENT_NOT_FOUND") {
				res.status(StatusCodes.NOT_FOUND).json({
					message: "Student not found",
				});
				return;
			}
			throw new Error(result.error);
		}

		res.status(StatusCodes.OK).json({
			message: "Student semesters fetched successfully",
			payload: result.data,
		});
	} catch (error) {
		console.error(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getSemesterMarksHandler(
	req: Request<{ student_id: string; semester_id: string }>,
	res: Response
) {
	try {
		const { student_id, semester_id } = req.params;

		const marks = await getStudentSemesterMarks(
			parseInt(student_id),
			parseInt(semester_id)
		);

		res.status(StatusCodes.OK).json({
			message: "Marks fetched successfully",
			payload: marks,
		});
	} catch (error) {
		console.error(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function deleteSemesterMarksHandler(
	req: Request<{ student_id: string; semester_id: string }>,
	res: Response
) {
	try {
		const { student_id, semester_id } = req.params;

		await deleteStudentSemesterMarks(
			parseInt(student_id),
			parseInt(semester_id)
		);

		res.status(StatusCodes.OK).json({
			message: "Marks deleted successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getProvisionalCertificateHandler(
	req: Request<{ id: string }>,
	res: Response
): Promise<void> {
	try {
		const studentId = parseInt(req.params.id);
		if (isNaN(studentId)) {
			res.status(400).json({
				success: false,
				error: "INVALID_STUDENT_ID",
				message: "Invalid student ID",
			});
			return;
		}

		const student = await getStudentById(studentId);
		if (!student) {
			res.status(404).json({
				success: false,
				error: "STUDENT_NOT_FOUND",
				message: "Student not found",
			});
			return;
		}

		// Get all semesters with marks for the student
		const semestersResult = await getStudentSemesters(studentId);
		if (semestersResult.error || !semestersResult.data) {
			res.status(404).json({
				success: false,
				error: semestersResult.error || "DATA_NOT_FOUND",
				message: "Failed to get student semesters",
			});
			return;
		}

		// Transform semester data into the format expected by generateCertificate
		const semesters = semestersResult.data.semesters.map(semester => {
			const totalMarks = semester.marks.reduce(
				(sum, mark) => sum + (mark.total_marks || 0),
				0
			);
			const totalMaxMarks = semester.marks.reduce(
				(sum, mark) =>
					sum + (mark.total_internal_marks + mark.total_external_marks),
				0
			);

			return {
				semester_number: semester.id,
				date: semester.end_date
					? format(new Date(semester.end_date), "MMM/yyyy")
					: "",
				subjects: semester.marks.map(mark => ({
					title: mark.title,
					marks_obtained: mark.total_marks || 0,
					maximum_marks: mark.total_internal_marks + mark.total_external_marks,
				})),
				total_marks_obtained: totalMarks,
				total_maximum_marks: totalMaxMarks,
			};
		});

		// Calculate overall totals
		const totalMarks = semesters.reduce(
			(sum, sem) => sum + sem.total_marks_obtained,
			0
		);
		const totalMaxMarks = semesters.reduce(
			(sum, sem) => sum + sem.total_maximum_marks,
			0
		);
		const percentage = ((totalMarks / totalMaxMarks) * 100).toFixed(2);

		// Determine division based on percentage
		let division = "";
		if (parseFloat(percentage) >= 60) division = "First Division";
		else if (parseFloat(percentage) >= 50) division = "Second Division";
		else if (parseFloat(percentage) >= 40) division = "Third Division";
		else division = "Fail";

		const result = await generateCertificate({
			student_name: `${student.first_name} ${student.last_name || ""}`,
			father_name: student.father_name || "",
			roll_number: student.registration_number.toString(),
			registration_number: student.registration_number.toString(),
			branch: student.branch?.title || "",
			issue_date: new Date().toISOString(),
			session: "2023-2024", // This should be dynamic based on your requirements
			semesters,
			total_marks: totalMarks.toString(),
			maximum_marks: totalMaxMarks.toString(),
			percentage,
			division,
		});

		// Set response headers for PDF download
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=provisional_certificate_${studentId}.pdf`
		);

		// Send the PDF
		res.send(result);
		return;
	} catch (error) {
		console.error("Error in getProvisionalCertificateHandler:", error);
		res.status(500).json({
			success: false,
			error: "INTERNAL_SERVER_ERROR",
			message: "An unexpected error occurred",
		});
		return;
	}
}
