let handler = async (m, { conn }) => {
    let user = m.sender
    let nombre = conn.getName(user)
    let groupName = await conn.getName(m.chat)

    if (!m.isGroup) {
        let error = `𐔌 ꒱ ***SALIDA*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Este comando solo funciona en grupos

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    // SOLO TU NUMERO: +51 927 174 369
    let miNumero = '51960231506@s.whatsapp.net'
    if (user!== miNumero) {
        let error = `𐔌 ꒱ ***SALIDA*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ACCESO DENEGADO\`\` —˙𖦹.🔒꒷

── *📝 AVISO* ╏
🔒 ➛ Este comando es exclusivo del dueño

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    // AGARRA TU FOTO DE PERFIL
    let pp
    try {
        pp = await conn.profilePictureUrl(user, 'image')
    } catch {
        pp = 'https://telegra.ph/file/24fa902ead26340eff1d2.jpg'
    }

    let texto = `𐔌 ꒱ ***SALIDA*** 𐔌 ꒱ 👋

.⃟𖥔 ݁. 𖦹˙— \`\`DESPEDIDA\`\` —˙𖦹.✨꒷

── *📊 INFORMACIÓN* ╏
👋 ➛ *${nombre}* se despide de: *${groupName}*

── *📝 MENSAJE* ╏
✨ ➛ Gracias por la confianza depositada
✨ ➛ Cada momento compartido en este grupo
✨ ➛ Por elegirnos como su Bot #1 de WhatsApp 2026
🍕 ➛ Me llevo los mejores recuerdos
💌 ➛ Si necesitan volver a contar conmigo, aquí estaré

── *📞 SOPORTE* ╏
📱 ➛ Soporte 24/7: *+51 927 174 369*

━━━━━━━━━━━`

    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: texto,
        mentions: [user]
    })

    setTimeout(async () => {
        await conn.groupParticipantsUpdate(m.chat, [user], "remove")
    }, 3000)
}

handler.help = ['salir']
handler.tags = ['ventas']
handler.command = /^salir$/i
handler.group = true
handler.botAdmin = true
export default handler