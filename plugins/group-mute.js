let mutedUsers = new Set()

let handler = async (m, { conn, command, participants }) => {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    let mentionedJid = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : false
    if (!mentionedJid) {
        await react('❌')
        let error = `𐔌 ꒱ ***SILENCIAR USUARIO*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` —˙𖦹.🔇꒷

── *📖 USO* ╏
➛ Menciona a un usuario
➛ Responde al mensaje del usuario

── *💡 COMANDOS* ╏
➛ mute @user
➛ unmute @user

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    let isUserAdmin = participants.find(p => p.id === mentionedJid)?.admin
    if (isUserAdmin) {
        await react('❌')
        return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***SILENCIAR USUARIO*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ No puedes silenciar a un administrador\n━━━━━━━━━━━` }, { quoted: m })
    }
    if (mentionedJid === conn.user.jid) {
        await react('❌')
        return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***SILENCIAR USUARIO*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ No puedo silenciarme a mí mismo\n━━━━━━━━━━━` }, { quoted: m })
    }

    if (command === "mute") {
        if (mutedUsers.has(mentionedJid)) {
            await react('⚠️')
            return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***SILENCIAR USUARIO*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n⚠️ ➛ Este usuario ya está silenciado\n━━━━━━━━━━━` }, { quoted: m })
        }
        mutedUsers.add(mentionedJid)
        await react('🔇')

        let muteMsg = `𐔌 ꒱ ***SILENCIAR USUARIO*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`SILENCIADO\`\` —˙𖦹.🔇꒷

── *📊 INFORMACIÓN* ╏
🔇 ➛ Usuario: @${mentionedJid.split('@')[0]}
👑 ➛ Por: @${m.sender.split('@')[0]}

── *📝 NOTA* ╏
🗑️ ➛ Sus mensajes serán eliminados automáticamente

━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: muteMsg, mentions: [mentionedJid, m.sender] }, { quoted: m })
    } else if (command === "unmute") {
        if (!mutedUsers.has(mentionedJid)) {
            await react('⚠️')
            return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***SILENCIAR USUARIO*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n⚠️ ➛ Este usuario no está silenciado\n━━━━━━━━━━━` }, { quoted: m })
        }
        mutedUsers.delete(mentionedJid)
        await react('🔊')

        let unmuteMsg = `𐔌 ꒱ ***SILENCIAR USUARIO*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`DESILENCIADO\`\` —˙𖦹.🔊꒷

── *📊 INFORMACIÓN* ╏
🔊 ➛ Usuario: @${mentionedJid.split('@')[0]}
👑 ➛ Por: @${m.sender.split('@')[0]}

── *📝 NOTA* ╏
✅ ➛ Ya puede volver a enviar mensajes

━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: unmuteMsg, mentions: [mentionedJid, m.sender] }, { quoted: m })
    }
}

handler.before = async (m, { conn }) => {
    if (mutedUsers.has(m.sender)) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key })
        } catch (e) {
            console.error(e)
        }
    }
}

handler.help = ['mute @user', 'unmute @user']
handler.tags = ['grupos']
handler.command = /^(mute|unmute)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler