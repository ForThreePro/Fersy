import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import fs from 'fs'
import { fileURLToPath } from 'url'
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

    // 2. ACTUALIZAR VARIABLE
    global.botimg = link.url

    // 3. EDITAR CONFIG.JS CON RUTA ABSOLUTA
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const configPath = path.join(__dirname, '../config.js') // Sube 1 carpeta porque setimg está en plugins

    let configFile = fs.readFileSync(configPath, 'utf8')

    // Busca la línea y la reemplaza completa
    const newLine = `global.botimg = global.db?.data?.settings?.botimg || '${link.url}'`
    configFile = configFile.replace(/global\.botimg =.*?'https:\/\/files\.evogb\.win\/.*?'/, newLine)

    fs.writeFileSync(configPath, configFile, 'utf8')

    let txt = `✅ *𝗜𝗠𝗔𝗚𝗘𝗡 𝗔𝗖𝗧𝗨𝗔𝗟𝗜𝗭𝗔𝗗𝗔 𝗘𝗡 𝟯 𝗣𝗔𝗥𝗧𝗘𝗦*

*1. DB:* Guardado
*2. Memoria:* Actualizado al instante
*3. config.js:* Fallback cambiado

*Nueva URL:* ${link.url}

> _Haz.reset para que se recargue el config_`

    await conn.sendMessage(m.chat, { image: { url: link.url }, caption: txt }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, `*Error al editar config:* ${e.message}\n\n*Asegúrate que el bot tenga permisos de escritura*`, m)
  }
}

async function myCloud(content) {
  const fileType = await fileTypeFromBuffer(content)
  const ext = fileType? fileType.ext : 'jpg'
  const mime = fileType? fileType.mime : 'image/jpeg'
  const formData = new FormData()
  formData.append("file", new Blob([content], { type: mime }), `${crypto.randomBytes(5).toString("hex")}.${ext}`)
  const response = await fetch("https://evogb.win/api/upload", { method: "POST", body: formData })
  return await response.json()
}

handler.help = ['setimg'];
handler.tags = ['owner'];
handler.command = ['setimg'];
handler.rowner = true;
export default handler