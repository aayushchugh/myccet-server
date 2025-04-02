import db from "@/db";
import { ExamMarks, examMarksTable } from "@/db/schema/relation";
import logger from "@/libs/logger";

export async function createMarksService(data: {
  subject_id: number;
  student_id: number;
  internal_marks: number;
  external_marks: number;
}) {
  try {
    const [marks] = await db
      .insert(examMarksTable)
      .values({
        student_id: data.student_id,
        internal_marks: data.internal_marks,
        external_marks: data.external_marks,
        subject_id: data.subject_id,
      })
      .returning();

    logger.info(
      `Marks for ${data.student_id} added for ${data.subject_id}`,
      "MARKS",
    );

    return marks;
  } catch (err) {
    logger.error(`Error creating marks`, "MARKS");
    throw err;
  }
}
