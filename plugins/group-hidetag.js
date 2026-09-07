let handler = async (m, { conn, text, participants }) => {
  const mime = m.mtype
  const type = /imageMessage|videoMessage|conversation|extendedTextMessage/.test(mime)
  if (!m.quoted && type) {
    if ((mime === 'imageMessage')) {
      conn.sendMessage(m.chat, { image: await m.download?.(), mentions: participants.map(u => conn.decodeJid(u.id)), caption: text ? text : "", mentions: participants.map(u => conn.decodeJid(u.id)) }, { quoted: m });
    } else if ((mime === 'videoMessage')) {
      conn.sendMessage(m.chat, { video: await m.download?.(), mentions: participants.map(u => conn.decodeJid(u.id)), mimetype: 'video/mp4', caption: text ? text : "" }, { quoted: m })
    } else if ((mime === ("conversation") || ("extendedTextMessage"))) {
      conn.sendMessage(m.chat, { text: text ? text : "Zurdo’s Bot", mentions: participants.map(u => conn.decodeJid(u.id)) }, { quoted: m })
    }
  } else if (m.quoted) {
    await conn.sendMessage(m.chat, { forward: m.quoted.fakeObj, mentions: participants.map(u => conn.decodeJid(u.id)) }, { quoted: m })
  }
}
handler.help = ['notify', 'hidetag']
handler.tags = ['adm']
handler.command = ['hidetag', 'notify', 'n', 'noti', 'notificar', 'notif', 'aviso', 'avisar',]
handler.group = true
handler.admin = true

export default handler