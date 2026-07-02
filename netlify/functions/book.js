// Netlify-функция: приём брони столика и отправка в Telegram.
// Токен и chat_id — из переменных окружения (в коде их НЕТ):
//   TELEGRAM_TOKEN   — токен бота (@BotFather)
//   TELEGRAM_CHAT_ID — куда слать заявки

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
  }

  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Server not configured" }) };
  }

  try {
    const { name, phone, date, time, guests } = JSON.parse(event.body || "{}");

    if (!name || !phone) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Не заполнены имя или телефон" }) };
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
      return { statusCode: 502, body: JSON.stringify({ ok: false, error: "Telegram rejected the message" }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Server error" }) };
  }
};
