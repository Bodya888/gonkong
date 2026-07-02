// Serverless-прокси для брони столика (Vercel).
// Токен и chat_id берутся из переменных окружения — в коде их НЕТ.
//   TELEGRAM_TOKEN   — токен бота (перевыпустите его у @BotFather!)
//   TELEGRAM_CHAT_ID — куда слать заявки (ваш чат или группа)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: "Server not configured" });
  }

  try {
    const { name, phone, date, time, guests } = req.body || {};

    // минимальная валидация
    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: "Не заполнены имя или телефон" });
    }

    const esc = (s) =>
      String(s ?? "—").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

    const text =
      "🍜 <b>Новая бронь — ГОНКОНГ</b>\n\n" +
      "👤 Имя: " + esc(name) + "\n" +
      "📞 Телефон: " + esc(phone) + "\n" +
      "📅 Дата: " + esc(date) + "\n" +
      "🕐 Время: " + esc(time) + "\n" +
      "👥 Гостей: " + esc(guests);

    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const data = await tg.json();

    if (!data.ok) {
      return res.status(502).json({ ok: false, error: "Telegram rejected the message" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
