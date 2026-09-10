let handler = async (m, { conn, args }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  // Detectar tipo: welcome / bye / kick
  let textoCmd = m.text.toLowerCase()
  let type = ''
  if (textoCmd.includes('welcome')) type = 'welcome'
  if (textoCmd.includes('bye')) type = 'bye'
  if (textoCmd.includes('kick')) type = 'kick'

  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  // SET AUDIO
  if (textoCmd.includes('audio') &&!textoCmd.includes('del')) {
    await react('🎵')

    // Si responde a un audio o manda audio
    if (mime && /audio/.test(mime)) {
      let buffer = await q.download()
      chat[`audio${type}`] = buffer
      let ok = `𐔌 ꒱ ***AUDIO ${type.toUpperCase()}*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`GUARDADO\`\` —˙𖦹.🎵꒷

── *📊 INFORMACIÓN* ╏
✅ ➛ Audio de *${type}* guardado
🔊 ➛ Se reproducirá cuando pase el evento

━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
    }

    // Si manda un link
    if (args[0] && args[0].startsWith('http')) {
      chat[`audio${type}`] = args[0]
      let ok = `𐔌 ꒱ ***AUDIO ${type.toUpperCase()}*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`GUARDADO\`\` —˙𖦹.🔗꒷

── *📊 INFORMACIÓN* ╏
✅ ➛ Link de audio *${type}* guardado
🔗 ➛ ${args[0]}

━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
    }

    await react('❌')
    let uso = `𐔌 ꒱ ***AUDIO ${type.toUpperCase()}*** 𐔌 ꒱ 📝

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` —˙𖦹.🎵꒷

── *📖 USO* ╏
➛ Responde a un audio
➛ Envía: <link del audio>

── *💡 EJEMPLOS* ╏
➛ Responde a un audio + comando
➛ link.mp3

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: uso }, { quoted: m })
  }

  // DEL AUDIO
  if (textoCmd.includes('delaudio')) {
    if (!chat[`audio${type}`]) {
      await react('📭')
      let vacio = `𐔌 ꒱ ***AUDIO ${type.toUpperCase()}*** 𐔌 ꒱ 📭

.⃟𖥔 ݁. 𖦹˙— \`\`NO CONFIGURADO\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
📭 ➛ No hay un audio de *${type}* configurado

━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: vacio }, { quoted: m })
    }

    delete chat[`audio${type}`]
    await react('🗑️')
    let del = `𐔌 ꒱ ***AUDIO ${type.toUpperCase()}*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`ELIMINADO\`\` —˙𖦹.🗑️꒷

── *📊 INFORMACIÓN* ╏
🗑️ ➛ Audio de *${type}* eliminado
✅ ➛ Ya no se reproducirá

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: del }, { quoted: m })
  }
}

handler.help = ['audiowelcome', 'audiobye', 'audiokick', 'delaudiowelcome', 'delaudiobye', 'delaudiokick']
handler.tags = ['configuración']
handler.command = /^(audio(welcome|bye|kick)|delaudio(welcome|bye|kick))$/i
handler.group = true
handler.admin = true
export default handler