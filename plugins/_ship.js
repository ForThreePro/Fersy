import fetch from 'node-fetch'

let handler = async (m, { conn, participants }) => {
    if (!m.isGroup) return m.reply('🐱 Solo en grupos')

    let members = participants.map(u => u.id)
    let user1 = members[Math.floor(Math.random() * members.length)]
    let user2 = members[Math.floor(Math.random() * members.length)]
    while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)]

    let name1 = '@' + user1.split('@')[0]
    let name2 = '@' + user2.split('@')[0]

    await conn.sendMessage(m.chat, {
        text: `💘 *CALCULANDO SHIP...* 💘\n\n${name1} + ${name2}`,
        mentions: [user1, user2]
    })

    try {
        let defaultImg = 'https://files.evogb.win/E2yVdA.jpg'
        let avatar1 = await conn.profilePictureUrl(user1, 'image').catch(_ => defaultImg)
        let avatar2 = await conn.profilePictureUrl(user2, 'image').catch(_ => defaultImg)
        let background = 'https://files.evogb.win/7BY3Yv.jpg'

        let url = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(background)}&key=proyectsV2`

        let res = await fetch(url)
        if(!res.ok) throw await res.text()
        let buffer = await res.buffer()

        let porcentaje = Math.floor(Math.random() * 101)
        let texto = porcentaje < 30? '💔 Ni con magia...' : porcentaje < 60? '💛 Tal vez...' : porcentaje < 80? '❤️ Se ven lindos' : '💖 CASORIO YA!!'

        // USAMOS name1 y name2 con el @ para que WhatsApp los pinte
        let caption = `🐱 *GARFIELD SHIP* 🐱\n\n${name1} + ${name2}\n\n*Compatibilidad: ${porcentaje}%*\n${texto}`

        await conn.sendFile(m.chat, buffer, 'ship.png', caption, m, {
            mentions: [user1, user2] // Pasamos los jid completos
        })

    } catch (e) {
        console.log(e)
        m.reply(`⚠️ Error: ${e}`)
    }
}

handler.help = ['ship']
handler.tags = ['fun']
handler.command = ['ship']
handler.group = true

export default handler