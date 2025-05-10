const xlsx = require("xlsx");
const pool = require("../config/db");
const path = require("path");

module.exports = async function importStudents() {
  const filePath = path.join(__dirname, "../ta_management_sample_input.xlsx");
  const sheet = xlsx.readFile(filePath).Sheets["students"];
  const rows = xlsx.utils.sheet_to_json(sheet);

  for (const row of rows) {
    const bilkentId = row.student_id.toString();
    const email = row.email;
    const fullName = `${row.first_name} ${row.last_name}`;
    const role = row.is_ta === 1 ? "ta" : "ta";

    try {
      const [existing] = await pool.query("SELECT * FROM users WHERE bilkent_id = ?", [bilkentId]);
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO users (bilkent_id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`,
          [bilkentId, email, bilkentId, fullName, role]
        );
        console.log(`✅ Inserted student: ${fullName}`);
      } else {
        console.log(`⚠️ Skipped existing student: ${bilkentId}`);
      }
    } catch (err) {
      console.error(`❌ Error inserting student ${bilkentId}:`, err.message);
    }
  }

  console.log("✅ Student import done.");
};