let handler = async (m, { conn }) => {
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participants = groupMetadata.participants
    let botNumber = conn.user.jid
    let candidates = participants.filter(p => !p.admin && p.id !== botNumber)
    if (!candidates.length) return m.reply(`‧˚꒰💗୭ *𝐅𝐄𝐑𝐒𝐘 𝐁𝐎𝐓*\n\n꒰💞꒱ No hay víctimas preciosa, todos son admins`)

    let victim = candidates[Math.floor(Math.random() * candidates.length)]
    await conn.sendMessage(m.chat, { 
        text: `‧˚꒰💗୭ *_𝐑 𝐔 𝐋 𝐄 𝐓 𝐀 𝐁 𝐀 𝐍_*\n*𝐅𝐄𝐑𝐒𝐘 𝐁𝐎𝐓 💞*\n\n╭───GIRANDO ꒰💗꒱────╮\n‧˚꒰💞୭ Eligiendo víctima...\n‧˚꒰💖୭ Participantes: ${candidates.length}\n╰─────── ݁ ˖Ი𐑼⋆────╯\n\n꒰💘꒱ La ruleta eligió a @${victim.id.split('@')[0]} 💥\n\n*¡FERSY TE MANDÓ A LA LOBBY!* 💗`,
        mentions: [victim.id]
    })
    await new Promise(r => setTimeout(r, 1500))
    try {
        await conn.groupParticipantsUpdate(m.chat, [victim.id], 'remove')
        await conn.sendMessage(m.chat, { react: { text: '💗', key: m.key } })
    } catch (e) {
        m.reply(`‧˚꒰💗୭ *𝐅𝐄𝐑𝐒𝐘 𝐁𝐎𝐓*\n\n꒰💞꒱ No pude expulsar a @${victim.id.split('@')[0]}`, null, { mentions: [victim.id] })
    }
}
handler.help = ['ruletaban']
handler.tags = ['group']
handler.command = /^(ruletaban|ruletab)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler