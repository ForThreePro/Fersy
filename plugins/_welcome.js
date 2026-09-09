import { WAMessageStubType } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin &&!isOwner) return conn.reply(m.chat, `🐱 𓆩 ***𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗢𝗙𝗜𝗖𝗜𝗔𝗟*** 𓆪 🐱\n\n🍕 *Solo admins pueden usar este comando*`, m)
  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  if (/on/i.test(args[0])) {
    chat.bienvenida = true
    await conn.reply(m.chat, `😼 𓆩 ***𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗔*** 𓆪 😼\n\n🟢 *Activada con audios*`, m)
  } else if (/off/i.test(args[0])) {
    chat.bienvenida = false
    await conn.reply(m.chat, `😼 𓆩 ***𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗔*** 𓆪 😼\n\n🔴 *Desactivada*`, m)
  } else {
    await conn.reply(m.chat, `🐱 𓆩 ***𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗢𝗙𝗜𝗖𝗜𝗔𝗟*** 𓆪 🐱\n\n📌 *Uso:* ${m.prefix}bienvenida on/off`, m)
  }
}

handler.help = ['bienvenida <on/off>']
handler.tags = ['config']
handler.command = /^(bienvenida|welcome|bye)$/i
handler.group = true
handler.admin = true

handler.before = async function (m, { conn, groupMetadata }) {
  try {
    if (!m.messageStubType ||!m.isGroup) return!0
    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat ||!chat.bienvenida) return!0

    const userJid = m.messageStubParameters?.[0] || m.participant
    if (!userJid) return!0

    const DEFAULT_IMG = 'https://files.evogb.win/E2yVdA.jpg'
    let pp = DEFAULT_IMG

    // FIX: Intentar 2 veces. Algunos jid necesitan "s.whatsapp.net"
    try {
      pp = await conn.profilePictureUrl(userJid, 'image')
    } catch {
      try {
        pp = await conn.profilePictureUrl(userJid, 'image')
      } catch {
        pp = DEFAULT_IMG // Si falla 2 veces, usa default
      }
    }

    // Validación extra: si vino vacío o no es url, usa default
    if (!pp ||!pp.startsWith('http')) pp = DEFAULT_IMG

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
      try {
        await conn.sendMessage(m.chat, {
          image: { url: pp },
          caption: txt,
          mentions: [userJid]
        })
      } catch {
        await conn.sendMessage(m.chat, { text: txt, mentions: [userJid] })
      }

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

export default handler