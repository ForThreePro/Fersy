let handler = async (m, { conn }) => {
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  if (!m.quoted) {
    await react('❌')
    let error = `𐔌 ꒱ ***ELIMINAR MENSAJE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Responde al mensaje que deseas eliminar

── *💡 EJEMPLO* ╏
➛ Responde a un mensaje + comando

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: error }, { quoted: m })
  }

  await react('🗑️')
  
  try {
    let delet = m.message.extendedTextMessage.contextInfo.participant
    let bang = m.message.extendedTextMessage.contextInfo.stanzaId
    return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
  } catch {
    await conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
  }

  let ok = `𐔌 ꒱ ***ELIMINAR MENSAJE*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`ELIMINADO\`\` —˙𖦹.🗑️꒷

── *📊 INFORMACIÓN* ╏
🗑️ ➛ Mensaje eliminado
👤 ➛ Por: @${m.sender.split('@')[0]}

━━━━━━━━━━━`
  conn.sendMessage(m.chat, { text: ok, mentions: [m.sender] }, { quoted: m })
}

handler.help = ['del']
handler.tags = ['grupos']
handler.command = /^del(ete)?$/i
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler