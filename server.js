const express = require('express');
const https = require('https');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const CW_TOKEN        = '55893b0fbf80fdb022a8259054cb45bb';
const CW_ROOM_ID      = '437477390';  // フォーム通知
const CW_ROOM_LINE_ID = '438563623';  // LINE通知

function notifyChatwork(roomId, message) {
  const postData = 'body=' + encodeURIComponent(message);
  const options = {
    hostname: 'api.chatwork.com',
    path: `/v2/rooms/${roomId}/messages`,
    method: 'POST',
    headers: {
      'X-ChatWorkToken': CW_TOKEN,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };
  const req = https.request(options, (res) => { res.resume(); });
  req.on('error', (e) => console.error('Chatwork error:', e.message));
  req.write(postData);
  req.end();
}

app.post('/notify', (req, res) => {
  const message = req.body.body;
  if (!message) return res.status(400).json({ ok: false });

  const postData = 'body=' + encodeURIComponent(message);
  const options = {
    hostname: 'api.chatwork.com',
    path: `/v2/rooms/${CW_ROOM_ID}/messages`,
    method: 'POST',
    headers: {
      'X-ChatWorkToken': CW_TOKEN,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const cwReq = https.request(options, (cwRes) => {
    cwRes.resume();
    res.json({ ok: true, status: cwRes.statusCode });
  });

  cwReq.on('error', (e) => {
    console.error('Chatwork error:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  });

  cwReq.write(postData);
  cwReq.end();
});

// 自動返信メール
app.post('/send-mail', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ ok: false });

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"パーソナルピラティスGYMFIT" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '【パーソナルピラティスGYMFIT】お問い合わせを受け付けました',
      text: `${name} 様\n\nこの度はパーソナルピラティスGYMFITへお問い合わせいただき、誠にありがとうございます。\n\n内容を確認のうえ、担当者よりご連絡いたします。\n今しばらくお待ちください。\n\n──────────────────\nパーソナルピラティスGYMFIT\nhttps://gymfit-lp-production.up.railway.app/\n──────────────────`,
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('Mail error:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// LINE Webhook
app.post('/line-webhook', async (req, res) => {
  res.sendStatus(200); // LINEへはすぐ200を返す必須

  const events = req.body.events || [];
  for (const event of events) {
    const userId = event.source?.userId || '不明';
    let msg = '';

    if (event.type === 'message') {
      const m = event.message;
      if (m.type === 'text') {
        msg = `[info][title]公式LINEにメッセージが届きました[/title]内容：${m.text}\nユーザーID：${userId}[/info]`;
      } else {
        msg = `[info][title]公式LINEにメッセージが届きました[/title]種別：${m.type}\nユーザーID：${userId}[/info]`;
      }
    } else if (event.type === 'follow') {
      msg = `[info][title]公式LINEが友達追加されました[/title]ユーザーID：${userId}[/info]`;
    } else if (event.type === 'unfollow') {
      msg = `[info][title]公式LINEがブロックされました[/title]ユーザーID：${userId}[/info]`;
    }

    if (msg) notifyChatwork(CW_ROOM_LINE_ID, msg);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
