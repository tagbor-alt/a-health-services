import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini API endpoint (Fast JSON)
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Direct, concise fallback responses matched specifically to the question
    const msgLower = message.toLowerCase();
    let reply = "Could you tell me a bit more about your question or symptoms so I can give you a direct, relevant answer?";

    if (msgLower.includes("back") || msgLower.includes("neck") || msgLower.includes("posture") || msgLower.includes("pain")) {
      reply = "To relieve back/neck tension, adjust your screen to eye level and keep your lower back supported. Simple 2-minute stretch breaks every 45 minutes can prevent persistent stiffness.";
    } else if (msgLower.includes("stress") || msgLower.includes("anxiety") || msgLower.includes("sleep")) {
      reply = "For quick stress reduction, try 4-4-4 box breathing (inhale 4s, hold 4s, exhale 4s). If sleep is disrupted, keep a consistent bedtime and turn off screens 30 minutes before sleep.";
    } else if (msgLower.includes("diet") || msgLower.includes("weight") || msgLower.includes("sugar") || msgLower.includes("eat") || msgLower.includes("food")) {
      reply = "A balanced approach works best: focus on whole foods, fiber, and adequate hydration daily. If you have specific dietary needs, a personalized plan works best.";
    } else if (msgLower.includes("breath") || msgLower.includes("cough") || msgLower.includes("asthma") || msgLower.includes("lung")) {
      reply = "Sit upright to maximize lung expansion and take slow, deep abdominal breaths. If shortness of breath is severe or sudden, seek medical attention immediately.";
    } else if (msgLower.includes("who") || msgLower.includes("what") || msgLower.includes("service") || msgLower.includes("app")) {
      reply = "A+ Health Services offers Physiotherapy, Occupational Therapy, Dietetics, Psychology, and Respiratory Therapy. How can I help you today?";
    } else {
      reply = `Regarding "${message}": Please specify your goal or symptom, and I will give you a direct, focused recommendation.`;
    }

    return res.json({ reply });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: message,
      config: {
        systemInstruction: "You are the AI assistant for A+ Health Services. Answer ONLY what was specifically asked in a direct, concise, and helpful manner (1 to 3 sentences maximum). Strictly do NOT append any precaution notes, medical disclaimers, or standard warnings to your response (a disclaimer banner is already displayed at the top of the chat view). Just provide the direct, focused answer to the question asked.",
        thinkingConfig: {
          thinkingBudget: 0,
        },
      }
    });

    const reply = response.text || "I'm sorry, I couldn't generate a response at this moment. Please try again.";
    res.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ reply: "I experienced a temporary issue processing your question. Please try asking again or check our Community Health guides." });
  }
});

// Real-time Ultra-Fast Streaming Endpoint (Server-Sent Events)
app.post("/api/chat/stream", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    const msgLower = message.toLowerCase();
    let reply = "Could you tell me a bit more about your question or symptoms so I can give you a direct, relevant answer?";

    if (msgLower.includes("back") || msgLower.includes("neck") || msgLower.includes("posture") || msgLower.includes("pain")) {
      reply = "To relieve back/neck tension, adjust your screen to eye level and keep your lower back supported. Simple 2-minute stretch breaks every 45 minutes can prevent persistent stiffness.";
    } else if (msgLower.includes("stress") || msgLower.includes("anxiety") || msgLower.includes("sleep")) {
      reply = "For quick stress reduction, try 4-4-4 box breathing (inhale 4s, hold 4s, exhale 4s). If sleep is disrupted, keep a consistent bedtime and turn off screens 30 minutes before sleep.";
    } else if (msgLower.includes("diet") || msgLower.includes("weight") || msgLower.includes("sugar") || msgLower.includes("eat") || msgLower.includes("food")) {
      reply = "A balanced approach works best: focus on whole foods, fiber, and adequate hydration daily. If you have specific dietary needs, a personalized plan works best.";
    } else if (msgLower.includes("breath") || msgLower.includes("cough") || msgLower.includes("asthma") || msgLower.includes("lung")) {
      reply = "Sit upright to maximize lung expansion and take slow, deep abdominal breaths. If shortness of breath is severe or sudden, seek medical attention immediately.";
    } else if (msgLower.includes("who") || msgLower.includes("what") || msgLower.includes("service") || msgLower.includes("app")) {
      reply = "A+ Health Services offers Physiotherapy, Occupational Therapy, Dietetics, Psychology, and Respiratory Therapy. How can I help you today?";
    }

    // Stream word-by-word instantly
    const words = reply.split(" ");
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ text: word + " " })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.7-flash",
      contents: message,
      config: {
        systemInstruction: "You are the AI assistant for A+ Health Services. Answer ONLY what was specifically asked in a direct, concise, and helpful manner (1 to 3 sentences maximum). Strictly do NOT append any precaution notes, medical disclaimers, or standard warnings to your response (a disclaimer banner is already displayed at the top of the chat view). Just provide the direct, focused answer to the question asked.",
        thinkingConfig: {
          thinkingBudget: 0,
        },
      }
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Gemini streaming error:", error);
    res.write(`data: ${JSON.stringify({ text: "I experienced a temporary issue processing your question. Please try asking again." })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
