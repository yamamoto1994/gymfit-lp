const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
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
