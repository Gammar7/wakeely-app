export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: 'أنت "وكيلي" — مساعد أعمال يجهز تقرير يومي مختصر ومفيد لصاحب مشروع تجاري ناشئ (اتجاهه متجر أونلاين، مثل أمازون). التقرير يجب أن يكون بالعربية، منظم بنقاط قصيرة، عملي، بدون حشو.',
        messages: [
          {
            role: 'user',
            content: 'جهز لي تقرير اليوم: 1) فكرة منتج أو فرصة تجارية واحدة تستحق النظر فيها هذا الأسبوع (استخدم البحث الحي لمعلومات حديثة). 2) نصيحة تسويقية عملية واحدة. 3) جملة تحفيزية قصيرة. اجعل التقرير مختصر جداً (لا يتجاوز 150 كلمة).'
          }
        ],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(200).json({ error: data.error?.message || 'فشل توليد التقرير' });
    }

    const reportText = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();

    const payload = {
      text: reportText,
      date: new Date().toISOString()
    };

    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (kvUrl && kvToken) {
      await fetch(`${kvUrl}/set/wakeely_daily_report`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    }

    res.status(200).json({ ok: true, report: payload });
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
}
