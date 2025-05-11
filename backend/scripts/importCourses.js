const xlsx = require("xlsx");
const pool = require("../config/db");
const path = require("path");

module.exports = async function importCourses() {
  const filePath = path.join(__dirname, "../ta_management_sample_input.xlsx");
  const sheet = xlsx.readFile(filePath).Sheets["courses"];
  const rows = xlsx.utils.sheet_to_json(sheet);

  for (const row of rows) {
    const courseCode = `${row.department_code}${row.course_no}`;
    const courseName = row.course_name;

    try {
      const [existing] = await pool.query("SELECT * FROM courses WHERE course_code = ?", [courseCode]);
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO courses (course_code, course_name, department, semester) VALUES (?, ?, ?, ?)`,
          [courseCode, courseName, row.department_code, ""]
        );
        console.log(`✅ Inserted course: ${courseCode}`);
      } else {
        console.log(`⚠️ Skipped existing course: ${courseCode}`);
      }
    } catch (err) {
      console.error(`❌ Error inserting course ${courseCode}:`, err.message);
    }
  }

  console.log("✅ Course import done.");
};