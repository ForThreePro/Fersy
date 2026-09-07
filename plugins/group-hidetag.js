let handler = async (m, { conn, text, participants }) => {
  const users = participants.map(u => conn.decodeJid(u.id))
  const group = await conn.groupMetadata(m.chat).catch(() => ({}))
  const groupName = group.subject || 'Grupo'
  
  // FECHA: lunes, 7 de septiembre
  const fecha = new Date().toLocaleDateString('es-PE', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  })
  
  const footer = `\n\n> *${groupName}* • ${fecha}`
  
  const mime = m.mtype
  const type = /imageMessage|videoMessage|conversation|extendedTextMessage/.test(mime)
  
  if (!m.quoted && type) {
    if ((mime === 'imageMessage')) {
      conn.sendMessage(m.chat, { 
        image: await m.download?.(), 
        mentions: users, 
        caption: (text ? text : "") + footer
      }, { quoted: m });
    } else if ((mime === 'videoMessage')) {
      conn.sendMessage(m.chat, { 
        video: await m.download?.(), 
        mentions: users, 
        mimetype: 'video/mp4', 
        caption: (text ? text : "") + footer
      }, { quoted: m })
    } else if ((mime === ("conversation") || ("extendedTextMessage"))) {
      conn.sendMessage(m.chat, { 
        text: (text ? text : "Zurdo’s Bot") + footer, 
        mentions: users 
      }, { quoted: m })
    }
  } else if (m.quoted) {
    const quotedText = m.quoted.text || m.quoted.caption || "Mensaje reenviado"
    await conn.sendMessage(m.chat, { 
      text: quotedText + footer, 
      mentions: users 
    }, { quoted: m })
  }
}
handler.help = ['notify', 'hidetag']
handler.tags = ['adm']
handler.command = ['hidetag', 'notify', 'n', 'noti', 'notificar', 'notif', 'aviso', 'avisar',]
handler.group = true
handler.admin = true

export default handler