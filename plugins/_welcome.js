import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin &&!isOwner) {
    let error = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`ACCESO DENEGADO\`\` —˙𖦹.🔒꒷

── *📝 AVISO* ╏
🔒 ➛ Solo admins pueden usar este comando

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: error }, { quoted: m })
  }

  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  if (/on/i.test(args[0])) {
    await react('🟢')
    chat.bienvenida = true
    let ok = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`BIENVENIDA\`\` —˙𖦹.🟢꒷

── *📊 ESTADO* ╏
🟢 ➛ Activada
🖼️ ➛ Con imagen personalizada

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
  } else if (/off/i.test(args[0])) {
    await react('🔴')
    chat.bienvenida = false
    let off = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`BIENVENIDA\`\` —˙𖦹.🔴꒷

── *📊 ESTADO* ╏
🔴 ➛ Desactivada

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: off }, { quoted: m })
  } else {
    await react('❌')
    let uso = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` —˙𖦹.⚙️꒷

── *📖 USO* ╏
➛ bienvenida on
➛ bienvenida off

━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: uso }, { quoted: m })
  }
}

handler.help = ['bienvenida <on/off>']
handler.tags = ['configuración']
handler.command = /^(bienvenida|welcome|bye)$/i
handler.group = true
handler.admin = true

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.messageStubType ||!m.isGroup) return!0
  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat ||!chat.bienvenida) return!0

  const userJid = m.messageStubParameters?.[0] || m.participant
  if (!userJid) return!0

  const DEFAULT_IMG = 'https://files.evogb.win/GEkGfz.jpg' // <-- TU FOTO NUEVA FERSY
  let imgBuffer = null

  // PASO 1: Intentar obtener foto del usuario
  try {
    let userPP = await conn.profilePictureUrl(userJid, 'image')
    let res = await fetch(userPP)
    imgBuffer = await res.buffer()
  } catch {
    // PASO 2: Si falla, usar la foto de Fersy
    try {
      let res = await fetch(DEFAULT_IMG)
      imgBuffer = await res.buffer()
    } catch {
      imgBuffer = null
    }
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
`💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`BIENVENIDO\`\` —˙𖦹.✨꒷

── *📊 INFORMACIÓN* ╏
👋 ➛ ${userTag} llegó a *${groupName}*
👥 ➛ Miembro N°: *${membersCount}*
> _"Brillando como Fersy"_ 🪩

━━━━━━━━━━━`
      break

    case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
      audio = chat.audiobye
      txt = chat.customBye? chat.customBye.replace(/@user/gi, userTag).replace(/@group/gi, groupName) :
`💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`SE FUE\`\` —˙𖦹.💤꒷

── *📊 INFORMACIÓN* ╏
💤 ➛ ${userTag} salió de *${groupName}*
📉 ➛ Quedamos: *${membersCount}*

━━━━━━━━━━━`
      break

    case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
      audio = chat.audiokick
      txt = chat.customKick? chat.customKick.replace(/@user/gi, userTag).replace(/@group/gi, groupName) :
`💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`EXPULSADO\`\` —˙𖦹.🥊꒷

── *📊 INFORMACIÓN* ╏
🥊 ➛ ${userTag} fue expulsado de *${groupName}*

━━━━━━━━━━━`
      break
  }

  if (txt) {
    if (imgBuffer) {
      await conn.sendMessage(m.chat, { image: imgBuffer, caption: txt, mentions: [userJid] })
    } else {
      await conn.sendMessage(m.chat, { text: txt, mentions: [userJid] })
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