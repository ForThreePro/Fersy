let handler = async (m, { conn, text, participants, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('《✤》 Solo en grupos')
  if (!isAdmin) return m.reply('《✤》 Solo admins')
  if (!isBotAdmin) return m.reply('《✤》 Bot necesita ser admin')

  const users = participants.map(u => u.id)
  const group = await conn.groupMetadata(m.chat).catch(() => ({}))
  const groupName = group.subject || 'Grupo'
  
  const mime = m.mtype
  const q = m.quoted || m
  const qMime = q.mtype
  
  // FECHA COMO EN LA FOTO
  const fecha = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) + ' 🌙'
  
  // LOGO PARA EL RECUADRO
  const thumb = await (await fetch('https://files.evogb.win/fw2NBP.jpg')).buffer().catch(() => Buffer.alloc(0))

  const contextInfo = {
    mentionedJid: users,
    forwardingScore: 999,
    isForwarded: true,
    externalAdReply: {
      title: groupName,
      body: `${groupName} 💗☁️ | ${fecha}`,
      thumbnail: thumb,
      sourceUrl: `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat).catch(() => '')}`,
      mediaType: 1,
      renderLargerThumbnail: true
    }
  }

  try {
    // SI RESPONDES A ALGO
    if (m.quoted) {
      const media = await q.download()
      
      if (/imageMessage/.test(qMime)) {
        return conn.sendMessage(m.chat, { 
          image: media, 
          caption: text || q.text || q.caption || '', 
          mentions: users,
          contextInfo 
        })
      } 
      if (/videoMessage/.test(qMime)) {
        return conn.sendMessage(m.chat, { 
          video: media, 
          mimetype: 'video/mp4',
          caption: text || q.text || q.caption || '', 
          mentions: users,
          contextInfo 
        })
      }
      if (/audioMessage/.test(qMime)) {
        return conn.sendMessage(m.chat, { 
          audio: media, 
          mimetype: 'audio/mpeg',
          fileName: 'hidetag.mp3',
          mentions: users,
          contextInfo 
        })
      }
      if (/stickerMessage/.test(qMime)) {
        return conn.sendMessage(m.chat, { 
          sticker: media, 
          mentions: users,
          contextInfo 
        })
      }
      // Si es texto
      return conn.sendMessage(m.chat, { 
        text: text || q.text || q.caption || 'Zurdo’s Bot', 
        mentions: users,
        contextInfo 
      })
    }

    // SI MANDAS DIRECTO
    if (/imageMessage/.test(mime)) {
      return conn.sendMessage(m.chat, { 
        image: await m.download(), 
        caption: text || '', 
        mentions: users,
        contextInfo 
      })
    } 
    if (/videoMessage/.test(mime)) {
      return conn.sendMessage(m.chat, { 
        video: await m.download(), 
        mimetype: 'video/mp4',
        caption: text || '', 
        mentions: users,
        contextInfo 
      })
    } 
    if (/conversation|extendedTextMessage/.test(mime)) {
      return conn.sendMessage(m.chat, { 
        text: text || 'Zurdo’s Bot', 
        mentions: users,
        contextInfo 
      })
    }
    
  } catch (e) {
    console.log(e)
    return m.reply(`《✤》 Error: ${e.message}`)
  }
}

handler.help = ['n <texto>', 'hidetag <texto>', 'noti <texto>', 'aviso <texto>']
handler.tags = ['adm', 'group']
handler.command = ['hidetag', 'notify', 'n', 'noti', 'notificar', 'notif', 'aviso', 'avisar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler