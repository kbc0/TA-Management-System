const xlsx = require("xlsx");
const pool = require("../config/db");
const path = require("path");

module.exports = async function importOfferedCourses() {
  const filePath = path.join(__dirname, "../ta_management_sample_input.xlsx");
  const sheet = xlsx.readFile(filePath).Sheets["offered_courses"];
  const rows = xlsx.utils.sheet_to_json(sheet);

  for (const row of rows) {
    const courseCode = `${row.department_code}${row.course_no}`;

    const [[course]] = await pool.query("SELECT * FROM courses WHERE course_code = ?", [courseCode]);
    if (!course) {
      console.log(`❌ Course not found: ${courseCode}`);
      continue;
    }

    const [[staff]] = await pool.query("SELECT * FROM users WHERE bilkent_id = ?", [row.staff_id.toString()]);
    if (!staff) {
      console.log(`❌ Staff not found: ${row.staff_id}`);
      continue;
    }

    try {
      await pool.query(
        "UPDATE courses SET semester = ?, instructor_id = ? WHERE id = ?",
        [row.semester, staff.id, course.id]
      );
      console.log(`✅ Updated offering: ${courseCode}`);
    } catch (err) {
      console.error(`❌ Error updating course ${courseCode}:`, err.message);
    }
  }

  console.log("✅ Offered courses import done.");
};