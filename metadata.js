import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import P from 'pino'

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

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
    if (connection === 'open') console.log('✅ Connected to WhatsApp')
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      console.log('❌ Disconnected', code)
      if (code !== DisconnectReason.loggedOut) start()
    }
  })

  sock.ev.on('creds.update', saveCreds)

  // Ambil semua JID grup
  sock.ev.on('chats.update', async chatUpdate => {
    for (let c of chatUpdate) {
      if (c?.id?.endsWith('@g.us')) { // hanya grup
        try {
          const metadata = await sock.groupMetadata(c.id)
          console.log(`📌 Group JID: ${c.id} | Nama Grup: ${metadata.subject}`)
        } catch (err) {
          console.log('❌ Failed to fetch metadata for', c.id, err)
        }
      }
    }
  })
}

start()
