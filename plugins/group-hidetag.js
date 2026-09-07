let handler = async (m, { conn, args, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return m.reply('《✤》 Este comando solo funciona en grupos')
    if (!isAdmin) return m.reply('《✤》 Necesitas ser admin para usar este comando')
    if (!isBotAdmin) return m.reply('《✤》 Necesito ser admin para poder etiquetar a todos')

    const text = args.join(' ')
    let groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
    let groupName = groupMetadata?.subject || 'Grupo' // DETECTA NOMBRE DEL GRUPO
    let groupParticipants = groupMetadata?.participants || []

    const mentions = groupParticipants.map(p => p.id).filter(Boolean)

    if (!m.quoted && !text) {
        return m.reply(`《✤》 Ingresa un texto o responde a un mensaje\n*Ejemplo:* .n buenos días`)
    }

    const q = m.quoted || m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!mime) {
        if (q.msg?.imageMessage) mime = 'image'
        else if (q.msg?.videoMessage) mime = 'video'
        else if (q.msg?.stickerMessage) mime = 'sticker'
        else if (q.msg?.audioMessage) mime = 'audio'
    }

    const isMedia = /image|video|sticker|audio/.test(mime)

    const quotedText =
        q.text ||
        q.caption ||
        q.body ||
        q.message?.conversation ||
        q.message?.extendedTextMessage?.text ||
        ''

    const finalText = text || quotedText
    const hasText = Boolean(finalText && finalText.trim())

    // FECHA COMO EN LA FOTO: "7 de septiembre 🌙"
    const fecha = new Date().toLocaleDateString('es-PE', { 
        day: 'numeric', 
        month: 'long'
    }) + ' 🌙'

    // ESTE ES EL QUE HACE EL EFECTO EXACTO
    const contextInfo = {
        mentionedJid: mentions,
        forwardingScore: 1,
        isForwarded: true,
        externalAdReply: {
            title: groupName, // NOMBRE DEL GRUPO ARRIBA
            body: `${groupName} 💗☁️ | ${fecha}`, // NOMBRE + FECHA ABAJO
            thumbnail: await (await fetch('https://i.imgur.com/8K2V9Qm.jpg')).buffer(), // PON TU LOGO AQUI
            sourceUrl: `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`, // link del grupo
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }

    try {
        if (isMedia) {
            let media = await q.download()
            return conn.sendMessage(m.chat, 
                hasText 
                ? { [mime]: media, caption: finalText, ...contextInfo } 
                : { [mime]: media, ...contextInfo }
            )
        }
        
        if (!hasText) return m.reply('《✤》 Ingresa un texto o responde a un mensaje.')

        return conn.sendMessage(m.chat, { text: finalText, ...contextInfo }, { quoted: null })

    } catch (e) {
        console.log(e)
        return m.reply('《✤》 Ocurrió un error al ejecutar el comando')
    }
}

handler.help = ['n <texto>']
handler.tags = ['grupo']
handler.command = /^n$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler