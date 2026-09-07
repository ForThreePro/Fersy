let handler = async (m, { conn, args, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return m.reply('《✤》 Este comando solo funciona en grupos')
    if (!isAdmin) return m.reply('《✤》 Necesitas ser admin para usar este comando')
    if (!isBotAdmin) return m.reply('《✤》 Necesito ser admin para poder etiquetar a todos')

    let text = args.join(' ')
    let groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
    let groupName = groupMetadata?.subject || 'Grupo'
    let participants = groupMetadata?.participants.map(p => p.id) || []

    if (!text) {
        return m.reply(`《✤》 Ingresa un texto\n*Ejemplo:* .n buenos días , está para sorteo`)
    }

    const fecha = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) + ' 🌙'

    try {
        await conn.sendMessage(m.chat, { 
            text: text,
            mentions: participants,
            contextInfo: {
                mentionedJid: participants,
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: groupName,
                    body: `${groupName} 💗☁️ | ${fecha}`,
                    thumbnail: await (await fetch('https://files.evogb.win/fw2NBP.jpg')).buffer(), // logo
                    sourceUrl: `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: null })
        
    } catch (e) {
        console.log(e)
        return m.reply('《✤》 Error: ' + e.message)
    }
}

handler.help = ['n <texto>']
handler.tags = ['grupo']
handler.command = /^n$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler