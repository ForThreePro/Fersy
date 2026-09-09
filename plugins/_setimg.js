import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

let handler = async (m, { conn, usedPrefix }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  
  if (!mime || !/image/.test(mime)) 
    return conn.reply(m.chat, `🐱 *𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𝗢𝗙𝗜𝗖𝗜𝗔𝗟* 🐱

*━━━━━━━━━━*
*⚠️ ERROR DE USO ⚠️*

*Instrucciones:*
*➤* Responde a una *imagen* con ${usedPrefix}setimg
*➤* Solo se aceptan: *Imagen JPG/PNG*

*━━━━━━━━━━*
*Owner:* @whois.yallico 
*WhatsApp:* +51 927 174 369`, m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    let media = await q.download()
    let link = await myCloud(media)
    if (!link.url) throw new Error('No se obtuvo URL')

    // GUARDAR EN GLOBAL Y DB PARA LOS 4 BOTS
    global.botimg = link.url
    if (!global.db.data.settings) global.db.data.settings = {}
    global.db.data.settings.botimg = link.url

    let txt = `🐱 *𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𝗢𝗙𝗜𝗖𝗜𝗔𝗟* 🐱

*━━━━━━━━━━*
*✅ IMAGEN GLOBAL ACTUALIZADA*

*📊 DATOS*
*➤ Enlace:* ${link.url}
*➤ Peso:* ${formatBytes(media.length)}
*➤ Servidor:* *evogb.win*
*➤ Bots:* Ricky | Nox | Antitop | Lovesitap | Garfield

*━━━━━━━━━━*
*Owner:* @whois.yallico 
*WhatsApp:* +51 927 174 369
> _"Todos los menus usaran esta imagen ahora"_ ☁️⚡`

    await conn.sendMessage(m.chat, {
      image: { url: link.url },
      caption: txt,
      mentions: [m.sender]
    }, { quoted: m })
    
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, `🐱 *𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𝗢𝗙𝗜𝗖𝗜𝗔𝗟* 🐱

*━━━━━━━━━━*
*❌ ERROR DE SUBIDA ❌*

*Aviso:*
*➤* No se pudo subir la imagen
*➤* Intenta con otra imagen

*━━━━━━━━━━*
*Owner:* @whois.yallico 
*WhatsApp:* +51 927 174 369`, m)
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
  const ext = fileType? fileType.ext : 'jpg'
  const mime = fileType? fileType.mime : 'image/jpeg'
  const formData = new FormData()
  formData.append("file", new Blob([content], { type: mime }), `${crypto.randomBytes(5).toString("hex")}.${ext}`)
  const response = await fetch("https://evogb.win/api/upload", { method: "POST", body: formData })
  if (!response.ok) throw new Error()
  return await response.json()
}

handler.help = ['setimg'];
handler.tags = ['owner'];
handler.command = ['setimg', 'setimage'];
handler.rowner = true;
export default handler