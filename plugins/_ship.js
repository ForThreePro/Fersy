import fetch from 'node-fetch'

let handler = async (m, { conn, participants }) => {
    if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos')

    let members = participants.map(u => u.id)
    let user1 = members[Math.floor(Math.random() * members.length)]
    let user2 = members[Math.floor(Math.random() * members.length)]
    while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)]

    let tag1 = '@' + user1.split('@')[0]
    let tag2 = '@' + user2.split('@')[0]

    await conn.sendMessage(m.chat, {
        text: `💘 Calculando compatibilidad...\n\n${tag1} + ${tag2}`,
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

        // NUEVAS EXPLICACIONES SIN GARFIELD
        let explicacion = ''
        if(porcentaje < 20) explicacion = `Hay 0 química. Mejor amigos y ya 😅`
        else if(porcentaje < 40) explicacion = `Poca compatibilidad. Se caen bien pero nada más 💛`
        else if(porcentaje < 60) explicacion = `Hay algo ahí... Tal vez con tiempo funcione ✨`
        else if(porcentaje < 80) explicacion = `Buena conexión. Se ven muy bien juntos ❤️`
        else if(porcentaje < 100) explicacion = `Compatibilidad altísima. Tienen futuro juntos 💖`
        else explicacion = `100% ALMAS GEMELAS. Están destinados 💍`

        let caption = `💘 *RESULTADO DEL SHIP* 💘\n\n${tag1} + ${tag2}\n\n*Compatibilidad: ${porcentaje}%*\n${explicacion}`

        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: caption,
            mentions: [user1, user2]
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