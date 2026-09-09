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
    if (!global.db.data.settings) global.db.data.settings = {}
    global.db.data.settings.botimg = link.url

    // 2. ACTUALIZAR VARIABLE AL INSTANTE
    global.botimg = link.url

    // 3. EDITAR EL CONFIG.JS PARA CAMBIAR EL FALLBACK
    let configPath = path.join('./config.js')
    let configFile = fs.readFileSync(configPath, 'utf8')

    // Reemplaza la URL del fallback
    configFile = configFile.replace(
      /global\.botimg = global\.db\?\.\data\?\.\settings\?\.\botimg \|\| '.*?'/,
      `global.botimg = global.db?.data?.settings?.botimg || '${link.url}'`
    )

    fs.writeFileSync(configPath, configFile)

    let txt = `✅ *𝗜𝗠𝗔𝗚𝗘𝗡 𝗚𝗟𝗢𝗕𝗔𝗟 𝗔𝗖𝗧𝗨𝗔𝗟𝗜𝗭𝗔𝗗𝗔*

*➤ Nueva URL:* ${link.url}
*➤ Guardado en:* DB + config.js
*➤ Ahora el fallback también es esta imagen*

> _Ya quedó permanente hasta en instalaciones desde 0_`

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
handler.command = ['setimg'];
handler.rowner = true;
export default handler