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
        let avatar1 = await conn.profilePictureUrl(user1, 'image').catch(_ => defaultImg)
        let avatar2 = await conn.profilePictureUrl(user2, 'image').catch(_ => defaultImg)
        
        // Fondo por defecto de corazones
        let background = 'https://i.imgur.com/jm5Yl1r.png'

        // NUEVA URL CON LOS PARAMETROS CORRECTOS
        let url = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(background)}&key=proyectsV2`
        
        let res = await fetch(url)
        if(!res.ok) {
            let error = await res.text()
            return m.reply(`⚠️ Error de la API:\n${error}`)
        }
        
        let buffer = await res.buffer()

        let porcentaje = Math.floor(Math.random() * 101)
        let texto = porcentaje < 30 ? '💔 Frio frio...' : porcentaje < 60 ? '💛 Podría funcionar' : porcentaje < 80 ? '❤️ Tienen química' : '💖 BODA A LA VISTA!!'

        await conn.sendFile(m.chat, buffer, 'ship.png', `🐱 *GARFIELD SHIP* 🐱\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}\n\n*Compatibilidad: ${porcentaje}%*\n${texto}`, m, { mentions: [user1, user2] })

    } catch (e) {
        console.log(e)
        m.reply('⚠️ Error al conectar con la API')
    }
}

handler.help = ['ship']
handler.tags = ['fun']
handler.command = ['ship']
handler.group = true

export default handler