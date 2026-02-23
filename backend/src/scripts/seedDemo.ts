/**
 * DEMO DATA SEED SCRIPT
 * ---------------------
 * Inserts realistic dummy data so all app features can be tested.
 * Run:   npx ts-node src/scripts/seedDemo.ts
 * Clean: npx ts-node src/scripts/cleanDemo.ts
 *
 * All inserted doc IDs are saved to src/scripts/demo-ids.json so the
 * cleanup script can remove them precisely without touching real data.
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
import { parseKietEmail } from "../utils/parseKietEmail";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kiet-collab";

const IDS_FILE = path.join(__dirname, "demo-ids.json");

// ─── helpers ────────────────────────────────────────────────────────────────

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// ─── seed data definitions ───────────────────────────────────────────────────

/**
 * Build a partial user object with all library fields derived from the
 * KIET institutional email.  Extra fields are merged on top.
 */
function kietUser(
  email: string,
  overrides: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = parseKietEmail(email);
  return {
    email,
    password: "Demo@1234",
    isEmailVerified: true,
    branch: parsed.branch,
    library_id: parsed.library_id,
    library_prefix: parsed.library_prefix,
    library_suffix: parsed.library_suffix,
    batch_start_year: parsed.batch_start_year,
    batch_end_year: parsed.batch_end_year,
    ...overrides,
  };
}

async function seedUsers() {
  console.log("👤  Seeding users...");

  //
  // Email format: name.YYYYbranchNNNN@kiet.edu
  //   YYYY = library_prefix  (e.g. 2327 → batch 2023–2027)
  //   branch letters         (e.g. csit / it / ece / mech)
  //   NNNN = library_suffix  (roll within batch)
  //
  const users = await User.insertMany([
    // ── Admin ──────────────────────────────────────────────────────────────
    kietUser("admin.2315csit0001@kiet.edu", {
      name: "Demo Admin",
      role: "admin",
      bio: "Platform administrator (demo account).",
      skills: ["Node.js", "MongoDB", "DevOps"],
      socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
    }),

    // ── Faculty ────────────────────────────────────────────────────────────
    kietUser("priya.1015csit0001@kiet.edu", {
      name: "Dr. Priya Sharma",
      role: "faculty",
      bio: "Associate Professor, Dept. of CSE. Interested in ML & AI.",
      skills: ["Python", "Machine Learning", "Data Science"],
      socialLinks: { linkedin: "https://linkedin.com" },
    }),
    kietUser("rajiv.0815it0001@kiet.edu", {
      name: "Mr. Rajiv Gupta",
      role: "faculty",
      bio: "Assistant Professor, Dept. of IT. Web technologies enthusiast.",
      skills: ["JavaScript", "React", "Node.js"],
    }),

    // ── Students ───────────────────────────────────────────────────────────
    kietUser("ananya.2327csit1113@kiet.edu", {
      name: "Ananya Singh",
      role: "student",
      bio: "Full-stack dev | Open source contributor",
      skills: ["React", "TypeScript", "Node.js", "MongoDB"],
      socialLinks: { github: "https://github.com" },
    }),
    kietUser("rohan.2327csit1201@kiet.edu", {
      name: "Rohan Verma",
      role: "student",
      bio: "ML enthusiast & competitive programmer.",
      skills: ["Python", "TensorFlow", "C++", "Algorithms"],
    }),
    kietUser("sneha.2428it2045@kiet.edu", {
      name: "Sneha Agarwal",
      role: "student",
      bio: "UI/UX designer & front-end developer.",
      skills: ["Figma", "React", "Tailwind CSS", "HTML/CSS"],
    }),
    kietUser("arjun.2428ece3012@kiet.edu", {
      name: "Arjun Mehta",
      role: "student",
      bio: "IoT & embedded systems hobbyist.",
      skills: ["Arduino", "Raspberry Pi", "Python", "C"],
    }),
    kietUser("pooja.2226csit0987@kiet.edu", {
      name: "Pooja Tiwari",
      role: "student",
      bio: "Backend dev | Cloud computing (AWS/GCP).",
      skills: ["Java", "Spring Boot", "AWS", "Docker"],
    }),
    kietUser("vikram.2327mech4023@kiet.edu", {
      name: "Vikram Yadav",
      role: "student",
      bio: "Interested in CAD and simulation software.",
      skills: ["AutoCAD", "MATLAB", "SolidWorks"],
    }),
    kietUser("ishita.2429it5001@kiet.edu", {
      name: "Ishita Kapoor",
      role: "student",
      bio: "First year, exploring web dev.",
      skills: ["HTML/CSS", "JavaScript", "Python"],
    }),
  ]);

  console.log(`   ✅ ${users.length} users created`);
  return users as unknown as mongoose.Document[];
}

async function seedEvents(adminId: mongoose.Types.ObjectId) {
  console.log("📅  Seeding events...");

  const events = await Event.insertMany([
    {
      title: "KIET HackFest 2026",
      description:
        "Annual 36-hour hackathon open to all KIET students. Build innovative solutions for real-world problems. Cash prizes worth ₹1,50,000!",
      tags: ["hackathon", "web", "mobile", "ai", "iot"],
      rules:
        "- Teams of 2–4 members\n- Projects must be built during the event\n- Use of pre-existing code/APIs is allowed with disclosure\n- Final submission via GitHub repo",
      prizes:
        "🥇 1st Place: ₹75,000\n🥈 2nd Place: ₹40,000\n🥉 3rd Place: ₹20,000\n🏅 Best UI: ₹10,000\n🏅 Best AI: ₹5,000",
      startDate: daysFromNow(10),
      endDate: daysFromNow(11),
      status: "published",
      organizers: [adminId],
      createdBy: adminId,
    },
    {
      title: "Web Dev Sprint — Spring 2026",
      description:
        "A 48-hour web development challenge focused on building responsive, accessible web applications. Open to all years.",
      tags: ["web", "frontend", "backend", "fullstack"],
      rules:
        "- Individual or team (max 3)\n- Must use a web framework\n- Hosted demo required in submission",
      prizes: "🥇 ₹20,000  🥈 ₹10,000  🥉 ₹5,000",
      startDate: daysFromNow(30),
      endDate: daysFromNow(32),
      status: "published",
      organizers: [adminId],
      createdBy: adminId,
    },
    {
      title: "AI/ML Conclave 2025",
      description:
        "Past event: An exhibition of ML models built by KIET students. Showcased projects in NLP, CV, and Predictive Analytics.",
      tags: ["ai", "ml", "nlp", "computer-vision"],
      startDate: daysFromNow(-60),
      endDate: daysFromNow(-59),
      status: "closed",
      organizers: [adminId],
      createdBy: adminId,
    },
  ]);

  console.log(`   ✅ ${events.length} events created`);
  return events;
}

async function seedTeams(users: mongoose.Document[], event: mongoose.Document) {
  console.log("👥  Seeding teams...");

  const [, , , ananya, rohan, sneha, arjun, pooja] = users as any[];
  const eventId = (event as any)._id;

  const teams = await Team.insertMany([
    {
      name: "CodeCraft",
      event: eventId,
      createdBy: ananya._id,
      members: [
        { user: ananya._id, role: "leader" },
        { user: rohan._id, role: "member" },
        { user: sneha._id, role: "member" },
      ],
    },
    {
      name: "ByteBusters",
      event: eventId,
      createdBy: pooja._id,
      members: [
        { user: pooja._id, role: "leader" },
        { user: arjun._id, role: "member" },
      ],
    },
    {
      name: "SoloForge",
      event: eventId,
      createdBy: rohan._id,
      members: [{ user: rohan._id, role: "leader" }],
    },
  ]);

  console.log(`   ✅ ${teams.length} teams created`);
  return teams;
}

