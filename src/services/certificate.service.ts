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

	// Semester data
	sem1_date?: string;
	sem1_marks?: string;
	sem1_total?: string;
	sem2_date?: string;
	sem2_marks?: string;
	sem2_total?: string;
	sem3_date?: string;
	sem3_marks?: string;
	sem3_total?: string;
	sem4_date?: string;
	sem4_marks?: string;
	sem4_total?: string;
	sem5_date?: string;
	sem5_marks?: string;
	sem5_total?: string;
	sem6_date?: string;
	sem6_marks?: string;
	sem6_total?: string;

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

		// Replace semester data placeholders
		if (data.sem1_date)
			template = template.replace(/{sem1_date}/g, data.sem1_date);
		if (data.sem1_marks)
			template = template.replace(/{sem1_marks}/g, data.sem1_marks);
		if (data.sem1_total)
			template = template.replace(/{sem1_total}/g, data.sem1_total);
		if (data.sem2_date)
			template = template.replace(/{sem2_date}/g, data.sem2_date);
		if (data.sem2_marks)
			template = template.replace(/{sem2_marks}/g, data.sem2_marks);
		if (data.sem2_total)
			template = template.replace(/{sem2_total}/g, data.sem2_total);
		if (data.sem3_date)
			template = template.replace(/{sem3_date}/g, data.sem3_date);
		if (data.sem3_marks)
			template = template.replace(/{sem3_marks}/g, data.sem3_marks);
		if (data.sem3_total)
			template = template.replace(/{sem3_total}/g, data.sem3_total);
		if (data.sem4_date)
			template = template.replace(/{sem4_date}/g, data.sem4_date);
		if (data.sem4_marks)
			template = template.replace(/{sem4_marks}/g, data.sem4_marks);
		if (data.sem4_total)
			template = template.replace(/{sem4_total}/g, data.sem4_total);
		if (data.sem5_date)
			template = template.replace(/{sem5_date}/g, data.sem5_date);
		if (data.sem5_marks)
			template = template.replace(/{sem5_marks}/g, data.sem5_marks);
		if (data.sem5_total)
			template = template.replace(/{sem5_total}/g, data.sem5_total);
		if (data.sem6_date)
			template = template.replace(/{sem6_date}/g, data.sem6_date);
		if (data.sem6_marks)
			template = template.replace(/{sem6_marks}/g, data.sem6_marks);
		if (data.sem6_total)
			template = template.replace(/{sem6_total}/g, data.sem6_total);

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
