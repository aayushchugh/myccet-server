import { generatePdf } from "html-pdf-node";
import fs from "fs";
import path from "path";
import { format } from "date-fns";

interface StudentData {
	student_name: string;
	father_name: string;
	roll_number: string;
	registration_number: string;
	branch: string;
	issue_date: string; // keep as ISO string or Date-compatible
	session: string;
	// Additional fields matching the placeholders in the certificate
	session_start?: string;
	session_end?: string;
	exam_session?: string;
	state_board_roll?: string;
	notification_number?: string;
	notification_date?: string;
	diploma_name?: string;
	conduct?: string;

	// Dynamic semester data
	semesters: {
		semester_number: number;
		date: string;
		subjects: {
			title: string;
			marks_obtained: number;
			maximum_marks: number;
		}[];
		total_marks_obtained: number;
		total_maximum_marks: number;
	}[];

	// Summary data
	total_marks?: string;
	maximum_marks?: string;
	percentage?: string;
	division?: string;
}

export async function generateCertificate(data: StudentData) {
	try {
		// Get the absolute path to the template file
		const templatePath = path.join(process.cwd(), "src", "certificate.html");
		const svgPath = path.join(process.cwd(), "src", "certificate.svg");

		if (!fs.existsSync(templatePath)) {
			console.error("Certificate template not found at:", templatePath);
			return {
				error: "TEMPLATE_NOT_FOUND",
				details: "Certificate template not found",
			};
		}

		if (!fs.existsSync(svgPath)) {
			console.error("Certificate SVG not found at:", svgPath);
			return {
				error: "SVG_NOT_FOUND",
				details: "Certificate SVG not found",
			};
		}

		// Read the SVG file and convert it to a data URL
		const svgContent = fs.readFileSync(svgPath, "utf-8");
		const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(
			svgContent
		).toString("base64")}`;

		// Read and prepare the template
		let template = fs.readFileSync(templatePath, "utf-8");

		template = template.replace(`{svg}`, svgDataUrl);

		// Replace placeholders with data values using {} format
		template = template.replace(/{name}/g, data.student_name || "");
		template = template.replace(/{father_name}/g, data.father_name || "");
		template = template.replace(/{roll_number}/g, data.roll_number || "");
		template = template.replace(
			/{registration_number}/g,
			data.registration_number || ""
		);
		template = template.replace(/{branch}/g, data.branch || "");
		template = template.replace(/{session_start}/g, data.session_start || "");
		template = template.replace(/{session_end}/g, data.session_end || "");
		template = template.replace(
			/{issue_date}/g,
			format(new Date(data.issue_date), "dd/MM/yyyy") || ""
		);

		// Replace additional placeholders if data is available
		if (data.exam_session)
			template = template.replace(/{exam_session}/g, data.exam_session);
		if (data.state_board_roll)
			template = template.replace(/{state_board_roll}/g, data.state_board_roll);
		if (data.notification_number)
			template = template.replace(
				/{notification_number}/g,
				data.notification_number
			);
		if (data.notification_date)
			template = template.replace(
				/{notification_date}/g,
				data.notification_date
			);
		if (data.diploma_name)
			template = template.replace(/{diploma_name}/g, data.diploma_name);
		if (data.conduct) template = template.replace(/{conduct}/g, data.conduct);

		// Generate dynamic semester table HTML
		let semesterTableHtml = `
			<table style="width: 100%; text-align: center; font-weight: 200; font-size: 14px;">
				<tr>
					<th style="font-weight: 400">Semester</th>
					<th style="font-weight: 400">Month/Year of Examination</th>
					<th style="font-weight: 400">Mark's Obtained</th>
					<th style="font-weight: 400">Maximum Marks</th>
				</tr>
		`;

		// Add rows for each semester
		data.semesters.forEach(semester => {
			semesterTableHtml += `
				<tr>
					<td>${semester.semester_number}${getOrdinalSuffix(
				semester.semester_number
			)}</td>
					<td>${semester.date}</td>
					<td>${semester.total_marks_obtained}</td>
					<td>${semester.total_maximum_marks}</td>
				</tr>
			`;
		});

		semesterTableHtml += `</table>`;

		// Replace the static table with the dynamic one
		template = template.replace(/<table[\s\S]*?<\/table>/, semesterTableHtml);

		// Replace summary placeholders
		if (data.total_marks)
			template = template.replace(/{total_marks}/g, data.total_marks);
		if (data.maximum_marks)
			template = template.replace(/{maximum_marks}/g, data.maximum_marks);
		if (data.percentage)
			template = template.replace(/{percentage}/g, data.percentage);
		if (data.division)
			template = template.replace(/{division}/g, data.division);

		const pdfBuffer = await generatePdf(
			{ content: template },
			{ format: "A4" }
		);

		return pdfBuffer;
	} catch (error) {
		console.error("Error generating certificate:", error);
		return {
			error: "PDF_GENERATION_ERROR",
			details: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// Helper function to get ordinal suffix
function getOrdinalSuffix(n: number): string {
	const j = n % 10;
	const k = n % 100;
	if (j === 1 && k !== 11) return "st";
	if (j === 2 && k !== 12) return "nd";
	if (j === 3 && k !== 13) return "rd";
	return "th";
}
