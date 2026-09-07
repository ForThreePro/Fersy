let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin, participants }) => {
    if (!m.isGroup) return m.reply('《✤》 Este comando solo funciona en grupos')
    if (!isAdmin) return m.reply('《✤》 Necesitas ser admin para usar este comando')
    if (!isBotAdmin) return m.reply('《✤》 Necesito ser admin para poder etiquetar a todos')

    const groupParticipants = participants || []
    const mentions = groupParticipants.map(p => p.id).filter(Boolean)
    const userText = (args.join(' ') || '').trim()
    
    const src = m.quoted || m
    const hasImage = Boolean(src.message?.imageMessage || src.mtype === 'imageMessage')
    const hasVideo = Boolean(src.message?.videoMessage || src.mtype === 'videoMessage')
    const hasAudio = Boolean(src.message?.audioMessage || src.mtype === 'audioMessage')
    const hasSticker = Boolean(src.message?.stickerMessage || src.mtype === 'stickerMessage')
    const isQuoted = Boolean(m.quoted)
    const originalText = (src.text || src.caption || src.body || '').trim()

    try {
        if (hasImage || hasVideo) {
            const media = await src.download()
            const options = { mentions }
            
            if (isQuoted) {
                if (hasImage) return conn.sendMessage(m.chat, { image: media, caption: originalText || '', ...options })
                else return conn.sendMessage(m.chat, { video: media, mimetype: 'video/mp4', caption: originalText || '', ...options })
            } else {
                if (hasImage) return conn.sendMessage(m.chat, { image: media, caption: userText || '', ...options })
                else return conn.sendMessage(m.chat, { video: media, mimetype: 'video/mp4', caption: userText || '', ...options })
            }
        }
        
        if (hasAudio) { 
            const media = await src.download() 
            return conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mp4', fileName: 'hidetag.mp3', mentions }, { quoted: null }) 
        }
        
        if (hasSticker) { 
            const media = await src.download() 
            return conn.sendMessage(m.chat, { sticker: media, mentions }, { quoted: null }) 
        }
        
        if (isQuoted && originalText) return conn.sendMessage(m.chat, { text: originalText, mentions }, { quoted: null })
        if (userText) return conn.sendMessage(m.chat, { text: userText, mentions }, { quoted: null })
        
        return m.reply(`《✧》 *Ingresa* un texto o *responde* a uno\n*Ej:* ${usedPrefix}${command} buenos días`)
        
    } catch (e) {
        console.log(e)
        return m.reply(`> Ocurrió un error ejecutando *${usedPrefix + command}*\n> [Error: *${e.message}*]`)
    }
}

handler.help = ['n <texto>', 'hidetag <texto>', 'noti <texto>', 'aviso <texto>']
handler.tags = ['group']
handler.command = ['n', 'hidetag', 'noti', 'aviso']
handler.customPrefix = /^(n|hidetag|noti|aviso)$/i // <- ESTO HACE QUE FUNCIONE SIN PREFIJO
handler.description = 'Etiquetar a todos del grupo'
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler