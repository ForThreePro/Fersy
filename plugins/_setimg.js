import fs from 'fs'
import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

let handler = async (m, { conn, args, isOwner, isROwner }) => {
if (!isOwner &&!isROwner) return m.reply(`*Solo Owner*`)

let link = args[0]
let q = m.quoted? m.quoted : m
let mime = (q.msg || q).mimetype || ''

try {
    // CASO 1: RESPONDIÓ A UNA IMAGEN
    if (!link && mime.startsWith('image/')) {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
        let media = await q.download()
        let upload = await myCloud(media)
        if (!upload.url) throw new Error('No se pudo subir')
        link = upload.url
    }

    // CASO 2: PEGO LINK DIRECTO
    if (!link) return m.reply(`*USO INCORRECTO*\n\n*Opción 1:*.setimg https://i.imgur.com/tu-foto.jpg\n*Opción 2:* Responde a una imagen con.setimg`)
    if (!link.startsWith('http')) return m.reply(`*El link debe ser un URL valido*`)

    // Actualizar variable global
    global.botimg = link

    // Guardar en config.json para que no se pierda al reiniciar
    let config = {}
    if (fs.existsSync('./config.json')) {
        config = JSON.parse(fs.readFileSync('./config.json'))
    }
    config.botimg = link
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await m.reply(`*✅ IMAGEN GLOBAL ACTUALIZADA*\n\n*➤ Nuevo link:* ${link}\n*➤ Servidor:* evogb.win\n*➤ Estado:* Se aplico en todos los comandos`)

} catch (e) {
    console.log(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`*Error al subir/guardar la imagen*`)
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

handler.help = ['setimg <link> o responde a imagen']
handler.tags = ['owner']
handler.command = ['setimg', 'img', 'fotobot']
handler.owner = true
export default handler