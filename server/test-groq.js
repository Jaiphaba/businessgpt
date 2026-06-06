import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

console.log("=========================================");
console.log("🔍 DIAGNOSTIC LOG START");
console.log("=========================================");
console.log("Raw API Key from process.env:", process.env.GROQ_API_KEY ? "FOUND (Starts with " + process.env.GROQ_API_KEY.substring(0, 5) + "...)" : "❌ NOT FOUND / UNDEFINED");

if (!process.env.GROQ_API_KEY) {
  console.log("\n❌ ERROR: Your .env file is either named incorrectly, in the wrong folder, or empty.");
  process.exit(1);
}

try {
  console.log("\n⏳ Attempting to initialize Groq SDK client...");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log("✅ Groq SDK Client initialized without crashing!");

  console.log("\n⏳ Sending a micro-test request to Groq cloud...");
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: "Say the word hello" }],
    model: "llama3-8b-8192",
  });

  console.log("\n🎉 SUCCESS! Groq responded with:");
  console.log("👉", chatCompletion.choices[0]?.message?.content);
  console.log("=========================================");
} catch (error) {
  console.log("\n💥 CRASH DETECTED DURING RUNTIME:");
  console.error(error);
  console.log("=========================================");
}