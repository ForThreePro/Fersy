import axios from 'axios'
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
    title: '𝐂𝐎𝐓𝐈 𝐑𝐄𝐌𝐁𝐆',
    footer: '> "Florece sin fondo" 🦋',
    process: '🪷 QUITANDO FONDO',
    found: '🌸 FONDO ELIMINADO',
    error: '🥀 NO FLORECIÓ'
}

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'png'
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
  if (!url) throw new Error("Respuesta inválida de Uguu: " + JSON.stringify(data))
  return url
}

async function removeBgFromUrl(url) {
  const apiUrl = `${api.url}/tools/removebg?method=url&url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer' })
  if (!res.data) {
    throw new Error('Respuesta inválida del servidor de removebg')
  }
  return Buffer.from(res.data)
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) {
      return m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ 𝗘𝗟𝗜𝗠𝗜𝗡𝗔𝗗𝗢𝗥 𝗗𝗘 𝗙𝗢𝗡𝗗𝗢

──愛 *COMO USAR* ╏ ❄️
💭 ➛ Responde a una imagen con: *${usedPrefix + command}*

${D.border2}
${D.footer}
━━━━━━━━━━━`)
    }

    try {
      await m.react('🪷')
      await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ ${D.process} ：✿ 。

  ꒱ ׁ. ᘏ 𝗣𝗥𝗢𝗖𝗘𝗦𝗢 ׅ 𝆬 ָ֢ ෆ
💭 ➛ Subiendo imagen a Uguu...
💭 ➛ Quitando fondo...

${D.border2}`)

      const media = await q.download()
      const uguuUrl = await uploadToUguu(media, mime)
      const bufferNoBg = await removeBgFromUrl(uguuUrl)

      await conn.sendMessage(m.chat, {
        image: bufferNoBg,
        caption: `${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.💭꒷

 ⤷ ┇ ${D.found} ：✿ 。

${D.border2}
${D.footer}
━━━━━━━━━━━`
      }, { quoted: m })

      await m.react('✅')

    } catch (e) {
      await m.react('❌')
      await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

.⃟𖥔 ݁. 𖦹˙— \`\`${D.title}\`\` —˙𖦹.⚠️꒷

 ⤷ ┇ ${D.error} ：✿ 。

──愛 *FALLA* ╏ ❄️
⚠️ ➛ ${e.message || e}

${D.border2}`)
    }
}

handler.help = ['removebg']
handler.tags = ['herramientas', 'ia']
handler.command = ['removebg', 'bg', 'quitafondo']
export default handler