const xlsx = require("xlsx");
const pool = require("../config/db");
const path = require("path");

module.exports = async function importFaculty() {
  const filePath = path.join(__dirname, "../ta_management_sample_input.xlsx");
  const sheet = xlsx.readFile(filePath).Sheets["faculty"];
  const rows = xlsx.utils.sheet_to_json(sheet);

  for (const row of rows) {
    if (row.is_faculty !== 1) continue;
    const fullName = `${row.first_name} ${row.last_name}`;
    const bilkentId = row.staff_id.toString();
    const email = row.email;

    try {
      const [existing] = await pool.query("SELECT * FROM users WHERE bilkent_id = ?", [bilkentId]);
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO users (bilkent_id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`,
          [bilkentId, email, bilkentId, fullName, "staff"]
        );
        console.log(`✅ Inserted staff: ${fullName}`);
      } else {
        console.log(`⚠️ Skipped existing staff: ${bilkentId}`);
      }
    } catch (err) {
      console.error(`❌ Error inserting staff ${bilkentId}:`, err.message);
    }
  }

  console.log("✅ Faculty import done.");
};