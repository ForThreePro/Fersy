let handler = async (m, { conn }) => {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender
    let name = await conn.getName(who)

    // Si tiene foto usa la de él. Si no, usa la por defecto
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://files.evogb.win/E2yVdA.jpg')

    // TU KEY DE STELLARWA
    let key = 'garfield-vip'

    let url = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}`

    await conn.sendFile(m.chat, url, 'horny.jpg', `*${name}* está así ahora mismo 😏🔥`, m)
}
handler.help = ['horny @tag']
handler.tags = ['fun']
handler.command = ['horny']
export default handler