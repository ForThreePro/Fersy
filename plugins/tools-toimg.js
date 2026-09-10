import { webp2mp4 } from '../lib/webp2mp4.js'
import { ffmpeg, toAudio } from '../lib/converter.js'

let handler = async (m, { conn, command }) => {
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  const error = (msg) => {
    return m.reply(`𐔌 ꒱ ***CONVERTIDOR*** 𐔌 ꒱ ⚠️\n\n.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷\n\n── *📝 AVISO* ╏\n❌ ➛ ${msg}\n━━━━━━━━━━━`)
  }

  // TOVID
  if (['tovid', 'tovideo'].includes(command)) {
    if (!m.quoted) return error('Responde a un *sticker animado*')
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) return error('Solo acepto *stickers animados* .webp')
    try {
      await react('⏳')
      let media = await m.quoted.download()
      let out = await webp2mp4(media)
      await conn.sendFile(m.chat, out, 'video.mp4', `𐔌 ꒱ ***CONVERTIDOR*** 𐔌 ꒱ ✅\n\n.⃟𖥔 ݁. 𖦹˙— \`\`TOVIDEO\`\` —˙𖦹.🎬꒷\n\n── *📊 ESTADO* ╏\n✅ ➛ Conversión completada\n🎬 ➛ Sticker a Video MP4\n━━━━━━━━━━━`, m)
      await react('✅')
    } catch {
      await react('❌')
      return error('No se pudo convertir')
    }
  }

  // TOMP3
  if (['tomp3', 'toaudio'].includes(command)) {
    let q = m.quoted ? m.quoted : m
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
    if (!/video|audio/.test(mime)) return error('Responde a un *video* o *nota de voz*')
    try {
      await react('⏳')
      let media = await q.download?.()
      let audio = await toAudio(media, 'mp4')
      await conn.sendFile(m.chat, audio.data, 'audio.mp3', `𐔌 ꒱ ***CONVERTIDOR*** 𐔌 ꒱ ✅\n\n.⃟𖥔 ݁. 𖦹˙— \`\`TOMP3\`\` —˙𖦹.🎵꒷\n\n── *📊 ESTADO* ╏\n✅ ➛ Audio extraído\n🎵 ➛ Formato: MP3\n━━━━━━━━━━━`, m, null, { mimetype: 'audio/mp4' })
      await react('✅')
    } catch {
      await react('❌')
      return error('No se pudo convertir')
    }
  }

  // TOIMG
  if (['toimg', 'stickerimg', 'simg'].includes(command)) {
    let q = m.quoted ? m.quoted : m
    let isSticker = q.mtype === 'stickerMessage' || (q.mimetype || '').includes('webp')
    if (!isSticker) return error('Responde a un *sticker*')
    try {
      await react('🖼️')
      let media = await q.download()
      await conn.sendMessage(m.chat, { 
        image: media, 
        caption: `𐔌 ꒱ ***CONVERTIDOR*** 𐔌 ꒱ ✅\n\n.⃟𖥔 ݁. 𖦹˙— \`\`TOIMG\`\` —˙𖦹.🖼️꒷\n\n── *📊 ESTADO* ╏\n✅ ➛ Conversión completada\n🖼️ ➛ Sticker a Imagen JPG\n━━━━━━━━━━━` 
      }, { quoted: m })
      await react('✅')
    } catch {
      await react('❌')
      error('No pude convertir el *sticker*')
    }
  }
}

handler.help = ['tovid', 'tomp3', 'toimg']
handler.tags = ['tools']
handler.command = ['tovid', 'tovideo', 'tomp3', 'toaudio', 'toimg', 'stickerimg', 'simg']
export default handler