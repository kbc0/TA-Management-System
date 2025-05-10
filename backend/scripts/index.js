const importStudents = require("./importStudents");
const importFaculty = require("./importFaculty");
const importCourses = require("./importCourses");
const importOfferedCourses = require("./importOfferedCourses");
const importRegisteredCourses = require("./importRegisteredCourses");

module.exports = async function runAllImports() {
  console.log("🔄 Starting initial data import...");
  try {
    await importFaculty();
    await importStudents();
    await importCourses();
    await importOfferedCourses();
    await importRegisteredCourses();
    console.log("✅ All data imported.");
  } catch (err) {
    console.error("❌ Import error:", err);
  }
};

