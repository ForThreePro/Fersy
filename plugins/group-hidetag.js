import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, args, text, participants, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return m.reply('《✤》 Solo en grupos')
    if (!isAdmin) return m.reply('《✤》 Solo admins')
    if (!isBotAdmin) return m.reply('《✤》 Bot necesita ser admin')

    const users = participants.map((u) => u.id)
    const group = await conn.groupMetadata(m.chat).catch(() => ({}))
    const groupName = group.subject || 'Grupo'
    const userText = text || ''
    
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    const isMedia = /image|video|sticker|audio/.test(mime)
    
    // FECHA ESTILO ESTADO
    const fecha = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) + ' 🌙'
    
    // LOGO PARA EL RECUADRO - CAMBIALO
    const thumb = await (await fetch('https://files.evogb.win/fw2NBP.jpg')).buffer().catch(() => Buffer.alloc(0))

    const contextInfo = {
        mentionedJid: users,
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
            title: groupName,
            body: `${groupName} 💗☁️ | ${fecha}`,
            thumbnail: thumb,
            sourceUrl: `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat).catch(() => '')}`,
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }

    try {
        if (isMedia) {
            const media = await q.download()
            const type = q.mtype.replace('Message', '').toLowerCase()
            
            let messageContent = { mentions: users, contextInfo }
            if (type === 'image') messageContent.image = media
            if (type === 'video') { messageContent.video = media; messageContent.mimetype = 'video/mp4' }
            if (type === 'audio') { messageContent.audio = media; messageContent.mimetype = 'audio/mpeg'; messageContent.fileName = 'hidetag.mp3' }
            if (type === 'sticker') messageContent.sticker = media
            
            if (userText) messageContent.caption = userText
            else if (q.text || q.caption) messageContent.caption = q.text || q.caption
            
            return await conn.sendMessage(m.chat, messageContent)
        }

        // SOLO TEXTO
        const finalText = userText || q.text || q.caption || '*Hola :D*'
        return await conn.sendMessage(m.chat, {
            text: finalText,
            mentions: users,
            contextInfo: contextInfo
        })

    } catch (e) {
        console.log(e)
        return m.reply(`《✤》 Error: ${e.message}`)
    }
}

handler.help = ['n <texto>', 'hidetag <texto>', 'noti <texto>', 'aviso <texto>']
handler.tags = ['group']
handler.command = ['n', 'hidetag', 'noti', 'aviso', 'notify', 'notificar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler