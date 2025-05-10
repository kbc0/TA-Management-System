require('dotenv').config();
const xlsx = require("xlsx");
const User = require("../models/User");
const path = require("path");

async function importUsersFromExcel(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const bilkentId = row.student_id.toString();
      const email = `${bilkentId}@ug.bilkent.edu.tr`;
      const fullName = `TA ${bilkentId}`;
      const password = bilkentId; // default password (can be changed later)

      try {
        const existingUser = await User.findByBilkentId(bilkentId);
        if (!existingUser) {
          await User.create({
            bilkent_id: bilkentId,
            email,
            password,
            full_name: fullName,
            role: "ta",
          });
          console.log(`✅ Inserted user: ${email}`);
        } else {
          console.log(`⚠️  Skipped existing user: ${email}`);
        }
      } catch (error) {
        console.error(`❌ Error inserting user ${bilkentId}:`, error.message);
      }
    }

    console.log("✅ Import finished.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to import users:", err);
    process.exit(1);
  }
}

// Run with Excel path
const excelPath = path.join(__dirname, "../ta_management_sample_input.xlsx");
importUsersFromExcel(excelPath);
