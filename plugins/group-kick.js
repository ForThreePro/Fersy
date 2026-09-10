let handler = async (m, { conn, participants }) => {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    let mentionedJid = m.mentionedJid && m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : null

    if (!mentionedJid) {
        await react('❌')
        let error = `𐔌 ꒱ ***EXPULSAR USUARIO*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` —˙𖦹.👢꒷

── *📖 USO* ╏
➛ Menciona a un usuario
➛ Responde al mensaje del usuario

── *📝 AVISO* ╏
🔒 ➛ Solo admins

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    try {
        let groupMetadata = await conn.groupMetadata(m.chat)
        let ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        let ownerBot = global.owner[0][0] + '@s.whatsapp.net'

        let user = participants.find(p => p.id === mentionedJid)
        let isAdmin = user?.admin

        if (mentionedJid === conn.user.jid) {
            await react('❌')
            return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***EXPULSAR USUARIO*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ No puedo eliminarme a mí mismo\n━━━━━━━━━━━` }, { quoted: m })
        }
        if (mentionedJid === ownerGroup) {
            await react('❌')
            return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***EXPULSAR USUARIO*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ No puedo expulsar al propietario del grupo\n━━━━━━━━━━━` }, { quoted: m })
        }
        if (mentionedJid === ownerBot) {
            await react('❌')
            return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***EXPULSAR USUARIO*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ No puedo expulsar al dueño del bot\n━━━━━━━━━━━` }, { quoted: m })
        }
        if (isAdmin) {
            await react('❌')
            return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***EXPULSAR USUARIO*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ No puedo expulsar a un administrador\n━━━━━━━━━━━` }, { quoted: m })
        }

        await react('👢')
        await conn.groupParticipantsUpdate(m.chat, [mentionedJid], 'remove')

        let kickMsg = `𐔌 ꒱ ***EXPULSAR USUARIO*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`EXPULSADO\`\` —˙𖦹.👢꒷

── *📊 INFORMACIÓN* ╏
👢 ➛ Usuario: @${mentionedJid.split('@')[0]}
👑 ➛ Por: @${m.sender.split('@')[0]}

━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: kickMsg, mentions: [mentionedJid, m.sender] }, { quoted: m })
    } catch (e) {
        await react('❌')
        let error = `𐔌 ꒱ ***EXPULSAR USUARIO*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Se ha producido un problema
🔧 ➛ ${e.message}

━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }
}

handler.help = ['kick @user']
handler.tags = ['grupos']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler