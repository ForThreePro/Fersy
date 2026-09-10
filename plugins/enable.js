let handler = async (m, { conn, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(args[0])
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()

  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  if (!args[0]) {
    await react('❌')
    let error = `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`CONFIGURACIÓN\`\` —˙𖦹.⚙️꒷

── *📝 AVISO* ╏
❌ ➛ Falta activar o desactivar

── *💡 USO* ╏
➛ welcome on / off
➛ antilink on / off
➛ nsfw on / off

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: error }, { quoted: m })
  }

  let fail = false
  switch (type) {
    case 'welcome': case 'bienvenida':
      if (m.isGroup &&!isAdmin) { await react('🔒'); return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🔒\n\n── *📝 AVISO* ╏\n🔒 ➛ Solo admins\n━━━━━━━━━━━` }, { quoted: m }); fail = true; break }
      chat.bienvenida = isEnable
      break
    case 'subbots': case 'serbot':
      if (!isROwner) { await react('🔒'); return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🔒\n\n── *📝 AVISO* ╏\n🔒 ➛ Solo Owner\n━━━━━━━━━━━` }, { quoted: m }); fail = true; break }
      bot.jadibotmd = isEnable
      break
    case 'antispam':
      if (!isOwner) { await react('🔒'); return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🔒\n\n── *📝 AVISO* ╏\n🔒 ➛ Solo Owner\n━━━━━━━━━━━` }, { quoted: m }); fail = true; break }
      bot.antiSpam = isEnable
      break
    case 'antilink':
      if (m.isGroup &&!isAdmin) { await react('🔒'); return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🔒\n\n── *📝 AVISO* ╏\n🔒 ➛ Solo admins\n━━━━━━━━━━━` }, { quoted: m }); fail = true; break }
      chat.antiLink = isEnable
      break
    case 'antibot':
      if (m.isGroup &&!isAdmin) { await react('🔒'); return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🔒\n\n── *📝 AVISO* ╏\n🔒 ➛ Solo admins\n━━━━━━━━━━━` }, { quoted: m }); fail = true; break }
      chat.antiBot = isEnable
      break
    case 'modoadmin':
      if (m.isGroup &&!isAdmin) { await react('🔒'); return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🔒\n\n── *📝 AVISO* ╏\n🔒 ➛ Solo admins\n━━━━━━━━━━━` }, { quoted: m }); fail = true; break }
      chat.modoadmin = isEnable
      break
    case 'nsfw': case 'antinopor':
      if (m.isGroup &&!isAdmin) { await react('🔒'); return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🔒\n\n── *📝 AVISO* ╏\n🔒 ➛ Solo admins\n━━━━━━━━━━━` }, { quoted: m }); fail = true; break }
      chat.nsfw = isEnable
      break
    case 'audios':
      chat.audios = isEnable
      break
    case 'autoread': case 'autoleer':
      if (!isROwner) { await react('🔒'); return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🔒\n\n── *📝 AVISO* ╏\n🔒 ➛ Solo Owner\n━━━━━━━━━━━` }, { quoted: m }); fail = true; break }
      global.opts['autoread'] = isEnable
      break
    case 'antiprivado':
      if (!isOwner) { await react('🔒'); return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🔒\n\n── *📝 AVISO* ╏\n🔒 ➛ Solo Owner\n━━━━━━━━━━━` }, { quoted: m }); fail = true; break }
      bot.antiPrivate = isEnable
      break
    default:
      return
  }

  if (fail) return
  await react(isEnable? '🟢' : '🔴')

  // IMAGEN FIJA QUE ME DISTE
  let catalogoImg = { url: 'https://files.evogb.win/QFXQtu.jpg' }

  let estadoTexto = isEnable? 'Activado' : 'Desactivado'
  let estadoEmoji = isEnable? '🟢' : '🔴'

  let statusTxt = `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`CONFIGURACIÓN\`\` —˙𖦹.⚙️꒷

── *📊 ESTADO* ╏
⚙️ ➛ Función: *${type}*
${estadoEmoji} ➛ Estado: *${estadoTexto}*
👑 ➛ Por: @${m.sender.split('@')[0]}

━━━━━━━━━━━`

  await conn.sendMessage(m.chat, {
    image: catalogoImg,
    caption: statusTxt,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['welcome','antilink', 'antibot', 'modoadmin', 'subbots', 'nsfw', 'audios', 'antiprivado', 'antispam', 'autoread'].map(v => v + ' on/off')
handler.tags = ['configuración']
handler.command = ['welcome', 'bienvenida', 'subbots', 'serbot', 'antispam', 'antilink', 'antibot', 'modoadmin', 'nsfw', 'antinopor', 'audios', 'autoleer', 'autoread', 'antiprivado']

export default handler