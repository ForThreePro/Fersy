const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

// Memoria temporal. Se borra al reiniciar
global.perfilesTemp = global.perfilesTemp || new Map()

function getPerfil(jid) {
  if (!global.perfilesTemp.has(jid)) {
    global.perfilesTemp.set(jid, {
      age: '', birth: '', country: '', hobby: '', bio: '', gender: ''
    })
  }
  return global.perfilesTemp.get(jid)
}

let handler = async (m, { conn }) => {
  await react(conn, m, "👤")

  let who = m.mentionedJid?.[0] || m.sender
  let perfil = getPerfil(who)
  let dbUser = global.db?.data?.users?.[who] || {}

  let name
  try { name = await conn.getName(who) } catch { name = m.pushName || 'Usuario' }
  let number = who.split('@')[0]

  let level = dbUser.level || 0
  let exp = dbUser.exp || 0
  let money = dbUser.money || 0
  let limit = dbUser.limit || 0

  let age = perfil.age || 'No registrado'
  let birth = perfil.birth || 'No registrado'
  let country = perfil.country || 'No registrado'
  let hobby = perfil.hobby || 'No registrado'
  let bio = perfil.bio || 'Sin biografía'
  let gender = perfil.gender || 'No especificado'

  let reqXp = (level + 1) * 100
  let xpProgress = exp - (level * 100)

  let caption = `╭─「 PERFIL GARFIELD 」
│
│ 👤 *NOMBRE:* ${name}
│ 📱 *NUMERO:* @${number}
│ 🌍 *PAÍS:* ${country}
│ ⚧️ *GÉNERO:* ${gender}
│ 🎂 *EDAD:* ${age}
│ 📅 *CUMPLE:* ${birth}
│
│ 🎯 *HOBBY:* ${hobby}
│ 📝 *BIO:* ${bio}
│
│ 📊 *NIVEL:* ${level}
│ ⭐ *EXP:* ${xpProgress}/${reqXp}
│ 💰 *DINERO:* $${money}
│ 💎 *DIAMANTES:* ${limit}
│
╰───────────────────`

  let pp
  try { pp = await conn.profilePictureUrl(who, 'image') }
  catch { pp = 'https://i.ibb.co/1p9Q0V3/default.jpg' }

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: caption,
    mentions: [who]
  }, { quoted: m })

  await react(conn, m, "✅")
}

// COMANDOS PARA EDITAR
handler.before = async (m) => {
  if (!m.text) return
  let perfil = getPerfil(m.sender)
  let [cmd,...text] = m.text.trim().split(' ')
  text = text.join(' ')
  if(!text && cmd!== '.verperfil') return

  if (cmd === '.setedad') { perfil.age = text; return m.reply(`✅ Edad: ${text}`) }
  if (cmd === '.setcumple') {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return m.reply(`Formato:.setcumple DD/MM/YYYY`)
    perfil.birth = text; return m.reply(`✅ Cumple: ${text}`)
  }
  if (cmd === '.setpais') { perfil.country = text; return m.reply(`✅ País: ${text}`) }
  if (cmd === '.sethobby') { perfil.hobby = text; return m.reply(`✅ Hobby: ${text}`) }
  if (cmd === '.setbio') { perfil.bio = text; return m.reply(`✅ Bio actualizada`) }
  if (cmd === '.setgenero') { perfil.gender = text; return m.reply(`✅ Género: ${text}`) }
  if (cmd === '.borrarperfil') {
    global.perfilesTemp.delete(m.sender)
    return m.reply(`✅ Perfil borrado`)
  }
}

handler.help = ['perfil @user']
handler.tags = ['rg']
handler.command = ['perfil', 'p', 'profile']
export default handler