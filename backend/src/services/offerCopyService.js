import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateOfferCopy({ offer }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      whatsapp: `Hi there! Use code ${offer.name || 'MERCHANT'} and enjoy ${offer.targetSegment || 'special'} savings. Limited-time offer valid for this week only.`,
      instagram: `✨ ${offer.name || 'Limited-time deal'} ✨ Save on your favorite picks and enjoy exclusive value this week.`,
      sms: `${offer.name || 'Deal'}: Save on ${offer.targetSegment || 'your favorites'} today. Terms apply.`,
      source: 'demo-fallback'
    };
  }

  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Generate localized marketing copy for a merchant offer. Use only the provided data. Return valid JSON with keys: whatsapp, instagram, sms. Offer JSON: ${JSON.stringify(offer)}.`;
    const response = await model.generateContent(prompt);
    const parsed = JSON.parse(response.response.text().trim());

    return { ...parsed, source: 'live-ai-model' };
  } catch (error) {
    return {
      whatsapp: `Hi there! Use code ${offer.name || 'MERCHANT'} and enjoy ${offer.targetSegment || 'special'} savings. Limited-time offer valid for this week only.`,
      instagram: `✨ ${offer.name || 'Limited-time deal'} ✨ Save on your favorite picks and enjoy exclusive value this week.`,
      sms: `${offer.name || 'Deal'}: Save on ${offer.targetSegment || 'your favorites'} today. Terms apply.`,
      source: 'demo-fallback'
    };
  }
}
