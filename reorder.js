const WorkSchema = require("./models/works.js");
const MediaSchema = require("./models/media.js");

async function reorderWorks() {
  const records = await WorkSchema.find().sort({ order: 1 }); // Sort by `_id` (or other field if needed)

  // Reorder records
  let counter = 1;
  for (const record of records) {
    await WorkSchema.updateOne(
      { _id: record._id },
      { $set: { order: counter } } // Replace 'order' with your field name
    );
    counter++;
  }

  console.log("Records reordered successfully!");
}

async function reorderMedia() {
  const records = await MediaSchema.find().sort({ order: 1 }); // Sort by `_id` (or other field if needed)

  // Reorder records
  let counter = 1;
  for (const record of records) {
    await MediaSchema.updateOne(
      { _id: record._id },
      { $set: { order: counter } } // Replace 'order' with your field name
    );
    counter++;
  }

  console.log("Records reordered successfully!");
}

module.exports = { reorderMedia, reorderWorks };
