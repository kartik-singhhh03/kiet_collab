/**
 * DEMO DATA CLEANUP SCRIPT
 * ------------------------
 * Removes ALL demo data inserted by seedDemo.ts using the saved IDs in
 * src/scripts/demo-ids.json. No real user data is touched.
 *
 * Run:  npx ts-node src/scripts/cleanDemo.ts
 */

import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import User from "../models/User";
import Event from "../models/Event";
import Team from "../models/Team";
import Project from "../models/Project";
import Question from "../models/Question";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kiet-collab";
const IDS_FILE = path.join(__dirname, "demo-ids.json");

async function main() {
  console.log("\n🧹  KIET Collab — Demo Clean Script");
  console.log("=====================================\n");

  if (!fs.existsSync(IDS_FILE)) {
    console.log(
      "⚠️   demo-ids.json not found.\n" +
        "    Run  npx ts-node src/scripts/seedDemo.ts  first to create demo data.\n",
    );
    return;
  }

  const ids = JSON.parse(fs.readFileSync(IDS_FILE, "utf-8"));

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log("✅  Connected to MongoDB\n");

  const toIds = (arr: string[]) =>
    arr.map((id) => new mongoose.Types.ObjectId(id));

  const [uRes, eRes, tRes, pRes, qRes] = await Promise.all([
    User.deleteMany({ _id: { $in: toIds(ids.users) } }),
    Event.deleteMany({ _id: { $in: toIds(ids.events) } }),
    Team.deleteMany({ _id: { $in: toIds(ids.teams) } }),
    Project.deleteMany({ _id: { $in: toIds(ids.projects) } }),
    Question.deleteMany({ _id: { $in: toIds(ids.questions) } }),
  ]);

  console.log("🗑️   Deleted:");
  console.log(`   Users    : ${uRes.deletedCount}`);
  console.log(`   Events   : ${eRes.deletedCount}`);
  console.log(`   Teams    : ${tRes.deletedCount}`);
  console.log(`   Projects : ${pRes.deletedCount}`);
  console.log(`   Questions: ${qRes.deletedCount}`);

  // Remove the IDs file
  fs.unlinkSync(IDS_FILE);
  console.log("\n✅  demo-ids.json removed.");
  console.log("🎉  All demo data cleaned up.\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Clean failed:", err.message);
  process.exit(1);
});
