let handler = async (m, { conn, command }) => {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    let isClose
    let estado
    let icon
    let reactEmoji

    if (command === 'abrir') {
        isClose = 'not_announcement'
        estado = 'ABIERTO'
        icon = '🔓'
        reactEmoji = '🔓'
    } 
    if (command === 'cerrar') {
        isClose = 'announcement'
        estado = 'CERRADO'
        icon = '🔒'
        reactEmoji = '🔒'
    }

    try {
        await conn.groupSettingUpdate(m.chat, isClose)
        await react(reactEmoji)

        let msg = `𐔌 ꒱ ***ESTADO DEL GRUPO*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZADO\`\` —˙𖦹.${icon}꒷

── *📊 INFORMACIÓN* ╏
${icon} ➛ Estado: *${estado}*
👑 ➛ Por: @${m.sender.split('@')[0]}

── *📝 NOTA* ╏
${command === 'cerrar' 
? '🔒 ➛ Solo admins pueden enviar mensajes' 
: '💬 ➛ Todos pueden enviar mensajes'}

━━━━━━━━━━━`
        await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m })
    } catch (e) {
        await react('❌')
        let error = `𐔌 ꒱ ***ESTADO DEL GRUPO*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ No se pudo cambiar el estado
🔒 ➛ ¿Soy admin del grupo?

━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }
}

handler.help = ['abrir', 'cerrar']
handler.tags = ['grupos']
handler.command = ['abrir', 'cerrar']
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler