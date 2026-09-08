import fetch from 'node-fetch'

let handler = async (m, { conn, participants }) => {
    if (!m.isGroup) return m.reply('🐱 Este comando solo funciona en grupos')

    let members = participants.map(u => u.id)
    let user1 = members[Math.floor(Math.random() * members.length)]
    let user2 = members[Math.floor(Math.random() * members.length)]
    while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)]

    await conn.sendMessage(m.chat, { 
        text: `💘 *CALCULANDO SHIP...* 💘\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}`,
        mentions: [user1, user2]
    })

    try {
        let defaultImg = 'https://i.imgur.com/1tMFa32.png'
        let pp1 = await conn.profilePictureUrl(user1, 'image').catch(_ => defaultImg)
        let pp2 = await conn.profilePictureUrl(user2, 'image').catch(_ => defaultImg)

        // URL CORRECTA CON key=
        let url = `https://api.stellarwa.xyz/generate/ship?user1=${pp1}&user2=${pp2}&key=proyectsV2`
        
        let res = await fetch(url)
        if(!res.ok) {
            let error = await res.json().catch(_ => res.text())
            return m.reply(`⚠️ Error de la API:\n${JSON.stringify(error)}`)
        }
        
        let buffer = await res.buffer()

        let porcentaje = Math.floor(Math.random() * 101)
        let texto = porcentaje < 30 ? '💔 Frio frio...' : porcentaje < 60 ? '💛 Podría funcionar' : porcentaje < 80 ? '❤️ Tienen química' : '💖 BODA A LA VISTA!!'

        await conn.sendFile(m.chat, buffer, 'ship.png', `🐱 *GARFIELD SHIP* 🐱\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}\n\n*Compatibilidad: ${porcentaje}%*\n${texto}`, m, { mentions: [user1, user2] })

    } catch (e) {
        console.log(e)
        m.reply('⚠️ Error al conectar con la API. Revisa tu internet')
    }
}

handler.help = ['ship']
handler.tags = ['fun']
handler.command = ['ship']
handler.group = true

export default handler