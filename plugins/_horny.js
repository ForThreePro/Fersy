let handler = async (m, { conn }) => {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender
    let name = await conn.getName(who)

    // URL por defecto
    let defaultAvatar = 'https://files.evogb.win/E2yVdA.jpg'

    // Sacamos la foto
    let pp = await conn.profilePictureUrl(who, 'image').catch(() => defaultAvatar)

    // FORZAMOS A QUE SEA STRING. Si no es, usamos la default
    if (typeof pp!== 'string' ||!pp ||!pp.startsWith('http')) {
        pp = defaultAvatar
    }

    let key = 'garfield-vip'
    let url = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}`

    await conn.sendFile(m.chat, url, 'horny.jpg', `*${name}* está así ahora mismo 😏🔥`, m)
}
handler.help = ['horny @tag']
handler.tags = ['fun']
handler.command = ['horny']
export default handler