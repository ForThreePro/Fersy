import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

let handler = async (m, { conn }) => {
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) {
    await react('❌')
    return conn.reply(m.chat, `𐔌 ꒱ ***UPLOADER*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`USO\`\` —˙𖦹.☁️꒷

── *📖 COMO USAR* ╏
➛ Responde a una *imagen, video, audio o documento*
➛ Formatos: Imagen | Video | Audio | Doc

━━━━━━━━━━━`, m)
  }

  try {
    await react('⏳')
    await m.reply(`𐔌 ꒱ ***UPLOADER*** 𐔌 ꒱ ⏳

.⃟𖥔 ݁. 𖦹˙— \`\`SUBIENDO\`\` —˙𖦹.☁️꒷

── *📊 ESTADO* ╏
⏳ ➛ Subiendo archivo a la nube...

━━━━━━━━━━━`)

    let media = await q.download()
    let link = await myCloud(media)
    if (!link.url) throw new Error()

    let txt = `𐔌 ꒱ ***UPLOADER*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` —˙𖦹.☁️꒷

── *📊 DATOS DEL ARCHIVO* ╏
🔗 ➛ Enlace: ${link.url}
🆔 ➛ ID: ${link.id || 'N/A'}
📦 ➛ Peso: ${formatBytes(media.length)}
🖥️ ➛ Servidor: evogb.win

━━━━━━━━━━━`

    await conn.sendFile(m.chat, media, 'file.' + link.url.split('.').pop(), txt, m)
    await react('✅')
  } catch (e) {
    console.error(e)
    await react('❌')
    await conn.reply(m.chat, `𐔌 ꒱ ***UPLOADER*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ No se pudo subir el archivo
💡 ➛ Intenta con otro archivo

━━━━━━━━━━━`, m)
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

async function myCloud(content) {
  const fileType = await fileTypeFromBuffer(content)
  const ext = fileType? fileType.ext : 'bin'
  const mime = fileType? fileType.mime : 'application/octet-stream'
  const formData = new FormData()
  formData.append("file", new Blob([content], { type: mime }), `${crypto.randomBytes(5).toString("hex")}.${ext}`)
  const response = await fetch("https://evogb.win/api/upload", { method: "POST", body: formData })
  if (!response.ok) throw new Error()
  return await response.json()
}

handler.help = ['tourl'];
handler.tags = ['tools'];
handler.command = ['upp', 'tourl'];
export default handler