async function seedProjects(
  teams: mongoose.Document[],
  users: mongoose.Document[],
  event: mongoose.Document,
) {
  console.log("🚀  Seeding projects...");

  const [team1, team2] = teams as any[];
  const [, , , ananya, , , , pooja] = users as any[];
  const eventId = (event as any)._id;

  const projects = await Project.insertMany([
    {
      title: "SmartCampus Navigator",
      description:
        "A React Native app that provides real-time indoor navigation for KIET campus, integrating BLE beacons and a custom graph-based pathfinding algorithm. Features include accessibility routing, event-based map overlays, and crowd-density heatmaps.",
      repoUrl: "https://github.com/demo/smartcampus-navigator",
      demoUrl: "https://demo.example.com/smartcampus",
      tags: ["react-native", "ble", "maps", "algorithms"],
      submittedBy: ananya._id,
      event: eventId,
      team: team1._id,
      likes: 42,
    },
    {
      title: "MediTrack — Hospital Queue System",
      description:
        "A full-stack web application to manage outpatient queues at hospitals. Patients register online, receive a token, and track estimated wait time via a live dashboard. Backend built with Node.js + MongoDB.",
      repoUrl: "https://github.com/demo/meditrack",
      demoUrl: "https://demo.example.com/meditrack",
      tags: ["node.js", "react", "mongodb", "realtime"],
      submittedBy: pooja._id,
      event: eventId,
      team: team2._id,
      likes: 35,
    },
  ]);

  console.log(`   ✅ ${projects.length} projects created`);
  return projects;
}

