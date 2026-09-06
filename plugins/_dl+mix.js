import axios from 'axios'
import FormData from 'form-data'
import { downloadContentFromMessage } from "@whiskeysockets/baileys"

// ===== CONFIG API STELLAR =====
const api = {
    url: 'https://api.stellarwa.xyz',
    key: 'proyectsV2'
}

// ===== DISEÑO GARFIELD BOT =====
const D = {
    name: 'GARFIELD BOT',
    emoji: '🐱🍝',
    border: '╭─── 𓆩🐱𓆪 ───╮',
    border2: '╰─── 𓆩🍝𓆪 ───╯',
    footer: '> "Bajando como lasaña" 😼'
}

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'jpg'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${id}.${ext}`
}

async function uploadToUguu(buffer, mime) {
  const form = new FormData()
  form.append('files[]', buffer, generateUniqueFilename(mime))

  const res = await axios.post("https://uguu.se/upload.php", form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 30000
  })

  const data = res.data
  const url = data?.files?.[0]?.url
  if (!url) throw new Error("Uguu no devolvió URL: " + JSON.stringify(data))
  return url
}

async function removeBgFromUrl(url) {
  const apiUrl = `${api.url}/tools/removebg?url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await axios.get(apiUrl, {
    responseType: 'arraybuffer',
    timeout: 60000
  })
  if (!res.data) throw new Error('Stellar no devolvió imagen')
  return Buffer.from(res.data)
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!mime.startsWith('image/')) {
      return m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

 ⤷ ┇ Responde a una *imagen* con ${usedPrefix}${command} ：✿ 。

${D.border2}`)
    }

    try {
      await m.react('🐱')
      await m.reply(`${D.border}\n⤷ ┇ 🐱 QUITANDO FONDO ：✿ 。\n${D.border2}`)

      // Descargar imagen
      let stream = await downloadContentFromMessage(q, 'image')
      let buffer = Buffer.from([])
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

      await m.reply(`${D.border}\n💭 ➛ Subiendo a Uguu...\n${D.border2}`)
      const uguuUrl = await uploadToUguu(buffer, mime)

      await m.reply(`${D.border}\n💭 ➛ Procesando con Stellar...\n${D.border2}`)
      const bufferNoBg = await removeBgFromUrl(uguuUrl)

      await conn.sendMessage(m.chat, {
        image: bufferNoBg,
        caption: `${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

 ⤷ ┇ 🍝 LISTO ：✿ 。

${D.border2}
${D.footer}`
      }, { quoted: m })

      await m.react('✅')

    } catch (e) {
      await m.react('❌')
      await m.reply(`${D.border}
⤷ ┇ 😿 NO SE PUDO ：✿ 。

──愛 *DETALLE* ╏ ❄️
⚠️ ➛ ${e.message || e}

──愛 *TIP* ╏ ❄️
💭 ➛ Imagen menor a 5MB
💭 ➛ Si falla intenta otra vez

${D.border2}`)
    }
}

handler.help = ['removebg', 'nobg', 'rbg']
handler.tags = ['tools']
handler.command = /^(removebg|nobg|rbg)$/i
export default handler