import fetch from 'node-fetch'
import FormData from 'form-data'

// ===== CONFIG API STELLAR =====
const api = {
    url: 'https://api.stellarwa.xyz',
    key: 'garfield-vip'
}

// ===== DISEÑO COTTI BOT =====
const D = {
    name: 'COTTI BOT',
    emoji: '🪷🌸',
    border: '╭── 𓆩🪷𓆪 ──╮',
    border2: '╰── 𓆩🌸𓆪 ──╯',
    title: '𝐂𝐎𝐓𝐈 𝐇𝐃',
    footer: '> "Florece en alta calidad" 🦋',
    process: '🪷 MEJORANDO IMAGEN',
    found: '🌸 IMAGEN MEJORADA',
    error: '🥀 NO FLORECIÓ'
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

  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    body,
    headers: body.getHeaders(),
    timeout: 30000
  })

  const json = await res.json()
  const url = json.files?.[0]?.url
  if (!url) throw 'No se pudo subir a Uguu'
  return url
}

async function getEnhancedBuffer(url) {
  const apiUrl = `${api.url}/tools/upscale?url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await fetch(apiUrl, { timeout: 60000 })
  if (!res.ok) throw `Error ${res.status}: ${await res.text()}`
  return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!mime) return m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗠𝗘𝗝𝗢𝗥𝗔𝗗𝗢𝗥 𝗗𝗘 𝗜𝗠𝗔𝗚𝗘𝗡

──愛 *COMO USAR* ╏ ❄️
💭 ➛ Responde a una imagen con: *${usedPrefix + command}*
💭 ➛ Soporta: jpg, jpeg, png

${D.border2}
${D.footer}
━━━━━━━━━━━`)

    if (!/image\/(jpe?g|png)/.test(mime)) {
      return m.reply(`${D.border}
⚠️ ➛ El formato *${mime}* no es compatible
${D.border2}`)
    }

    try {
      await m.react('🪷')
      await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ ${D.process} ：✿ 。

  ꒱ ׁ. ᘏ 𝗣𝗥𝗢𝗖𝗘𝗦𝗢 ׅ 𝆬 ָ֢ ෆ
💭 ➛ Subiendo imagen a Uguu...
💭 ➛ Mejorando calidad 2x...

${D.border2}`)

      const buffer = await q.download()
      const uploadedUrl = await uploadToUguu(buffer, mime)
      const enhancedBuffer = await getEnhancedBuffer(uploadedUrl)

      await conn.sendMessage(m.chat, {
        image: enhancedBuffer,
        caption: `${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ ${D.found} ：✿ 。

  ꒱ ׁ. ᘏ 𝗗𝗘𝗧𝗔𝗟𝗘𝗦 ׅ 𝆬 ָ֢ ෆ
📌 ➛ Calidad: Mejorada 2x
📌 ➛ Listo para descargar

${D.border2}
${D.footer}
━━━━━━━━━━━`
      }, { quoted: m })

      await m.react('✅')

    } catch (err) {
      await m.react('❌')
      await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.⚠️꒷

 ⤷ ┇ ${D.error} ：✿ 。

──愛 *FALLA* ╏ ❄️
⚠️ ➛ ${err.message || err}

${D.border2}`)
    }
}

handler.help = ['hd', 'upscale']
handler.tags = ['herramientas', 'ia']
handler.command = ['hd', 'upscale', 'a']
export default handler