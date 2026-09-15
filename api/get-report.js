export default async function handler(req, res) {
  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (!kvUrl || !kvToken) {
      return res.status(200).json({ error: 'التخزين غير مفعّل بعد' });
    }

    const response = await fetch(`${kvUrl}/get/wakeely_daily_report`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    const data = await response.json();

    if (!data.result) {
      return res.status(200).json({ error: 'لا يوجد تقرير محفوظ بعد' });
    }

    const parsed = JSON.parse(data.result);
    res.status(200).json({ ok: true, report: parsed });
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
}
