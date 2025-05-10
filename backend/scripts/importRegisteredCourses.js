const xlsx = require("xlsx");
const pool = require("../config/db");
const path = require("path");

module.exports = async function importRegisteredCourses() {
  const filePath = path.join(__dirname, "../ta_management_sample_input.xlsx");
  const sheet = xlsx.readFile(filePath).Sheets["registered_courses"];
  const rows = xlsx.utils.sheet_to_json(sheet);

  for (const row of rows) {
    const courseCode = `${row.department_code}${row.course_no}`;

    const [[course]] = await pool.query(
      "SELECT * FROM courses WHERE course_code = ? AND semester = ?",
      [courseCode, row.semester]
    );
    if (!course) {
      console.log(`❌ Course not found: ${courseCode} ${row.semester}`);
      continue;
    }

    const [[student]] = await pool.query("SELECT * FROM users WHERE bilkent_id = ?", [row.student_id.toString()]);
    if (!student) {
      console.log(`❌ Student not found: ${row.student_id}`);
      continue;
    }

    try {
      await pool.query(
        `INSERT IGNORE INTO course_tas (course_id, ta_id, hours_per_week, start_date, end_date, status)
         VALUES (?, ?, ?, CURDATE(), CURDATE(), ?)`,
        [course.id, student.id, 10, "active"]
      );
      console.log(`✅ Registered student ${row.student_id} to ${courseCode}`);
    } catch (err) {
      console.error(`❌ Error registering student ${row.student_id}:`, err.message);
    }
  }

  console.log("✅ Student registrations import done.");
};