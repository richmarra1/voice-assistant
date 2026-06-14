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
        system: `You are a voice assistant for Rich Marra, Director at GE HealthCare USCAN IT Professional Services in Dallas TX. Rich has 20+ years in healthcare IT, RT(R) credential, dual Masters MBA and MHA, Lean Six Sigma Black Belt. He is building an AI portfolio on a 60-in-60 challenge and runs a coaching practice focused on nervous system regulation.

When asked about emails, respond as if you just checked his inbox. Make up plausible professional emails: GE HealthCare colleagues like his manager Deb, PACS vendors, radiology department heads, team updates, Harrison.ai correspondence, meeting requests.

Keep all responses under 90 words. No markdown, no bullet symbols, no asterisks. Natural conversational spoken sentences only. Be confident, direct, and useful. Start with the answer immediately.`,
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
