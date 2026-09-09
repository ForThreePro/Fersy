handler.before = async function (m, { conn, groupMetadata }) {
  try {
    if (!m.messageStubType ||!m.isGroup) return!0
    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat ||!chat.bienvenida) return!0

    const userJid = m.messageStubParameters?.[0] || m.participant
    if (!userJid) return!0

    // FIX: Imagen por defecto primero, y solo la cambiamos si SÍ tiene
    let pp = 'https://files.evogb.win/E2yVdA.jpg' // GARFIELD FALLBACK
    try {
      const userPP = await conn.profilePictureUrl(userJid, 'image')
      if (userPP) pp = userPP
    } catch {
      // Si no tiene foto, no pasa nada, usamos la de arriba
    }

    const userTag = `@${userJid.split('@')[0]}`
    const groupName = groupMetadata.subject
    const groupDesc = groupMetadata.desc || 'Sin descripción'
    const membersCount = groupMetadata.participants.length

    let txt = '', audio = null

    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_PARTICIPANT_ADD:
        audio = chat.audiowelcome
        txt = chat.customWelcome? chat.customWelcome.replace(/@user/gi, userTag).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc) :
`😼 𓆩 ***𝗡𝗨𝗘𝗩𝗢 𝗚𝗔𝗧𝗜𝗧𝗢*** 𓆪 😼\n\n🐱 *${userTag}* llegó a *${groupName}*\n🍕 *Miembro N°:* ${membersCount}`
        break

      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
        audio = chat.audiobye
        txt = chat.customBye? chat.customBye.replace(/@user/gi, userTag).replace(/@group/gi, groupName) :
`😾 𓆩 ***𝗦𝗘 𝗙𝗨𝗘 𝗗𝗘𝗟 𝗦𝗢𝗙𝗔*** 𓆪 😾\n\n💤 *${userTag}* se durmió fuera de *${groupName}*\n📉 *Quedamos:* ${membersCount}`
        break

      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
        audio = chat.audiokick
        txt = chat.customKick? chat.customKick.replace(/@user/gi, userTag).replace(/@group/gi, groupName) :
`🙀 𓆩 ***𝗘𝗫𝗣𝗨𝗟𝗦𝗔𝗗𝗢*** 𓆪 🙀\n\n🥊 *${userTag}* fue pateado de *${groupName}*`
        break
    }

    if (txt) {
      await conn.sendMessage(m.chat, {
        image: { url: pp }, // <- Ahora pp nunca está vacío
        caption: txt,
        mentions: [userJid]
      })

      if (audio) {
        if (Buffer.isBuffer(audio)) {
          await conn.sendMessage(m.chat, { audio: audio, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
        } else if (typeof audio === 'string' && audio.startsWith('http')) {
          await conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
        }
      }
    }
  } catch (e) {
    console.error("Error en Bienvenida Audio:", e)
  }
  return!0
}