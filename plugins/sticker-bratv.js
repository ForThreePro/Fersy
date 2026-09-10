import { sticker } from '../lib/sticker.js'
import axios from 'axios'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetchStickerVideo = async (text) => {
  const response = await axios.get(`https://skyzxu-brat.hf.space/brat-animated`, {
    params: { text },
    responseType: 'arraybuffer'
  })
  if (!response.data) throw new Error('Error al obtener el video de la api.')
  return response.data
}

const handler = async (m, { conn, text }) => {
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  try {
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}
    let texto1 = packstickers.text1 || global.packsticker
    let texto2 = packstickers.text2 || global.packsticker2

    text = m.quoted?.text || text
    if (!text) {
      await react('❌')
      return conn.sendMessage(m.chat, {
        text: `𐔌 ꒱ ***BRATV*** 𐔌 ꒱ ⚠️\n\n── *📖 USO* ╏\n➛ Responde a un mensaje o escribe texto\n➛ Ejemplo:.bratv Hola\n━━━━━━━━━━━`
      }, { quoted: m })
    }

    await react('🕒')
    const videoBuffer = await fetchStickerVideo(text)
    const stickerBuffer = await sticker(videoBuffer, null, texto1, texto2)
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
    await react('✅')

  } catch (e) {
    await react('❌')
    conn.sendMessage(m.chat, {
      text: `𐔌 ꒱ ***BRATV*** 𐔌 ꒱ ⚠️\n\n.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷\n\n── *📝 AVISO* ╏\n❌ ➛ Se produjo un problema\n💡 ➛ Usa report para informarlo\n── *📊 DETALLE* ╏\n\`\`${e.message}\`\n━━━━━━━━━━━`
    }, { quoted: m })
  }
}

handler.tags = ['sticker']
handler.help = ['bratv <texto>']
handler.command = ['bratv']

export default handler