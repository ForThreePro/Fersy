import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime ||!/image/.test(mime))
    return conn.reply(m.chat, `🐱 *Responde a una imagen con* ${usedPrefix}setimg`, m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    let media = await q.download()
    let link = await myCloud(media)
    if (!link.url) throw new Error('No se obtuvo URL')

    // 1. GUARDAR EN DB
    global.botimg = link.url
    if (!global.db.data.settings) global.db.data.settings = {}
    global.db.data.settings.botimg = link.url

    // 2. EDITAR EL CONFIG.JS PARA CAMBIAR EL FALLBACK
    let configPath = path.join('./config.js')
    let configFile = fs.readFileSync(configPath, 'utf8')

    // Busca la linea del fallback y la reemplaza
    configFile = configFile.replace(
      /global\.botimg = global\.db\?\.\data\?\.\settings\?\.\botimg \|\| '.*?'/,
      `global.botimg = global.db?.data?.settings?.botimg || '${link.url}'`
    )

    fs.writeFileSync(configPath, configFile)

    let txt = `🐱 *𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𝗢𝗙𝗜𝗖𝗜𝗔𝗟* 🐱

*━━━━━━━━━━*
*✅ IMAGEN PERMANENTE ACTUALIZADA*

*➤ Enlace:* ${link.url}
*➤ Guardado en:* DB + config.js
*➤ Bots:* Ricky | Nox | Antitop | Lovesitap | Garfield

*Nota:* Aunque borres la DB o instales desde 0, esta imagen sera el fallback
*━━━━━━━━━━*
> _"Ahora si es permanente de verdad"_ ⚡`

    await conn.sendMessage(m.chat, { image: { url: link.url }, caption: txt }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, `*Error:* ${e.message}`, m)
  }
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