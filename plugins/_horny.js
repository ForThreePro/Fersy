import fetch from 'node-fetch'

let handler = async (m, { conn, participants, command }) => {
    let defaultImg = 'https://files.evogb.win/E2yVdA.jpg'
    let defaultBg = 'https://files.evogb.win/7BY3Yv.jpg'
    let key = 'proyectsV2'

    const getAvatar = async (jid) => {
        try {
            let url = await conn.profilePictureUrl(jid, 'image')
            if(url && url.startsWith('https')) return url
        } catch {}
        return defaultImg
    }

    const getName = async (jid) => {
        let name = jid.split('@')[0]
        try {
            let n = await conn.getName(jid)
            if(n && n!== 'undefined') name = n
        } catch {}
        return name
    }

    // ===== HORNY =====
    if (command === 'horny') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let pp = await getAvatar(who)
        let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}`
        try {
            await m.reply(`😏 Generando...`)
            let res = await fetch(apiUrl, { timeout: 20000 })
            let buffer = await res.buffer()
            await conn.sendMessage(m.chat, { image: buffer, caption: `@${who.split('@')[0]} está así ahora mismo 😏🔥`, mentions: [who] })
        } catch (e) { m.reply(`⚠️ Error al generar la imagen`) }
    }

    // ===== SHIP =====
    if (command === 'ship') {
        if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos')
        let members = participants.map(u => u.id)
        if (members.length < 2) return m.reply('⚠️ Necesitan mínimo 2 personas')
        let user1, user2
        if (m.mentionedJid.length >= 2) { user1 = m.mentionedJid[0]; user2 = m.mentionedJid[1] }
        else { user1 = members[Math.floor(Math.random() * members.length)]; user2 = members[Math.floor(Math.random() * members.length)]; while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)] }
        await conn.sendMessage(m.chat, { text: `💘 Calculando...\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}`, mentions: [user1, user2] })
        try {
            let avatar1 = await getAvatar(user1); let avatar2 = await getAvatar(user2)
            let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(defaultBg)}&key=${key}`
            let res = await fetch(apiUrl, { timeout: 20000 }); let buffer = await res.buffer()
            let porcentaje = Math.floor(Math.random() * 101)
            let explicacion = porcentaje < 20? `Hay 0 química 😅` : porcentaje < 40? `Poca compatibilidad 💛` : porcentaje < 60? `Hay algo ahí ✨` : porcentaje < 80? `Buena conexión ❤️` : porcentaje < 100? `Compatibilidad altísima 💖` : `100% ALMAS GEMELAS 💍`
            await conn.sendMessage(m.chat, { image: buffer, caption: `💘 *RESULTADO DEL SHIP* 💘\n*@${user1.split('@')[0]}* + *@${user2.split('@')[0]}*\n\n*Compatibilidad: ${porcentaje}%*\n${explicacion}`, mentions: [user1, user2] })
        } catch (e) { m.reply(`⚠️ Error al generar la imagen`) }
    }

    // ===== SECURITY =====
    if (command === 'security') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let pp = await getAvatar(who)
        let createdTimestamp = Date.now()
        let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&createdTimestamp=${createdTimestamp}&key=${key}`
        await m.reply(`🔍 Generando cartel de SE BUSCA para @${who.split('@')[0]}...`, null, { mentions: [who] })
        try {
            let res = await fetch(apiUrl, { timeout: 30000 }); let buffer = await res.buffer()
            await conn.sendMessage(m.chat, { image: buffer, caption: `🚨 *SE BUSCA* 🚨\n@${who.split('@')[0]}\n\n*Recompensa: 1,000,000$*`, mentions: [who] })
        } catch (e) { m.reply(`⚠️ Error al generar la imagen`) }
    }

    // ===== RANK2 =====
    if (command === 'rank') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let name = await getName(who)
        let pp = await getAvatar(who)
        let level = Math.floor(Math.random() * 100) + 1
        let rank = Math.floor(Math.random() * 500) + 1
        let currxp = Math.floor(Math.random() * 5000)
        let needxp = currxp + Math.floor(Math.random() * 2000) + 1000
        let apiUrl = `https://api.stellarwa.xyz/generate/rank2?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&level=${level}&rank=${rank}&currxp=${currxp}&needxp=${needxp}&key=${key}`
        await m.reply(`📊 Generando tarjeta de nivel para @${who.split('@')[0]}...`, null, { mentions: [who] })
        try {
            let res = await fetch(apiUrl, { timeout: 30000 }); let buffer = await res.buffer()
            await conn.sendMessage(m.chat, { image: buffer, caption: `📊 *TARJETA DE NIVEL*\n@${who.split('@')[0]}\n\n*Nivel:* ${level}\n*Rank:* #${rank}\n*XP:* ${currxp}/${needxp}`, mentions: [who] })
        } catch (e) { m.reply(`⚠️ Error al generar la imagen`) }
    }

    // ===== INSTAGRAM =====
    if (command === 'instagram' || command === 'ig') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let name = await getName(who)
        let pp = await getAvatar(who)
        let postImage = 'https://files.evogb.win/8kP2Lm.jpg'
        let likeCount = Math.floor(Math.random() * 100000) + 1000
        let likeText = `${name} y ${Math.floor(Math.random() * 5000)} personas más`
        let apiUrl = `https://api.stellarwa.xyz/generate/instagram?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&postImage=${encodeURIComponent(postImage)}&likeCount=${likeCount}&likeText=${encodeURIComponent(likeText)}&key=${key}`
        await m.reply(`📸 Generando post de Instagram para @${who.split('@')[0]}...`, null, { mentions: [who] })
        try {
            let res = await fetch(apiUrl, { timeout: 30000 }); let buffer = await res.buffer()
            await conn.sendMessage(m.chat, { image: buffer, caption: `📸 *POST DE INSTAGRAM FALSO*\n@${who.split('@')[0]}\n\n*Likes:* ${likeCount.toLocaleString()}`, mentions: [who] })
        } catch (e) { m.reply(`⚠️ Error al generar la imagen`) }
    }

    // ===== WELCOME2 NUEVO =====
    if (command === 'welcome2') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let name = await getName(who)
        let pp = await getAvatar(who)
        let groupName = await conn.getName(m.chat)
        let memberCount = participants.length
        let apiUrl = `https://api.stellarwa.xyz/generate/welcome2?username=${encodeURIComponent(name)}&guildName=${encodeURIComponent(groupName)}&memberCount=${memberCount}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&key=${key}`

        try {
            let res = await fetch(apiUrl, { timeout: 30000 })
            let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `👋 *BIENVENIDO/A*\n@${who.split('@')[0]}\n\n*Al grupo:* ${groupName}\n*Miembro N°:* ${memberCount}`,
                mentions: [who]
            })
        } catch (e) { m.reply(`⚠️ Error al generar bienvenida`) }
    }
}

handler.help = ['horny @tag', 'ship @tag1 @tag2', 'security @tag', 'rank @tag', 'instagram @tag', 'welcome2 @tag']
handler.tags = ['fun']
handler.command = ['horny', 'ship', 'security', 'rank', 'instagram', 'ig', 'welcome2']
export default handler