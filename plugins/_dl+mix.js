import axios from 'axios'
import FormData from 'form-data'
import { downloadContentFromMessage } from "@whiskeysockets/baileys"

// ===== CONFIG API STELLAR =====
const api = {
    url: 'https://api.stellarwa.xyz',
    key_hd: 'proyectsV2', // Para HD/Upscale
    key_bg: 'garfield-vip' // Para RemoveBG
}

// ===== DISEÑO GARFIELD BOT =====
const D = {
    name: 'GARFIELD BOT',
    emoji: '🐱🍝',
    border: '╭─── 𓆩🐱𓆪 ───╮',
    border2: '╰─── 𓆩🍝𓆪 ───╯',
    title: '𝐆𝐀𝐑𝐅𝐈𝐄𝐋𝐃 𝐇𝐃 + 𝐁𝐆',
    footer: '> "Mejorando y limpiando como lasaña" 😼',
    process: '🐱 PROCESANDO',
    found: '🍝 LISTO',
    error: '😿 NO SE PUDO'
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
  const apiUrl = `${api.url}/tools/upscale?url=${encodeURIComponent(url)}&key=${api.key_hd}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 })
  if (!res.data) throw 'Stellar HD no devolvió imagen'
  return Buffer.from(res.data)
}

async function removeBgFromUrl(url) {
  const apiUrl = `${api.url}/tools/removebg?url=${encodeURIComponent(url)}&key=${api.key_bg}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 })
  if (!res.data) throw 'Stellar RemoveBG no devolvió imagen'
  return Buffer.from(res.data)
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!mime) return m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗠𝗘𝗝𝗢𝗥𝗔𝗗𝗢𝗥 + 𝗤𝗨𝗜𝗧𝗔𝗥 𝗙𝗢𝗡𝗗𝗢

──愛 *COMO USAR* ╏ ❄️
💭 ➛ Responde a una imagen con: *${usedPrefix + command}*
💭 ➛ Proceso: HD 2x → Quitar Fondo → Enviar PNG + DOC

${D.border2}
${D.footer}
━━━━━━━━━━━`)

    if (!/image\/(jpe?g|png)/.test(mime)) {
      return m.reply(`${D.border}\n⚠️ ➛ Solo se acepta imagen JPG/PNG\n${D.border2}`)
    }

    try {
      await m.react('🐱')
      await m.reply(`${D.border}\n⤷ ┇ ${D.process} ：✿ 。\n${D.border2}`)

      // 1. Descargar
      const buffer = await q.download()

      // 2. Subir original a Uguu
      await m.reply(`${D.border}\n💭 ➛ 1/4 Subiendo imagen...\n${D.border2}`)
      const uploadedUrl = await uploadToUguu(buffer, mime)

      // 3. HD con proyectsV2
      await m.reply(`${D.border}\n💭 ➛ 2/4 Mejorando calidad 2x...\n${D.border2}`)
      const hdBuffer = await upscaleImage(uploadedUrl)

      // 4. Subir HD a Uguu
      await m.reply(`${D.border}\n💭 ➛ 3/4 Subiendo HD a Uguu...\n${D.border2}`)
      const hdUrl = await uploadToUguu(hdBuffer, 'image/png')

      // 5. RemoveBG con garfield-vip
      await m.reply(`${D.border}\n💭 ➛ 4/4 Quitando fondo...\n${D.border2}`)
      const finalBuffer = await removeBgFromUrl(hdUrl)

      // 6. Enviar imagen
      await conn.sendMessage(m.chat, {
        image: finalBuffer,
        caption: `${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ ${D.found} ：✿ 。

  ꒱ ׁ. ᘏ 𝗗𝗘𝗧𝗔𝗟𝗘𝗦 ׅ 𝆬 ָ֢ ෆ
📌 ➛ Calidad: HD 2x
📌 ➛ Fondo: Eliminado
📌 ➛ Formato: PNG Transparente

${D.border2}
${D.footer}`
      }, { quoted: m })

      // 7. Enviar también como documento
      await conn.sendMessage(m.chat, {
        document: finalBuffer,
        fileName: 'garfield-nobg.png',
        mimetype: 'image/png',
        caption: `${D.border}\n📄 *Documento PNG Sin Fondo*\n${D.border2}`
      }, { quoted: m })

      await m.react('✅')

    } catch (err) {
      await m.react('❌')
      await m.reply(`${D.border}
⤷ ┇ ${D.error} ：✿ 。

──愛 *FALLA* ╏ ❄️
⚠️ ➛ ${err.message || err}

${D.border2}`)
    }
}

handler.help = ['removebg', 'rbg', 'nobg']
handler.tags = ['herramientas', 'ia']
handler.command = /^(removebg|rbg|nobg)$/i
export default handler