console.clear();

console.log(`
██████╗  ██████╗ ████████╗     ██╗     ██╗███╗   ███╗██╗████████╗
██╔══██╗██╔═══██╗╚══██╔══╝     ██║     ██║████╗ ████║██║╚══██╔══╝
██████╔╝██║   ██║   ██║        ██║     ██║██╔████╔██║██║   ██║   
██╔═══╝ ██║   ██║   ██║        ██║     ██║██║╚██╔╝██║██║   ██║   
██║     ╚██████╔╝   ██║        ███████╗██║██║ ╚═╝ ██║██║   ██║   
╚═╝      ╚═════╝    ╚═╝        ╚══════╝╚═╝╚═╝     ╚═╝╚═╝   ╚═╝   

                   BOT LIMIT-CENTRE
                      BY IMAMSKENN
`);

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import P from 'pino'

// ===================== CONFIG =====================

// Mapping nama grup → kode R/N atau khusus L
const GROUP_CODES = {
  'pengcm333(604)(n207)': { R: 604, N: 207 },
  'wpcm48/(102)': { R: 102 },
  'wpcm127/rylc050206': { R: 206 },
  'wp3388/050203': { R: 203 },
  '234-1(675)': { R: 675 },
  '333(050309)': { R: 309 },
  'klangfila88 (631)': { R: 631 },
  'bktflat33 (638)': { R: 638 },
  'clfcm33(637)': { R: 637 },
  'nbc3888(688)(n203)🌟': { R: 688, N: 203 },
  '050202/63-snkcm': { R: 202, N: 202 },
  '050101(bsscm88)': { R: 101 },

  // grup biasa (khusus L)
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
}

// Alias nama grup → inisial singkat
const GROUP_ALIAS = {
  // Grup M (ada RN)
  'pengcm333(604)(n207)': 'PENGCM',
  'nbc3888(688)(n203)🌟': 'NBC3388',
  'wpcm127/rylc050206': 'WP127',
  'wp3388/050203': 'WP38',
  '234-1(675)': '234-1',
  '333(050309)': '333CM',
  'klangfila88 (631)': 'KLANGFILLA',
  'bktflat33 (638)': 'BKTFLAT',
  'clfcm33(637)': 'CLFLAT',
  'wpcm48/(102)': 'WP48',
  '050202/63-snkcm': '63SNK',
  '050101(bsscm88)': 'BSSCM',

  // Grup L (biasa)
  'tp208': 'TP208',
  'by27cm': 'BY27',
  'bkth502': 'BKTH',
  'pj27cm': 'PJ27',
  'flat12cm': 'FLAT12',
  'bayu310cm': 'BY310',
  'bkt25cm': 'BKT25',
  'tclcm': 'TCLCM',
  'pj31cm': 'PJ31',
  'stcm88': 'STCM',
  'tamankem888': 'TMK3',
  'bkt2888 (629)': 'BKT28'
}

// JID grup Limit Centre
const LIMIT_GROUP_JID = '120363406990741857@g.us'

// ==================================================

// Cache metadata grup
const groupCache = {}
async function getGroupName(jid, sock) {
  if (groupCache[jid]) return groupCache[jid]
  const metadata = await sock.groupMetadata(jid)
  groupCache[jid] = metadata.subject
  return groupCache[jid]
}

// Emoji kategori
function getEmoji(line) {
  if (line.startsWith('M+')) return '🟨'
  if (line.startsWith('R+')) return '🟦'
  if (line.startsWith('N+')) return '🟩'
  if (line.startsWith('L+')) return '⬜'
  if (line.startsWith('K+')) return '🟪'
  return ''
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_bot')
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    auth: state,
    version,
    logger: P({ level: 'silent' })
  })

  // Handle koneksi
  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect, qr } = update
    if (qr) qrcode.generate(qr, { small: true })
    if (connection === 'open') console.log('✅ Bot connected')
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      console.log('❌ Disconnected', code)
      if (code !== DisconnectReason.loggedOut) startBot()
    }
  })

  // Pesan Group
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (let m of messages) {
      if (!m.message || m.key.fromMe) continue

      const jid = m.key.remoteJid
      const text = m.message.conversation || m.message.extendedTextMessage?.text
      if (!text) continue

      // Ambil nama grup dari cache
      const groupName = await getGroupName(jid, sock)
      const cleanName = groupName.split('(')[0].trim().toLowerCase()
      const groupData = GROUP_CODES[cleanName]
      if (!groupData) continue

      // Ambil alias (kalau ada)
      const aliasName = GROUP_ALIAS[cleanName] || cleanName

      // Deteksi hanya satu baris
      const lines = text.trim().split('\n')
      if (lines.length !== 1) continue

      // Normalisasi ke uppercase
      const line = lines[0].trim().toUpperCase()
      if (!/^[MRNLK][+-]\s*(\d+K?|\d+)$/.test(line)) continue

      let sendText = ''
      if (line.startsWith('M')) {
        sendText = `${aliasName} ${line}`
      } else if (line.startsWith('R') && groupData.R) {
        sendText = `${groupData.R} ${line}`   // Rolex pakai kode R
      } else if (line.startsWith('N') && groupData.N) {
        sendText = `${groupData.N} ${line}`   // Nova pakai kode N
      } else if (line.startsWith('L') && groupData.L) {
        sendText = `${aliasName} ${line}`
      } else if (line.startsWith('K')) {
        sendText = `${aliasName} ${line}`
      }

      if (sendText) {
        try {
          // forward ke Limit Centre full CAPSLOCK
          await sock.sendMessage(LIMIT_GROUP_JID, { text: sendText.toUpperCase() })

          // log sukses
          const now = new Date()
          const tanggal = now.toLocaleDateString('id-ID')
          const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          const emoji = getEmoji(line.toUpperCase())

          console.log(`${emoji} ${tanggal} ${jam} | ${aliasName.toUpperCase()} | ${line.toUpperCase()} | ✅`)
        } catch (err) {
          // log gagal
          const now = new Date()
          const tanggal = now.toLocaleDateString('id-ID')
          const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          const emoji = getEmoji(line.toUpperCase())

          console.log(`${emoji} ${tanggal} ${jam} | ${aliasName.toUpperCase()} | ${line.toUpperCase()} | ❌`)
        }
      }
    }
  })
}

startBot()
