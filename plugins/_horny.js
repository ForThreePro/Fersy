import fetch from 'node-fetch'

let handler = async (m, { conn, participants, command }) => {
    let defaultImg = 'https://files.evogb.win/E2yVdA.jpg'
    let key = 'proyectsV2' // TU KEY

    // ===== COMANDO.HORNY =====
    if (command === 'horny') {
        let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender

        let name
        try {
            name = await conn.getName(who)
            if (!name) name = who.split('@')[0]
        } catch {
            name = who.split('@')[0]
        }

        let pp
        try {
            pp = await conn.profilePictureUrl(who, 'image')
            if (typeof pp!== 'string' ||!pp.startsWith('http')) pp = defaultImg
        } catch {
            pp = defaultImg
        }

        let url = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}`
        let txt = `@${who.split('@')[0]} está así ahora mismo 😏🔥`
        await conn.sendFile(m.chat, url, 'horny.jpg', txt, m, { mentions: [who] })
    }

    // ===== COMANDO.SHIP =====
    if (command === 'ship') {
        if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos')
        let members = participants.map(u => u.id)
        if (members.length < 2) return m.reply('⚠️ Necesitan mínimo 2 personas en el grupo')

        // NUEVO: Si menciona 2 personas las usa. Si no, random
        let user1, user2
        if (m.mentionedJid.length >= 2) {
            user1 = m.mentionedJid[0]
            user2 = m.mentionedJid[1]
        } else {
            user1 = members[Math.floor(Math.random() * members.length)]
            user2 = members[Math.floor(Math.random() * members.length)]
            while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)]
        }

        let tag1 = '@' + user1.split('@')[0]
        let tag2 = '@' + user2.split('@')[0]

        await conn.sendMessage(m.chat, {
            text: `💘 Calculando compatibilidad...\n\n${tag1} + ${tag2}`,
            mentions: [user1, user2]
        })

        try {
            let avatar1
            try {
                avatar1 = await conn.profilePictureUrl(user1, 'image')
                if (typeof avatar1!== 'string' ||!avatar1.startsWith('http')) avatar1 = defaultImg
            } catch { avatar1 = defaultImg }

            let avatar2
            try {
                avatar2 = await conn.profilePictureUrl(user2, 'image')
                if (typeof avatar2!== 'string' ||!avatar2.startsWith('http')) avatar2 = defaultImg
            } catch { avatar2 = defaultImg }

            let background = 'https://files.evogb.win/7BY3Yv.jpg'
            let url = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(background)}&key=${key}`

            let res = await fetch(url)
            if(!res.ok) throw await res.text()
            let buffer = await res.buffer()

            let porcentaje = Math.floor(Math.random() * 101)
            let explicacion = ''
            if(porcentaje < 20) explicacion = `Hay 0 química. Mejor amigos y ya 😅`
            else if(porcentaje < 40) explicacion = `Poca compatibilidad. Se caen bien pero nada más 💛`
            else if(porcentaje < 60) explicacion = `Hay algo ahí... Tal vez con tiempo funcione ✨`
            else if(porcentaje < 80) explicacion = `Buena conexión. Se ven muy bien juntos ❤️`
            else if(porcentaje < 100) explicacion = `Compatibilidad altísima. Tienen futuro juntos 💖`
            else explicacion = `100% ALMAS GEMELAS. Están destinados 💍`

            let name1, name2
            try { name1 = await conn.getName(user1) } catch { name1 = user1.split('@')[0] }
            try { name2 = await conn.getName(user2) } catch { name2 = user2.split('@')[0] }

            let caption = `💘 *RESULTADO DEL SHIP* 💘\n*@${name1}* + *@${name2}*\n\n*Compatibilidad: ${porcentaje}%*\n${explicacion}`

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
}

handler.help = ['horny @tag', 'ship @tag1 @tag2']
handler.tags = ['fun']
handler.command = ['horny', 'ship']
handler.group = true
export default handler