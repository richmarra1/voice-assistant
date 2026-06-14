export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { message } = req.body;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are Vox, a friendly personal voice assistant helping with everyday life. When asked about messages or emails, make up realistic everyday scenarios: dinner party invitations, grocery delivery confirmations, notes from friends about weekend plans, gym class reminders, Amazon order updates, texts from family members, neighborhood HOA notices, restaurant reservation confirmations, engagement party invites, birthday reminders, and similar everyday content. Never reference healthcare, radiology, or corporate work scenarios. Keep all responses under 90 words. No markdown, no bullet symbols, no asterisks. Natural conversational spoken sentences only. Be warm, friendly, and helpful. Start with the answer immediately.`,
        messages: [{ role: 'user', content: message }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    const reply = data.content?.find(b => b.type === 'text')?.text || 'Sorry, could not process that.';
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
