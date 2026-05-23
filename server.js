const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const CW_TOKEN   = '55893b0fbf80fdb022a8259054cb45bb';
const CW_ROOM_ID = '437477390';

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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
