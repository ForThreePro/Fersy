import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  let q = m.quoted ? m.quoted : m
  let txt = text || q.text || q.caption || q.body || ''

  if (!txt) {
    await react('❌')
    return m.reply(`𐔌 ꒱ ***BRAT*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR DE USO\`\` —˙𖦹.⚠️꒷

── *📖 USO* ╏
➛ Escribe el texto para generar el sticker
➛ Ejemplo: ${usedPrefix}${command} Hola

━━━━━━━━━━━`)
  }

  await react('🖌️')

  let isAnimated = command.endsWith('anim') || command.endsWith('2')
  let apiUrl = `https://api.evogb.org/tools/brat?text=${encodeURIComponent(txt)}&animated=${isAnimated}&key=sasuke`

  let response = await fetch(apiUrl)
  if (!response.ok) {
    await react('❌')
    return m.reply(`𐔌 ꒱ ***BRAT*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Error al generar el sticker
🔄 ➛ Intenta de nuevo

━━━━━━━━━━━`)
  }

  let inputBuffer = await response.buffer()
  let ext = isAnimated ? 'mp4' : 'png'
  let tmpInput = path.join(tmpdir(), `brat-${Date.now()}.${ext}`)
  let tmpOutput = path.join(tmpdir(), `brat-${Date.now()}.webp`)

  fs.writeFileSync(tmpInput, inputBuffer)

  await new Promise((resolve, reject) => {
    let process = ffmpeg(tmpInput)
    if (isAnimated) {
      process
        .fps(15)
        .videoFilters('scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000')
        .outputOptions(['-loop 0', '-preset default', '-an', '-vsync 0'])
    } else {
      process
        .videoFilters('scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000')
    }

    process
      .toFormat('webp')
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err))
      .save(tmpOutput)
  })

  let stickerBuffer = fs.readFileSync(tmpOutput)

  await conn.sendMessage(m.chat, {
    sticker: stickerBuffer,
    packname: 'Sticker',
    author: 'Bot'
  }, { quoted: m })

  if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput)
  if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput)

  await react('✅')
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = /^brat?$/i

export default handler