let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'));

let handler = async (m, { conn }) => {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (!m.quoted) {
        await react('❌')
        let error = `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Responde a una imagen o video ViewOnce

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    if (!m?.quoted || !m?.quoted?.viewOnce) {
        await react('❌')
        let error = `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ El mensaje no es ViewOnce
❌ ➛ Responde a una foto/video que se ve 1 vez

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    await react('⏳')
    await m.reply(`𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⏳

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESANDO\`\` —˙𖦹.⚙️꒷

── *📊 ESTADO* ╏
📥 ➛ Descargando archivo...
🔓 ➛ Quitando ViewOnce...

━━━━━━━━━━━`)

    let buffer = await m.quoted.download(false)
    let caption = m.quoted.caption || 'Sin descripción'

    if (/videoMessage/.test(m.quoted.mtype)) {
        await react('🎥')
        await conn.sendFile(m.chat, buffer, 'media.mp4', `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`COMPLETADO\`\` —˙𖦹.🎥꒷

── *📊 INFORMACIÓN* ╏
🎥 ➛ Tipo: *Video ViewOnce*
📝 ➛ ${caption}

━━━━━━━━━━━`, m)
    } else if (/imageMessage/.test(m.quoted.mtype)) {
        await react('🖼️')
        await conn.sendFile(m.chat, buffer, 'media.jpg', `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`COMPLETADO\`\` —˙𖦹.🖼️꒷

── *📊 INFORMACIÓN* ╏
🖼️ ➛ Tipo: *Imagen ViewOnce*
📝 ➛ ${caption}

━━━━━━━━━━━`, m)
    } else {
        await react('❌')
        let error = `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Solo soporta imagen y video ViewOnce

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }
}

handler.help = ['ver']
handler.tags = ['herramientas']
handler.command = ['readviewonce', 'read', 'ver'] 
export default handler