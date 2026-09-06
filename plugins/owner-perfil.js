const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

// Función para asegurar que el usuario existe en la DB
function getUser(who) {
  if (!global.db) global.db = { data: { users: {} } }
  if (!global.db.data) global.db.data = { users: {} }
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {
      exp: 0, level: 0, money: 0, limit: 0, registered: false, role: 'Principiante',
      age: null, birth: null, country: null, hobby: null, bio: null, gender: null, marriage: null
    }
  }
  return global.db.data.users[who]
}

let handler = async (m, { conn, args }) => {
  try {
    await react(conn, m, "👤")

    let who = m.mentionedJid && m.mentionedJid[0]? m.mentionedJid[0] : m.sender
    let user = getUser(who)

    // ARREGLO: getName sin.catch
    let name
    try {
      name = await conn.getName(who)
    } catch {
      name = m.pushName || 'Usuario'
    }

    let number = who.split('@')[0]
    let exp = user.exp || 0
    let level = user.level || 0
    let money = user.money || 0
    let limit = user.limit || 0
    let registered = user.registered || false
    let role = user.role || 'Principiante'

    // DATOS PERSONALIZABLES
    let age = user.age || 'No registrado'
    let birth = user.birth || 'No registrado'
    let country = user.country || 'No registrado'
    let hobby = user.hobby || 'No registrado'
    let bio = user.bio || 'Sin biografía'
    let gender = user.gender || 'No especificado'
    let marriage = user.marriage || 'Soltero(a)'

    let reqXp = (level + 1) * 100
    let xpProgress = exp - (level * 100)

    let birthdayText = 'No registrado'
    if (user.birth) {
      try {
        let [d, mo, y] = user.birth.split('/')
        let today = new Date()
        let nextBday = new Date(today.getFullYear(), mo - 1, d)
        if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1)
        let diff = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24))
        birthdayText = `${user.birth} - Faltan ${diff} días`
      } catch { birthdayText = user.birth }
    }

    const caption = `╭─「 PERFIL DE USUARIO 」
│
│ 👤 *NOMBRE:* ${name}
│ 📱 *NUMERO:* @${number}
│ 🌍 *PAÍS:* ${country}
│ ⚧️ *GÉNERO:* ${gender}
│ 🎂 *EDAD:* ${age}
│ 📅 *CUMPLE:* ${birthdayText}
│ 💍 *ESTADO:* ${marriage}
│
│ 🎯 *PASATIEMPO:* ${hobby}
│ 📝 *BIO:* ${bio}
│
│ 🏷️ *RANGO:* ${role}
│ 📊 *NIVEL:* ${level}
│ ⭐ *EXP:* ${xpProgress}/${reqXp}
│ 💰 *DINERO:* $${money}
│ 💎 *DIAMANTES:* ${limit}
│
│ ✅ *REGISTRO:* ${registered? 'Si' : 'No'}
│
╰───────────────────────`

    let pp
    try {
      pp = await conn.profilePictureUrl(who, 'image')
    } catch {
      pp = 'https://i.ibb.co/1p9Q0V3/default.jpg'
    }

    await conn.sendMessage(m.chat, {
      image: { url: pp },
      caption: caption,
      mentions: [who]
    }, { quoted: m })

    await react(conn, m, "✅")

  } catch (e) {
    console.error(e)
    await react(conn, m, "❌")
    await m.reply(`❌ Error: ${e.message}`)
  }
}

// COMANDOS PARA EDITAR
handler.before = async (m, { conn }) => {
  if (!m.text) return
  let user = getUser(m.sender)
  let [cmd,...text] = m.text.trim().split(' ')
  text = text.join(' ')

  if (cmd === '.setedad') { user.age = text; return m.reply(`✅ Edad: ${text}`) }
  if (cmd === '.setcumple') {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return m.reply(`Formato:.setcumple DD/MM/YYYY`)
    user.birth = text; return m.reply(`✅ Cumple: ${text}`)
  }
  if (cmd === '.setpais') { user.country = text; return m.reply(`✅ País: ${text}`) }
  if (cmd === '.sethobby') { user.hobby = text; return m.reply(`✅ Hobby: ${text}`) }
  if (cmd === '.setbio') { user.bio = text; return m.reply(`✅ Bio actualizada`) }
  if (cmd === '.setgenero') { user.gender = text; return m.reply(`✅ Género: ${text}`) }
  if (cmd === '.setestado') { user.marriage = text; return m.reply(`✅ Estado: ${text}`) }
}

handler.help = ['perfil @user']
handler.tags = ['rg']
handler.command = ['perfil', 'profile', 'p']
export default handler