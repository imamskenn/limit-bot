/ ===================== BANNER =====================
import chalk from 'chalk';

function centerText(text) {
  const lines = text.split('\n');
  const width = process.stdout.columns || 80;
  return lines.map(line => {
    const pad = Math.floor((width - line.length) / 2);
    return ' '.repeat(pad > 0 ? pad : 0) + line;
  }).join('\n');
}

const bannerLines = [
  '██████╗  ██████╗ ████████╗ ██╗     ██╗███╗   ███╗██╗████████╗',
  '██╔══██╗██╔═══██╗╚══██╔══╝ ██║     ██║████╗ ████║██║╚══██╔══╝',
  '██████╔╝██║   ██║   ██║    ██║     ██║██╔████╔██║██║   ██║   ',
  '██╔═══╝ ██║   ██║   ██║    ██║     ██║██║╚██╔╝██║██║   ██║   ',
  '██║     ╚██████╔╝   ██║    ███████╗██║██║ ╚═╝ ██║██║   ██║   ',
  '╚═╝      ╚═════╝    ╚═╝    ╚══════╝╚═╝╚═╝     ╚═╝╚═╝   ╚═╝   ',
  'BOT LIMIT-CENTRE BY IMAMSKENN'
];

console.clear();
console.log(centerText(chalk.green('╔' + '═'.repeat(70) + '╗')));
bannerLines.forEach(line => {
  console.log(centerText(chalk.green('║ ') + chalk.cyan(line) + chalk.green(' ║')));
});
console.log(centerText(chalk.green('╚' + '═'.repeat(70) + '╝')));
console.log();
console.log(centerText(chalk.yellow('------SELAMAT BEKERJA, BOT TELAH KONEK KE WHATSAPP------')));

// ===================== IMPORT =====================
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

import qrcode from 'qrcode-terminal';
import P from 'pino';

// ===================== CONFIG =====================
const GROUP_CODES = {
  'pengcm33(604)(n207)': { R: 604, N: 207 },
  'wpcm48/(102)': { R: 102 },
  'wpcm127/rylc050206': { R: 206 },
  'wp3388/050203': { R: 203 },
  '234-1(675)': { R: 675 },
  '333(050309)': { R: 309 },
  'klangfila88 (631)': { R: 631 },
  'bktflat33 (638)': { R: 638 },
  'clfcm33(637)': { R: 637 },
  'nbc3888(688)(n203)🌟': { R: 688, N: 203 },
  '050202/63-1snkcm': { R: 202, N: 202 },
  '050101(bsscm88)': { R: 101 },

  // grup L
  'bkt2888 (629)': { L: true },
  'tamankem888': { L: true },
  'tp208': { L: true },
  'by27cm': { L: true },
  'bt-1a': { L: true },
  'bkth502': { L: true },
  'bn26': { L: true },
  'pj27cm': { L: true },
  'flat12cm': { L: true },
  'bayu310cm': { L: true },
  'bkt25cm': { L: true },
  'tclcm': { L: true },
  'pj31cm': { L: true },
  'stcm88': { L: true }
};

const GROUP_ALIAS = {
  'pengcm33(604)(n207)': 'PENG-CM',
  'nbc3888(688)(n203)🌟': 'NBC-3388',
  'wpcm127/rylc050206': 'WP-127',
  'wp3388/050203': 'WP-38',
  '234-1(675)': '234-1',
  '333(050309)': '333-CM',
  'klangfila88 (631)': 'KLANG-FILLA',
  'bktflat33 (638)': 'BKT-FLAT',
  'clfcm33(637)': 'CL-FLAT',
  'wpcm48/(102)': 'WP-48',
  '050202/63-1snkcm': '63-SNK',
  '050101(bsscm88)': 'BSS-CM',
  'tp208': 'TP208',
  'by27cm': 'BY27',
  'bkth502': 'BKT-H',
  'pj27cm': 'PJ-27',
  'flat12cm': 'FLAT-12',
  'bayu310cm': 'BY-310',
  'bkt25cm': 'BKT-25',
  'tclcm': 'TCL-CM',
  'pj31cm': 'PJ-31',
  'stcm88': 'ST-CM',
  'tamankem888': 'TMK-33',
  'bkt2888 (629)': 'BKT-288'
};

const LIMIT_GROUP_JID = 'yourgroupJID@g.us';
const groupCache = {};

// ===================== FUNCTIONS =====================
async function getGroupName(jid, sock) {
  if (!jid.endsWith('@g.us')) return null;
  if (groupCache[jid]) return groupCache[jid];

  try {
    const meta = await sock.groupMetadata(jid);
    if (!meta?.subject) return null;
    groupCache[jid] = meta.subject;
    return meta.subject;
  } catch {
    return null;
  }
}

function getEmoji(line) {
  if (['M','R','N','L','K'].some(c => line.startsWith(c))) return '🟩';
  return '';
}

// ===================== BOT START =====================
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_bot');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    logger: P({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });

    if (connection === 'open') {
      console.log('KALEM BOSKU, RESTART DULU BIAR GAK NGE BUG');
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) startBot();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;

      const jid = m.key.remoteJid;
      if (!jid.endsWith('@g.us')) continue; // ⛔ FIX UTAMA

      const text =
        m.message.conversation ||
        m.message.extendedTextMessage?.text;

      if (!text) continue;

      const groupName = await getGroupName(jid, sock);
      if (!groupName) continue;

      const cleanName = groupName.toLowerCase().trim();
      const groupData = GROUP_CODES[cleanName];
      if (!groupData) continue;

      const aliasName = GROUP_ALIAS[cleanName] || cleanName.toUpperCase();

      const lines = text.trim().split('\n');
      const firstLine = lines[0].trim().toUpperCase();
      const lineForRegex = firstLine.replace(/@.+$/, '').trim();

      if (!/^([MRNLK])\s*[+-]\s*\d+\s*K?$/i.test(lineForRegex)) continue;

      let sendText = '';
      if (firstLine.startsWith('M')) sendText = `${aliasName} ${lineForRegex}`;
      else if (firstLine.startsWith('R') && groupData.R) sendText = `${groupData.R} ${lineForRegex}`;
      else if (firstLine.startsWith('N') && groupData.N) sendText = `${groupData.N} ${lineForRegex}`;
      else if (firstLine.startsWith('L') && groupData.L) sendText = `${aliasName} ${lineForRegex}`;
      else if (firstLine.startsWith('K')) sendText = `${aliasName} ${lineForRegex}`;

      if (!sendText) continue;

      try {
        await sock.sendMessage(LIMIT_GROUP_JID, {
          text: sendText.toUpperCase()
        });

        const now = new Date();
        console.log(`${getEmoji(firstLine)} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} | ${aliasName} | ${lineForRegex} | SENT`);
      } catch {
        console.log('❌ GAGAL KIRIM');
      }
    }
  });
}
