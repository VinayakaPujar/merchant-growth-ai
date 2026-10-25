import { GoogleGenerativeAI } from '@google/generative-ai';

function buildFallbackExtraction(file) {
  const name = file.originalname || 'Receipt';
  const amount = Number((String(name).match(/(\d+(?:\.\d+)?)/)?.[0] || '0')) || 0;

  return {
    vendorName: name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Merchant Receipt',
    items: [
      { name: 'General item', quantity: 1, price: amount || 0 }
    ],
    totalAmount: amount || 0,
    date: new Date().toISOString().slice(0, 10),
    source: 'demo-fallback'
  };
}

export async function scanReceipt(file) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildFallbackExtraction(file);
  }

  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.mimetype || 'image/png',
          data: file.buffer.toString('base64')
        }
      },
      {
        text: `Extract receipt data and return ONLY valid JSON with this exact structure:
        {
          "vendorName": "string",
          "items": [{ "name": "string", "quantity": 1, "price": 0 }],
          "totalAmount": 0,
          "date": "YYYY-MM-DD"
        }
        Rules:
        - Use only the visible receipt content.
        - If quantity or price is unclear, use 1 and the visible line amount.
        - Do not include explanations, markdown, or extra keys.
        - If uncertain, keep the values conservative and practical.`
      }
    ]);

    const raw = result.response.text();
    const parsed = JSON.parse(raw.trim());

    return {
      vendorName: parsed.vendorName || 'Unknown vendor',
      items: Array.isArray(parsed.items) ? parsed.items : [],
      totalAmount: Number(parsed.totalAmount || 0),
      date: parsed.date || new Date().toISOString().slice(0, 10),
      source: 'live-ai-model'
    };
  } catch (error) {
    return buildFallbackExtraction(file);
  }
}