async function seedQuestions(users: mongoose.Document[]) {
  console.log("❓  Seeding Q&A questions...");

  const [, faculty1, , ananya, rohan, sneha, , pooja] = users as any[];

  const questions = await Question.insertMany([
    {
      title: "How do I set up a JWT refresh token flow in Express?",
      content:
        "I understand access tokens and refresh tokens conceptually, but I'm struggling with the implementation. Specifically: where should the refresh token be stored (cookie vs localStorage), and how do I implement the silent-refresh mechanism without exposing the user to flashes of the login screen?",
      tags: ["node.js", "jwt", "express", "authentication"],
      author: ananya._id,
      votes: 18,
      answers: [
        {
          content:
            "Store the refresh token in an **httpOnly cookie** with `SameSite=Strict` — this prevents XSS access. Your access token can live in memory (a React context/state). On page reload, hit a `/auth/refresh` endpoint which reads the cookie and issues a new access token. This is the most secure approach for SPAs.",
          author: pooja._id,
          votes: 12,
        },
        {
          content:
            "Avoid `localStorage` for refresh tokens — any XSS vulnerability will expose them immediately. The cookie approach Pooja mentions is the industry standard. Also make sure to implement token rotation: each use of the refresh token issues a new one and invalidates the old one.",
          author: faculty1._id,
          votes: 8,
        },
      ],
    },
    {
      title: "What is the difference between useMemo and useCallback in React?",
      content:
        "I know both hooks are for performance optimization and memoization, but I often confuse when to use which. Can someone explain with a practical example covering the exact difference and when each is appropriate?",
      tags: ["react", "hooks", "performance", "javascript"],
      author: sneha._id,
      votes: 24,
      answers: [
        {
          content:
            "`useMemo` memoizes a **computed value**: `const sortedList = useMemo(() => list.sort(...), [list])`.\n`useCallback` memoizes a **function reference**: `const handleClick = useCallback(() => doSomething(id), [id])`.\nUse `useCallback` when passing callbacks to child components wrapped in `React.memo`, and `useMemo` for expensive calculations whose result you re-use.",
          author: ananya._id,
          votes: 19,
        },
      ],
    },
    {
      title: "Best practices for structuring a large-scale MongoDB schema?",
      content:
        "Our team project is growing quickly and we're debating between embedding sub-documents vs referencing separate collections. When should I embed and when should I reference? Also, any advice on indexing strategy for text search?",
      tags: ["mongodb", "database", "schema-design", "indexing"],
      author: rohan._id,
      votes: 31,
      answers: [
        {
          content:
            '**Embed** when: data is always read together, the subdoc is not shared across docs, and it will not grow unboundedly (e.g. user preferences, address).\n**Reference** when: data is large, shared between many docs, or updated independently (e.g. users ↔ teams).\nFor text search, add a compound text index on the fields you query: `db.collection.createIndex({ title: "text", description: "text", tags: "text" })`.',
          author: faculty1._id,
          votes: 26,
        },
        {
          content:
            "Also worth noting: with MongoDB Atlas you get free Atlas Search backed by Lucene which is far more powerful than the built-in $text. Definitely worth evaluating for the Q&A forum feature.",
          author: pooja._id,
          votes: 7,
        },
      ],
    },
    {
      title: "How to implement real-time notifications with Socket.IO?",
      content:
        "I need to push notifications to specific users when something happens (e.g., they get added to a team). I have Socket.IO set up but unsure how to target a specific user since socket IDs change on reconnect.",
      tags: ["socket.io", "websockets", "realtime", "node.js"],
      author: ananya._id,
      votes: 15,
      answers: [
        {
          content:
            "Join each socket to a **private room** named after the user's ID when they connect:\n```js\nsocket.join(`user:${userId}`);\n```\nThen emit to that room from anywhere in your server:\n```js\nio.to(`user:${userId}`).emit('notification', payload);\n```\nThis survives reconnections because the user rejoins their room on each new socket connection.",
          author: rohan._id,
          votes: 11,
        },
      ],
    },
  ]);

  console.log(`   ✅ ${questions.length} questions created`);
  return questions;
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  KIET Collab — Demo Seed Script");
  console.log("====================================\n");

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log("✅  Connected to MongoDB\n");

  // Guard: don't double-seed
  const existing = await User.findOne({ email: "admin.2315csit0001@kiet.edu" });
  if (existing) {
    console.log(
      "⚠️   Demo data already exists (admin.2315csit0001@kiet.edu found).\n" +
        "    Run  npx ts-node src/scripts/cleanDemo.ts  first to remove it.\n",
    );
    await mongoose.disconnect();
    return;
  }

  const users = await seedUsers();
  const events = await seedEvents((users[0] as any)._id);
  const teams = await seedTeams(users, events[0]);
  const projects = await seedProjects(teams, users, events[0]);
  const questions = await seedQuestions(users);

  // ── Link teams & projects back on the Event ──
  await Event.findByIdAndUpdate((events[0] as any)._id, {
    $set: {
      teams: teams.map((t: any) => t._id),
      registrations: [
        ...(users.slice(3) as any[]).map((u: any) => ({
          user: u._id,
          registeredAt: new Date(),
        })),
      ],
    },
  });

  // ── Save IDs to JSON for easy cleanup ──
  const ids = {
    _note: "Auto-generated by seedDemo.ts — remove with cleanDemo.ts",
    users: users.map((d: any) => d._id.toString()),
    events: events.map((d: any) => d._id.toString()),
    teams: teams.map((d: any) => d._id.toString()),
    projects: projects.map((d: any) => d._id.toString()),
    questions: questions.map((d: any) => d._id.toString()),
  };
  fs.writeFileSync(IDS_FILE, JSON.stringify(ids, null, 2));
  console.log(`\n📄  IDs saved to ${IDS_FILE}`);

  console.log("\n🎉  Demo seed complete!");
  console.log("─────────────────────────────────────");
  console.log(`   Users    : ${users.length}`);
  console.log(`   Events   : ${events.length}`);
  console.log(`   Teams    : ${teams.length}`);
  console.log(`   Projects : ${projects.length}`);
  console.log(`   Questions: ${questions.length}`);
  console.log("\n   Login credentials (all accounts):");
  console.log("   Password : Demo@1234");
  console.log(
    "   Admin    : admin.2315csit0001@kiet.edu   (library_id: 2315CSIT0001)",
  );
  console.log(
    "   Faculty  : priya.1015csit0001@kiet.edu  (library_id: 1015CSIT0001)",
  );
  console.log(
    "   Student  : ananya.2327csit1113@kiet.edu (library_id: 2327CSIT1113)",
  );
  console.log("─────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
