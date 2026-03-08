const { OpenAI } = require('openai');
const pdf = require('pdf-parse');
const prisma = require('../services/db');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatWithAssistant = async (req, res) => {
  const { message, subject } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `You are a helpful academic assistant for a college student management system called Classivo. Help the student with their subject: ${subject || 'General'}. Explain concepts simply, provide examples, and give summaries.` },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI Assistant is currently unavailable.' });
  }
};

const summarizeNotes = async (req, res) => {
  const { content } = req.body; // In a real app, this would handle file uploads/extraction

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI note summarizer. Read the following text and generate a structured summary, extraction of key points, and highlight important topics." },
        { role: "user", content: content },
      ],
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Summarization failed.' });
  }
};

const analyzeAttendanceRisk = async (req, res) => {
  const studentId = req.user.id;

  try {
    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      include: { subject: true }
    });

    // Simple logic for AI prompt or heuristic calculation
    const summary = attendance.map(a => `${a.subject.name}: ${a.percentage}%`).join(', ');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Analyze the student's attendance data. Identify subjects with shortage risk (<75%) and suggest how many classes they must attend to be safe." },
        { role: "user", content: `My attendance is: ${summary}` },
      ],
    });

    res.json({ insights: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Attendance analysis failed.' });
  }
};

module.exports = { chatWithAssistant, summarizeNotes, analyzeAttendanceRisk };
