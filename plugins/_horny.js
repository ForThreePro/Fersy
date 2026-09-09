let handler = async (m, { conn }) => {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender
    let name = await conn.getName(who)

    // URL por defecto si no tiene foto
    let defaultAvatar = 'https://files.evogb.win/E2yVdA.jpg'

    // Intentamos sacar la foto. Si falla, usamos la default
    let pp = await conn.profilePictureUrl(who, 'image').catch(() => defaultAvatar)

    // VALIDACIÓN EXTRA: por si devuelve "" o null
    if (!pp ||!pp.startsWith('http')) {
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