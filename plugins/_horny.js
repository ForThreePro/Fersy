import fetch from 'node-fetch'

let handler = async (m, { conn, participants }) => {
    let defaultImg = 'https://files.evogb.win/GEkGfz.jpg'
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

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    // ===== HORNY =====
    if (m.message?.extendedTextMessage?.text?.includes('horny') || m.text?.includes('horny')) {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let pp = await getAvatar(who)
        let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}`
        try {
            await react('😏')
            await m.reply(`𐔌 ꒱ ***HORNY*** 𐔌 ꒱ 😏

.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` —˙𖦹.🔥꒷

── *📊 ESTADO* ╏
🖼️ ➛ Creando imagen...

━━━━━━━━━━━`)
            let res = await fetch(apiUrl, { timeout: 20000 })
            let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `𐔌 ꒱ ***HORNY*** 𐔌 ꒱ 🔥

.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` —˙𖦹.😏꒷

── *📊 RESULTADO* ╏
@${who.split('@')[0]} está así ahora mismo 😏🔥

━━━━━━━━━━━`,
                mentions: [who]
            })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***HORNY*** 𐔌 ꒱ ⚠️\n\n❌ Error al generar la imagen`)
        }
    }

    // ===== SHIP =====
    if (m.message?.extendedTextMessage?.text?.includes('ship') || m.text?.includes('ship')) {
        if (!m.isGroup) return m.reply(`𐔌 ꒱ ***SHIP*** 𐔌 ꒱ ⚠️\n\n❌ Solo funciona en grupos`)
        let members = participants.map(u => u.id)
        if (members.length < 2) return m.reply(`𐔌 ꒱ ***SHIP*** 𐔌 ꒱ ⚠️\n\n❌ Necesitan mínimo 2 personas`)
        let user1, user2
        if (m.mentionedJid.length >= 2) { user1 = m.mentionedJid[0]; user2 = m.mentionedJid[1] }
        else { user1 = members[Math.floor(Math.random() * members.length)]; user2 = members[Math.floor(Math.random() * members.length)]; while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)] }

        await react('💘')
        await conn.sendMessage(m.chat, {
            text: `𐔌 ꒱ ***SHIP*** 𐔌 ꒱ 💘

.⃟𖥔 ݁. 𖦹˙— \`\`CALCULANDO\`\` —˙𖦹.💖꒷

── *📊 PAREJA* ╏
@${user1.split('@')[0]} + @${user2.split('@')[0]}

━━━━━━━━━━━`,
            mentions: [user1, user2]
        })
        try {
            let avatar1 = await getAvatar(user1); let avatar2 = await getAvatar(user2)
            let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(defaultBg)}&key=${key}`
            let res = await fetch(apiUrl, { timeout: 20000 }); let buffer = await res.buffer()
            let porcentaje = Math.floor(Math.random() * 101)
            let explicacion = porcentaje < 20? `Hay 0 química 😅` : porcentaje < 40? `Poca compatibilidad 💛` : porcentaje < 60? `Hay algo ahí ✨` : porcentaje < 80? `Buena conexión ❤️` : porcentaje < 100? `Compatibilidad altísima 💖` : `100% ALMAS GEMELAS 💍`
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `𐔌 ꒱ ***SHIP*** 𐔌 ꒱ 💘

.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` —˙𖦹.💖꒷

── *📊 COMPATIBILIDAD* ╏
@${user1.split('@')[0]} + @${user2.split('@')[0]}

💘 ➛ *${porcentaje}%*
💌 ➛ ${explicacion}

━━━━━━━━━━━`,
                mentions: [user1, user2]
            })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***SHIP*** 𐔌 ꒱ ⚠️\n\n❌ Error al generar la imagen`)
        }
    }

    // ===== SECURITY =====
    if (m.message?.extendedTextMessage?.text?.includes('security') || m.text?.includes('security')) {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let pp = await getAvatar(who)
        let createdTimestamp = Date.now()
        let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&createdTimestamp=${createdTimestamp}&key=${key}`
        await react('🔍')
        await m.reply(`𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ 🚨

.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` —˙𖦹.📢꒷

── *📊 ESTADO* ╏
🖼️ ➛ Creando cartel para @${who.split('@')[0]}...

━━━━━━━━━━━`, { mentions: [who] })
        try {
            let res = await fetch(apiUrl, { timeout: 30000 }); let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ 🚨

.⃟𖥔 ݁. 𖦹˙— \`\`CARTEL\`\` —˙𖦹.💰꒷

── *📊 INFORMACIÓN* ╏
🚨 ➛ @${who.split('@')[0]}
💰 ➛ *Recompensa: 1,000,000$*

━━━━━━━━━━━`,
                mentions: [who]
            })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ ⚠️\n\n❌ Error al generar la imagen`)
        }
    }

    // ===== RANK2 =====
    if (m.message?.extendedTextMessage?.text?.includes('rank') || m.text?.includes('rank')) {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let name = await getName(who)
        let pp = await getAvatar(who)
        let level = Math.floor(Math.random() * 100) + 1
        let rank = Math.floor(Math.random() * 500) + 1
        let currxp = Math.floor(Math.random() * 5000)
        let needxp = currxp + Math.floor(Math.random() * 2000) + 1000
        let apiUrl = `https://api.stellarwa.xyz/generate/rank2?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&level=${level}&rank=${rank}&currxp=${currxp}&needxp=${needxp}&key=${key}`
        await react('📊')
        await m.reply(`𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ 📊

.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` —˙𖦹.🎮꒷

── *📊 ESTADO* ╏
🖼️ ➛ Creando tarjeta para @${who.split('@')[0]}...

━━━━━━━━━━━`, { mentions: [who] })
        try {
            let res = await fetch(apiUrl, { timeout: 30000 }); let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ 📊

.⃟𖥔 ݁. 𖦹˙— \`\`ESTADÍSTICAS\`\` —˙𖦹.🎮꒷

── *📊 DATOS* ╏
👤 ➛ @${who.split('@')[0]}
📈 ➛ Nivel: *${level}*
🏆 ➛ Rank: *#${rank}*
✨ ➛ XP: *${currxp}/${needxp}*

━━━━━━━━━━━`,
                mentions: [who]
            })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ ⚠️\n\n❌ Error al generar la imagen`)
        }
    }
}

handler.help = ['horny @tag', 'ship @tag1 @tag2', 'security @tag', 'rank @tag']
handler.tags = ['diversión']
handler.command = ['horny', 'ship', 'security', 'rank']
export default handler