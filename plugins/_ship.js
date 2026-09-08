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
        let defaultImg = 'https://i.imgur.com/1tMFa32.png'
        let avatar1 = await conn.profilePictureUrl(user1, 'image').catch(_ => defaultImg)
        let avatar2 = await conn.profilePictureUrl(user2, 'image').catch(_ => defaultImg)
        let background = 'https://files.evogb.win/7BY3Yv.jpg'

        let url = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(background)}&key=proyectsV2`
        
        let res = await fetch(url)
        let txt = await res.text() // Leemos todo como texto primero
        
        console.log("RESPUESTA DE STELLAR:", txt) // Mira tu consola
        
        if(!res.ok || txt.includes('error')) {
            return m.reply(`⚠️ Error de Stellar:\n${txt}`)
        }
        
        // Si es imagen directa
        let buffer = Buffer.from(txt, 'binary')
        
        let porcentaje = Math.floor(Math.random() * 101)
        let texto = porcentaje < 30 ? '💔 Ni con magia...' : porcentaje < 60 ? '💛 Tal vez...' : porcentaje < 80 ? '❤️ Se ven lindos' : '💖 CASORIO YA!!'

        await conn.sendFile(m.chat, buffer, 'ship.jpg', `🐱 *GARFIELD SHIP* 🐱\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}\n\n*${porcentaje}%*\n${texto}`, m, { mentions: [user1, user2] })

    } catch (e) {
        console.log(e)
        m.reply(`⚠️ Error: ${e}`)
    }
}

handler.command = ['ship']
handler.group = true
export default handler