import fetch from 'node-fetch'
import FormData from 'form-data'

// ===== CONFIG API STELLAR =====
const api = {
    url: 'https://api.stellarwa.xyz',
    key: 'proyectsV2'
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
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!mime) {
      await react('❌')
      return m.reply(`𐔌 ꒱ ***MEJORADOR HD*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`USO\`\` —˙𖦹.🖼️꒷

── *📖 COMO USAR* ╏
➛ Responde a una imagen con: *${usedPrefix + command}*
➛ Soporta: jpg, jpeg, png

━━━━━━━━━━━`)
    }

    if (!/image\/(jpe?g|png)/.test(mime)) {
      await react('❌')
      return m.reply(`𐔌 ꒱ ***MEJORADOR HD*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n⚠️ ➛ El formato *${mime}* no es compatible\n━━━━━━━━━━━`)
    }

    try {
      await react('⏳')
      await m.reply(`𐔌 ꒱ ***MEJORADOR HD*** 𐔌 ꒱ ⏳

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESANDO\`\` —˙𖦹.🖼️꒷

── *📊 ESTADO* ╏
⏳ ➛ Subiendo imagen a Uguu...
⚡ ➛ Mejorando calidad 2x...

━━━━━━━━━━━`)

      const buffer = await q.download()
      const uploadedUrl = await uploadToUguu(buffer, mime)
      const enhancedBuffer = await getEnhancedBuffer(uploadedUrl)

      await conn.sendMessage(m.chat, {
        image: enhancedBuffer,
        caption: `𐔌 ꒱ ***MEJORADOR HD*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` —˙𖦹.✨꒷

── *📊 DETALLES* ╏
✨ ➛ Calidad: Mejorada 2x
🔧 ➛ API: Stellar

━━━━━━━━━━━`
      }, { quoted: m })

      await react('✅')

    } catch (err) {
      await react('❌')
      await m.reply(`𐔌 ꒱ ***MEJORADOR HD*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ ${err.message || err}

━━━━━━━━━━━`)
    }
}

handler.help = ['hd', 'upscale']
handler.tags = ['herramientas', 'ia']
handler.command = ['hd', 'upscale', 'remini']
export default handler