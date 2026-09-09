import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin &&!isOwner) return conn.reply(m.chat, `🐱 𓆩 ***𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗢𝗙𝗜𝗖𝗜𝗔𝗟*** 𓆪 🐱\n\n🍕 *Solo admins pueden usar este comando*`, m)
  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  if (/on/i.test(args[0])) {
    chat.bienvenida = true
    await conn.reply(m.chat, `😼 𓆩 ***𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗜𝗗𝗔*** 𓆪 😼\n\n🟢 *Activada con imágenes de Stellar*`, m)
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
  if (!m.messageStubType ||!m.isGroup) return!0
  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat ||!chat.bienvenida) return!0

  let userJid = m.messageStubParameters?.[0] || m.participant || m.key?.participant || ''
  if (!userJid) return!0

  const key = 'proyectsV2'
  const DEFAULT_BG = 'https://files.evogb.win/7BY3Yv.jpg'
  const DEFAULT_IMG = 'https://files.evogb.win/E2yVdA.jpg'

  // ===== SACAR NOMBRE BIEN =====
  let participant = groupMetadata.participants.find(p => p.id === userJid)
  let userName = participant?.name || participant?.notify || userJid.split('@')[0]
  userName = userName.replace(/[^a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]/g, '').trim() // quitar emojis raros
  if(!userName) userName = 'Usuario'

  // ===== FOTO CON REGLA =====
  let userPP = DEFAULT_IMG
  try {
    let pp = await conn.profilePictureUrl(userJid, 'image')
    if(pp && pp.startsWith('https')) userPP = pp
  } catch {}

  const userTag = `@${userJid.split('@')[0]}`
  const groupName = groupMetadata.subject
  const groupDesc = groupMetadata.desc || 'Sin descripción'
  const membersCount = groupMetadata.participants.length

  let txt = '', audio = null
  let isWelcome = false

  switch (m.messageStubType) {
    case WAMessageStubType.GROUP_PARTICIPANT_ADD:
      isWelcome = true
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
    default: return!0
  }

  if (txt) {
    if (isWelcome) {
      try {
        // ARREGLO: NO USAR encodeURIComponent en username porque la API de stellar lo bugea
        let apiUrl = `https://api.stellarwa.xyz/generate/welcome2?username=${userName}&guildName=${encodeURIComponent(groupName)}&memberCount=${membersCount}&avatar=${encodeURIComponent(userPP)}&background=${encodeURIComponent(DEFAULT_BG)}&key=${key}`

        console.log('Enviando a API:', userName) // debug
        let res = await fetch(apiUrl, { timeout: 30000 })
        if (res.ok) {
          let buffer = await res.buffer()
          await conn.sendMessage(m.chat, { image: buffer, caption: txt, mentions: [userJid] })
        } else {
          throw new Error(await res.text())
        }
      } catch (e) {
        console.log('STELLAR WELCOME ERROR:', e.message)
        try {
          let res = await fetch(userPP)
          let imgBuffer = await res.buffer()
          await conn.sendMessage(m.chat, { image: imgBuffer, caption: txt, mentions: [userJid] })
        } catch {
          await conn.sendMessage(m.chat, { text: txt, mentions: [userJid] })
        }
      }
    } else {
      try {
        let res = await fetch(userPP)
        let imgBuffer = await res.buffer()
        await conn.sendMessage(m.chat, { image: imgBuffer, caption: txt, mentions: [userJid] })
      } catch {
        await conn.sendMessage(m.chat, { text: txt, mentions: [userJid] })
      }
    }

    if (audio) {
      if (Buffer.isBuffer(audio)) {
        await conn.sendMessage(m.chat, { audio: audio, mimetype: 'audio/mpeg', ptt: false })
      } else if (typeof audio === 'string' && audio.startsWith('http')) {
        await conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: 'audio/mpeg', ptt: false })
      }
    }
  }
  return!0
}

export default handler