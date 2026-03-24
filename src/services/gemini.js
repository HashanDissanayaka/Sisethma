const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const fetchWithRetry = async (url, options, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (response.status === 429 && retries < maxRetries - 1) {
        const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        console.warn(`Gemini API 429: Rate limit hit. Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    } catch (e) {
      if (retries >= maxRetries - 1) throw e;
      retries++;
      const delay = Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const generateQuizQuestions = async ({ topic, grade, count = 5 }) => {
  const prompt = `Generate exactly ${count} multiple choice quiz questions about "${topic}" suitable for grade ${grade} students.
Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  }
]
Make questions educational, clear, and appropriate for the grade level.`;

  const response = await fetchWithRetry(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to parse AI response. Please try again.");
  }
};
