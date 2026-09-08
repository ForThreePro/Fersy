import fetch from 'node-fetch'

let handler = async (m, { conn, participants }) => {
    if (!m.isGroup) return m.reply('🐱 Solo en grupos')

    let members = participants.map(u => u.id)
    let user1 = members[Math.floor(Math.random() * members.length)]
    let user2 = members[Math.floor(Math.random() * members.length)]
    while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)]

    await conn.sendMessage(m.chat, { 
        text: `💘 *CALCULANDO SHIP...* 💘\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}`,
        mentions: [user1, user2]
    })

    try {
        let defaultImg = 'https://files.evogb.win/E2yVdA.jpg' // TU FOTO DEFAULT
        let avatar1 = await conn.profilePictureUrl(user1, 'image').catch(_ => defaultImg)
        let avatar2 = await conn.profilePictureUrl(user2, 'image').catch(_ => defaultImg)
        let background = 'https://files.evogb.win/7BY3Yv.jpg'

        let url = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(background)}&key=proyectsV2`
        
        let res = await fetch(url)
        let json = await res.json() // Stellar con proyectsV2 siempre devuelve JSON
        
        if(json.error) throw json.error
        if(!json.result) throw 'No vino imagen en el result'

        // CONVERTIR BASE64 A BUFFER BIEN
        let buffer = Buffer.from(json.result, 'base64')

        let porcentaje = Math.floor(Math.random() * 101)
        let texto = porcentaje < 30 ? '💔 Ni con magia...' : porcentaje < 60 ? '💛 Tal vez...' : porcentaje < 80 ? '❤️ Se ven lindos' : '💖 CASORIO YA!!'

        // IMPORTANTE: mandar como image, no document
        await conn.sendFile(m.chat, buffer, 'ship.jpg', `🐱 *GARFIELD SHIP* 🐱\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}\n\n*Compatibilidad: ${porcentaje}%*\n${texto}`, m, { 
            mentions: [user1, user2],
            mimetype: 'image/jpeg' // Forzamos que sea imagen
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