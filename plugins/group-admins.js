const handler = async (m, { conn, command }) => {
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  if (!m.mentionedJid[0] &&!m.quoted) {
    await react('❌')
    let texto = `𐔌 ꒱ ***ADMINISTRACIÓN*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` —˙𖦹.👑꒷

── *📖 USO* ╏
➛ Menciona a un usuario
➛ Responde al mensaje del usuario

── *💡 EJEMPLOS* ╏
➛ promote @user
➛ demote @user

── *📝 AVISO* ╏
🔒 ➛ Solo admins

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: texto }, { quoted: m })
  }

  let user = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted.sender
  let action = command === 'promote' || command === 'promover' || command === 'daradmin'? 'promote' : 'demote'

  await react(action === 'promote'? '👑' : '📉')

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], action)
  } catch {
    await react('❌')
    let error = `𐔌 ꒱ ***ADMINISTRACIÓN*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ No se pudo completar la acción
🔒 ➛ Verifica permisos del bot

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: error }, { quoted: m })
  }

  let msgAccion = action === 'promote'
? `𐔌 ꒱ ***ADMINISTRACIÓN*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`PROMOVIDO\`\` —˙𖦹.👑꒷

── *📊 INFORMACIÓN* ╏
👑 ➛ Nuevo Admin: @${user.split('@')[0]}
👤 ➛ Por: @${m.sender.split('@')[0]}

━━━━━━━━━━━`
    : `𐔌 ꒱ ***ADMINISTRACIÓN*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`DEGRADADO\`\` —˙𖦹.📉꒷

── *📊 INFORMACIÓN* ╏
📉 ➛ Ya no es Admin: @${user.split('@')[0]}
👤 ➛ Por: @${m.sender.split('@')[0]}

━━━━━━━━━━━`

  await conn.sendMessage(m.chat, { text: msgAccion, mentions: [user, m.sender] }, { quoted: m })
}

handler.help = ['promote @user', 'demote @user']
handler.tags = ['grupos']
handler.command = /^(promote|promover|daradmin|demote|degradar|quitaradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler