import axios from 'axios'
import FormData from 'form-data'
import { downloadContentFromMessage } from "@whiskeysockets/baileys"

// ===== CONFIG API STELLAR =====
const api = {
    url: 'https://api.stellarwa.xyz',
    key: 'proyectsV2' // Solo esta key
}

// ===== DISEÑO GARFIELD BOT =====
const D = {
    name: 'GARFIELD BOT',
    emoji: '🐱🍝',
    border: '╭─── 𓆩🐱𓆪 ───╮',
    border2: '╰─── 𓆩🍝𓆪 ───╯',
    title: '𝐆𝐀𝐑𝐅𝐈𝐄𝐋𝐃 𝐇𝐃 + 𝐁𝐆',
    footer: '> "HD + Sin Fondo" 😼'
}

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'jpg'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${id}.${ext}`
}

async function uploadToUguu(buffer, mime) {
  const body = new FormData()
  body.append('files[]', buffer, generateUniqueFilename(mime))
  const res = await axios.post('https://uguu.se/upload.php', body, {
    headers: body.getHeaders(),
    timeout: 30000
  })
  const url = res.data?.files?.[0]?.url
  if (!url) throw 'No se pudo subir a Uguu'
  return url
}

async function upscaleImage(url) {
  const apiUrl = `${api.url}/tools/upscale?url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 })
  if (!res.data) throw 'Stellar HD no devolvió imagen'
  return Buffer.from(res.data)
}

async function removeBgFromUrl(url) {
  const apiUrl = `${api.url}/tools/removebg?url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 })
  if (!res.data) throw 'Stellar RemoveBG no devolvió imagen'
  return Buffer.from(res.data)
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!mime) return m.reply(`${D.border}
${D.emoji} 𓆩 ${D.name} 𓆪 ${D.emoji}

 ⤷ ┇ Responde a una *imagen* con: *${usedPrefix + command}*
 ⤷ ┇ Proceso: HD 2x → Quitar Fondo

${D.border2}`)

    if (!/image\/(jpe?g|png)/.test(mime)) {
      return m.reply(`${D.border}\n⚠️ ➛ Solo se acepta imagen JPG/PNG\n${D.border2}`)
    }

    try {
      await m.react('⏳') // Solo 1 reacción al inicio

      // Proceso completo sin avisar
      const buffer = await q.download()
      const uploadedUrl = await uploadToUguu(buffer, mime)
      const hdBuffer = await upscaleImage(uploadedUrl)
      const hdUrl = await uploadToUguu(hdBuffer, 'image/png')
      const finalBuffer = await removeBgFromUrl(hdUrl)

      // Mensaje 1: Imagen
      await conn.sendMessage(m.chat, {
        image: finalBuffer,
        caption: `${D.border}
${D.emoji} 𓆩 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ 🍝 LISTO ：✿ 。
📌 ➛ Calidad: HD 2x
📌 ➛ Fondo: Eliminado

${D.border2}
${D.footer}`
      }, { quoted: m })

      // Mensaje 2: Documento
      await conn.sendMessage(m.chat, {
        document: finalBuffer,
        fileName: 'garfield-nobg.png',
        mimetype: 'image/png',
        caption: `${D.border}\n📄 *Documento PNG Sin Fondo*\n${D.border2}`
      }, { quoted: m })

      await m.react('✅') // Solo 1 reacción al final

    } catch (err) {
      await m.react('❌')
      await m.reply(`${D.border}
⤷ ┇ 😿 NO SE PUDO ：✿ 。

⚠️ ➛ ${err.message || err}

${D.border2}`)
    }
}

handler.help = ['removebg', 'rbg', 'nobg']
handler.tags = ['herramientas', 'ia']
handler.command = /^(removebg|rbg|nobg)$/i
export default handler