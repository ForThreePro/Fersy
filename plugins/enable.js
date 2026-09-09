let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(args[0])
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()

  if (!args[0]) return m.reply(`𓆩 𝗕𝗢𝗧 𝗣𝗥𝗘𝗠 𓆪 

⚙️ *Configuración incorrecta*
📌 *Uso:* ${usedPrefix + command} on
📌 *Uso:* ${usedPrefix + command} off

*Ejemplo:* ${usedPrefix + command} on`)

  let fail = false
  switch (type) {
    case 'welcome': case 'bienvenida':
      if (m.isGroup &&!isAdmin) { return conn.reply(m.chat, `🌿 *Solo admins*`, m); fail = true; break }
      chat.bienvenida = isEnable
      break
    case 'subbots': case 'serbot':
      if (!isROwner) { return conn.reply(m.chat, `💚 *Solo Owner*`, m); fail = true; break }
      bot.jadibotmd = isEnable
      break
    case 'antispam':
      if (!isOwner) { return conn.reply(m.chat, `💚 *Solo Owner*`, m); fail = true; break }
      bot.antiSpam = isEnable
      break
    case 'antilink':
      if (m.isGroup &&!isAdmin) { return conn.reply(m.chat, `🌿 *Solo admins*`, m); fail = true; break }
      chat.antiLink = isEnable
      break
    case 'antibot':
      if (m.isGroup &&!isAdmin) { return conn.reply(m.chat, `🌿 *Solo admins*`, m); fail = true; break }
      chat.antiBot = isEnable
      break
    case 'modoadmin':
      if (m.isGroup &&!isAdmin) { return conn.reply(m.chat, `🌿 *Solo admins*`, m); fail = true; break }
      chat.modoadmin = isEnable
      break
    case 'nsfw': case 'antinopor':
      if (m.isGroup &&!isAdmin) { return conn.reply(m.chat, `🌿 *Solo admins*`, m); fail = true; break }
      chat.nsfw = isEnable
      break
    case 'audios':
      chat.audios = isEnable
      break
    case 'autoread': case 'autoleer':
      if (!isROwner) { return conn.reply(m.chat, `💚 *Solo Owner*`, m); fail = true; break }
      global.opts['autoread'] = isEnable
      break
    case 'antiprivado':
      if (!isOwner) { return conn.reply(m.chat, `💚 *Solo Owner*`, m); fail = true; break }
      bot.antiPrivate = isEnable
      break
    default:
      return
  }

  if (fail) return

  // IMAGEN SAPITO
  let catalogoImg = { url: global.botimg }

  let estadoTexto = isEnable? 'Activado 🌀' : 'Desactivado ✖️'
  let estadoEmoji = isEnable? '🟢' : '🔴'

  let statusTxt = ` 𓆩 𝗖𝗢𝗡𝗙𝗜𝗚𝗨𝗥𝗔𝗖𝗜𝗢𝗡 𓆪 

.⃟𖥔 ݁. 𖦹˙— \`\`ON/OFF\`\` —˙𖦹.🍃꒷

⚙️ *Función:* ${type}
📊 *Estado:* ${estadoTexto} ${estadoEmoji}
👑 *Por:* @${m.sender.split('@')[0]}

━━━━━━━━━━━
*Powered by*: GARFIELD BOT PREM 🍃`

  await conn.sendMessage(m.chat, {
    image: catalogoImg,
    caption: statusTxt,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['welcome','antilink', 'antibot', 'modoadmin', 'subbots', 'nsfw', 'audios', 'antiprivado', 'antispam', 'autoread'].map(v => v + ' on/off')
handler.tags = ['config']
handler.command = ['welcome', 'bienvenida', 'subbots', 'serbot', 'antispam', 'antilink', 'antibot', 'modoadmin', 'nsfw', 'antinopor', 'audios', 'autoleer', 'autoread', 'antiprivado']

export default handler