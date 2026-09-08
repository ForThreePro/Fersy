import fetch from 'node-fetch'

let handler = async (m, { conn, participants }) => {
    if (!m.isGroup) return m.reply('🐱 Este comando solo funciona en grupos')

    // 2 random del grupo
    let members = participants.map(u => u.id)
    let user1 = members[Math.floor(Math.random() * members.length)]
    let user2 = members[Math.floor(Math.random() * members.length)]

    while(user1 === user2){
        user2 = members[Math.floor(Math.random() * members.length)]
    }

    await conn.reply(m.chat, `💘 *CALCULANDO SHIP...* 💘\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}`, m, { mentions: [user1, user2] })

    try {
        // Saca fotos de perfil
        let pp1 = await conn.profilePictureUrl(user1, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
        let pp2 = await conn.profilePictureUrl(user2, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

        // API con tu key en la URL
        let api = `https://api.stellarwa.xyz/generate/ship?user1=${encodeURIComponent(pp1)}&user2=${encodeURIComponent(pp2)}&apikey=proyectsV2`
        
        let res = await fetch(api)
        if(!res.ok) throw await res.text()
        
        let buffer = await res.buffer()

        // Porcentaje
        let porcentaje = Math.floor(Math.random() * 101)
        let texto = porcentaje < 30 ? '💔 Poco probable...' : porcentaje < 60 ? '💛 Hay una chance' : porcentaje < 80 ? '❤️ Se ven bien juntos' : '💖 SON ALMAS GEMELAS!!'

        let caption = `🐱 *GARFIELD SHIP* 🐱\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}\n\n*Compatibilidad: ${porcentaje}%*\n${texto}`

        await conn.sendFile(m.chat, buffer, 'ship.jpg', caption, m, { mentions: [user1, user2] })

    } catch (e) {
        console.log(e)
        m.reply('⚠️ Error al generar el ship. Revisa tu key o intenta más tarde')
    }
}

handler.help = ['ship']
handler.tags = ['fun']
handler.command = /^(ship)$/i
handler.group = true

export default handler