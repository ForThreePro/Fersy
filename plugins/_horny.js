let handler = async (m, { conn }) => {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender

    // ARREGLO: Sacar nombre con try catch
    let name
    try {
        name = await conn.getName(who)
        if (!name) name = who.split('@')[0] // Si viene vacío usa el número
    } catch {
        name = who.split('@')[0] // Si da error usa el número
    }

    // URL por defecto
    let defaultAvatar = 'https://files.evogb.win/E2yVdA.jpg'

    // Sacamos la foto con try catch también
    let pp
    try {
        pp = await conn.profilePictureUrl(who, 'image')
        if (typeof pp!== 'string' ||!pp.startsWith('http')) pp = defaultAvatar
    } catch {
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