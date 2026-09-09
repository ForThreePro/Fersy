import fetch from 'node-fetch'

let handler = async (m, { conn, participants, command }) => {
    let defaultImg = 'https://files.evogb.win/E2yVdA.jpg'
    let key = 'proyectsV2'

    // ===== FUNCIÓN PARA SACAR AVATAR SEGURO =====
    const getAvatar = async (jid) => {
        try {
            let url = await conn.profilePictureUrl(jid, 'image')
            if(url && url.startsWith('https')) return url
        } catch {}
        return defaultImg
    }

    // ===== FUNCIÓN PARA SACAR NOMBRE SEGURO =====
    const getName = async (jid) => {
        try {
            let name = await conn.getName(jid)
            return name || jid.split('@')[0]
        } catch {
            return jid.split('@')[0]
        }
    }

    // ===== COMANDO HORNY =====
    if (command === 'horny') {
        let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender
        let name = await getName(who)
        let pp = await getAvatar(who)

        let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}`

        try {
            let res = await fetch(apiUrl, { timeout: 20000 })
            if(!res.ok) throw new Error('API ' + res.status)
            let buffer = await res.buffer()
            if(buffer.length < 5000) throw new Error('Imagen vacía')

            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `@${name} está así ahora mismo 😏🔥`,
                mentions: [who]
            })
        } catch (e) {
            console.log(e)
            m.reply(`⚠️ Error al generar la imagen. La API está saturada, intenta en 10s`)
        }
    }

    // ===== COMANDO SHIP =====
    if (command === 'ship') {
        if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos')
        let members = participants.map(u => u.id)
        if (members.length < 2) return m.reply('⚠️ Necesitan mínimo 2 personas')

        // Si menciona 2 usa esos, si no random
        let user1, user2
        if (m.mentionedJid.length >= 2) {
            user1 = m.mentionedJid[0]
            user2 = m.mentionedJid[1]
        } else {
            user1 = members[Math.floor(Math.random() * members.length)]
            user2 = members[Math.floor(Math.random() * members.length)]
            while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)]
        }

        let name1 = await getName(user1)
        let name2 = await getName(user2)

        await conn.sendMessage(m.chat, {
            text: `💘 Calculando compatibilidad...\n\n@${name1} + @${name2}`,
            mentions: [user1, user2]
        })

        try {
            let avatar1 = await getAvatar(user1)
            let avatar2 = await getAvatar(user2)
            let background = 'https://files.evogb.win/7BY3Yv.jpg'

            let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(background)}&key=${key}`

            let res = await fetch(apiUrl, { timeout: 20000 })
            if(!res.ok) throw new Error('API ' + res.status)
            let buffer = await res.buffer()
            if(buffer.length < 5000) throw new Error('Imagen vacía')

            let porcentaje = Math.floor(Math.random() * 101)
            let explicacion = ''
            if(porcentaje < 20) explicacion = `Hay 0 química. Mejor amigos y ya 😅`
            else if(porcentaje < 40) explicacion = `Poca compatibilidad. Se caen bien pero nada más 💛`
            else if(porcentaje < 60) explicacion = `Hay algo ahí... Tal vez con tiempo funcione ✨`
            else if(porcentaje < 80) explicacion = `Buena conexión. Se ven muy bien juntos ❤️`
            else if(porcentaje < 100) explicacion = `Compatibilidad altísima. Tienen futuro juntos 💖`
            else explicacion = `100% ALMAS GEMELAS. Están destinados 💍`

            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `💘 *RESULTADO DEL SHIP* 💘\n*@${name1}* + *@${name2}*\n\n*Compatibilidad: ${porcentaje}%*\n${explicacion}`,
                mentions: [user1, user2]
            })

        } catch (e) {
            console.log(e)
            m.reply(`⚠️ Error al generar la imagen. La API está saturada, intenta en 10s`)
        }
    }
}

handler.help = ['horny @tag', 'ship @tag1 @tag2']
handler.tags = ['fun']
handler.command = ['horny', 'ship']
export default handler