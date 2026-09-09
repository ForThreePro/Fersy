import fetch from 'node-fetch'

let handler = async (m, { conn, participants, command }) => {
    let defaultImg = 'https://files.evogb.win/E2yVdA.jpg'
    let key = 'proyectsV2'

    const getAvatar = async (jid) => {
        try {
            let url = await conn.profilePictureUrl(jid, 'image')
            if(url && url.startsWith('https')) return url
        } catch {}
        return defaultImg
    }

    const getName = async (jid) => {
        try {
            let name = await conn.getName(jid)
            return name || jid.split('@')[0]
        } catch {
            return jid.split('@')[0]
        }
    }

    // ===== HORNY =====
    if (command === 'horny') {
        let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender
        let name = await getName(who)
        let pp = await getAvatar(who)
        let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}`

        try {
            let res = await fetch(apiUrl, { timeout: 20000 })
            if(!res.ok) throw new Error('API ' + res.status)
            let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `@${name} está así ahora mismo 😏🔥`,
                mentions: [who]
            })
        } catch (e) {
            console.log(e)
            m.reply(`⚠️ Error al generar la imagen`)
        }
    }

    // ===== SHIP =====
    if (command === 'ship') {
        if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos')
        let members = participants.map(u => u.id)
        if (members.length < 2) return m.reply('⚠️ Necesitan mínimo 2 personas')

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
            m.reply(`⚠️ Error al generar la imagen`)
        }
    }

    // ===== SECURITY / WANTED =====
    if (command === 'security') {
        let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender
        let name = await getName(who)
        let pp = await getAvatar(who)

        // Stellarwa security usa background obligatorio
        let background = 'https://files.evogb.win/7BY3Yv.jpg'
        let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(background)}&key=${key}`

        try {
            m.reply(`🔍 Generando cartel...`)
            let res = await fetch(apiUrl, { timeout: 25000 })

            if(!res.ok) {
                let errorText = await res.text()
                throw new Error(`API ${res.status}: ${errorText}`)
            }

            let buffer = await res.buffer()
            if(buffer.length < 5000) throw new Error('La API devolvió imagen vacía')

            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `🚨 *SE BUSCA* 🚨\n@${name}\n\n*Recompensa: 1,000,000$*\n*Delito: Ser muy guapo*`,
                mentions: [who]
            })
        } catch (e) {
            console.log('SECURITY ERROR:', e)
            m.reply(`⚠️ Error al generar la imagen\n*Posibles causas:*\n1. La API está saturada\n2. El avatar no carga\nIntenta en 10s`)
        }
    }

handler.help = ['horny @tag', 'ship @tag1 @tag2', 'security @tag']
handler.tags = ['fun']
handler.command = ['horny', 'ship', 'security']
export default handler