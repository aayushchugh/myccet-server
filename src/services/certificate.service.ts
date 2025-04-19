import { generatePdf } from "html-pdf-node";
import fs from "fs";
import path from "path";

interface StudentData {
	student_name: string;
	father_name: string;
	roll_number: string;
	registration_number: string;
	branch: string;
	issue_date: string;
	session: string;
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

		// Replace the SVG src with the data URL
		template = template.replace(
			'src="./certificate.svg"',
			`src="${svgDataUrl}"`
		);

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
