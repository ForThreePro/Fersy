import uploadImage from '../lib/uploadImage.js'

let handler = async (m, { conn, usedPrefix }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime)
    return conn.reply(m.chat, `🍰 *Responde a una imagen con* ${usedPrefix}setimg 🌸`, m)

  if (!/image\/(jpe?g|png)/.test(mime))
    return conn.reply(m.chat, `🍰 *Solo se aceptan imagenes JPG/PNG* 🌸`, m)

  await m.react('⏳')

  try {
    let media = await q.download()
    let url = await uploadImage(media)

    // Guardar en global y en DB para que sobreviva al.reset
    global.botimg = url
    if (!global.db.data.settings) global.db.data.settings = {}
    global.db.data.settings.botimg = url

    let txt = `🍰 𓆩 𝗜𝗠𝗔𝗚𝗘𝗡 𝗚𝗟𝗢𝗕𝗔𝗟 𝗔𝗖𝗧𝗨𝗔𝗟𝗜𝗭𝗔𝗗𝗔 𓆪 🌸

.⃟𖥔 ݁. 𖦹˙— \`\`SETIMG\`\` —˙𖦹.🍜꒷

✅ *Imagen actualizada correctamente*
🌐 *Bots afectados:* Ricky | Nox | Antitop | Lovesitap
📎 *Link:* ${url}

> "Desde ahora todos los menus usaran esta imagen" 💎`

    await conn.sendMessage(m.chat, {
      image: { url: url },
      caption: txt
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    return m.reply(`🍰 *Error:* ${e.message}`)
  }
}

handler.help = ['setimg']
handler.tags = ['owner']
handler.command = /^(setimg|setimage)$/i
handler.rowner = true

export default handler