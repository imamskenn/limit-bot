const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({ authStrategy: new LocalAuth() });

const LIMIT_GROUP = 'Limit Centre';

// mapping grup → kode R (angka)
const GROUP_CODES = {
  'Pengcm333': 604,
};

client.on('qr', qr => qrcode.generate(qr, { small: true }));

client.on('message', async msg => {
  if (!msg.from.endsWith('@g.us')) return;

  const chat = await msg.getChat();
  const groupName = chat.name;
  const groupCode = GROUP_CODES[groupName];
  if (!groupCode) return;

  const m = msg.body.match(/r\s*\+?\s*(\d+)(k)?/i);
  if (!m) return;

  let angka = m[1];
  if (m[2]) angka += '000';

  const out = `${groupCode} R+${angka}`;

  const chats = await client.getChats();
  const limitChat = chats.find(c => c.name === LIMIT_GROUP);
  if (limitChat) limitChat.sendMessage(out);
});

client.initialize();
