const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

let handler = async (m, { conn, args }) => {
  try {
    await react(conn, m, "👤")

    // Si menciona a alguien usa esa persona, si no usa al que escribió
    let who = m.mentionedJid && m.mentionedJid[0]? m.mentionedJid[0] : m.sender

    // Obtener datos del usuario de la DB
    let user = global.db.data.users[who] || {}

    // Datos básicos
    let name = await conn.getName(who)
    let number = who.split('@')[0]
    let exp = user.exp || 0
    let level = user.level || 0
    let money = user.money || 0
    let limit = user.limit || 0
    let registered = user.registered || false
    let role = user.role || 'Principiante'

    // DATOS PERSONALIZABLES NUEVOS
    let age = user.age || 'No registrado'
    let birth = user.birth || 'No registrado' // Fecha de nacimiento: DD/MM/YYYY
    let country = user.country || 'No registrado'
    let hobby = user.hobby || 'No registrado'
    let bio = user.bio || 'Sin biografía'
    let gender = user.gender || 'No especificado'
    let marriage = user.marriage || 'Soltero(a)'

    // Calcular XP para el siguiente nivel
    let reqXp = (level + 1) * 100
    let xpProgress = exp - (level * 100)

    // Calcular días para cumpleaños
    let birthdayText = 'No registrado'
    if (user.birth) {
      let [d, mo, y] = user.birth.split('/')
      let today = new Date()
      let nextBday = new Date(today.getFullYear(), mo - 1, d)
      if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1)
      let diff = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24))
      birthdayText = `${user.birth} - Faltan ${diff} días`
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

    // Obtener foto de perfil
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
    await m.reply(`❌ Ocurrió un error al obtener el perfil.`)
  }
}

// COMANDO PARA EDITAR PERFIL
handler.before = async (m) => {
  if (!m.text) return
  let user = global.db.data.users[m.sender] || {}
  let [cmd,...text] = m.text.trim().split(' ')
  text = text.join(' ')

  if (cmd === '.setedad' || cmd === '.setage') {
    user.age = text
    return m.reply(`✅ Edad actualizada a: ${text}`)
  }
  if (cmd === '.setcumple' || cmd === '.setbirth') {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return m.reply(`Formato:.setcumple DD/MM/YYYY\nEjemplo:.setcumple 25/12/2000`)
    user.birth = text
    return m.reply(`✅ Fecha de nacimiento actualizada a: ${text}`)
  }
  if (cmd === '.setpais' || cmd === '.setcountry') {
    user.country = text
    return m.reply(`✅ País actualizado a: ${text}`)
  }
  if (cmd === '.sethobby') {
    user.hobby = text
    return m.reply(`✅ Pasatiempo actualizado a: ${text}`)
  }
  if (cmd === '.setbio') {
    user.bio = text
    return m.reply(`✅ Biografía actualizada`)
  }
  if (cmd === '.setgenero' || cmd === '.setgender') {
    user.gender = text
    return m.reply(`✅ Género actualizado a: ${text}`)
  }
  if (cmd === '.setestado' || cmd === '.setmarriage') {
    user.marriage = text
    return m.reply(`✅ Estado civil actualizado a: ${text}`)
  }
}

handler.help = ['perfil @user']
handler.tags = ['rg']
handler.command = ['perfil', 'profile', 'p']
handler.register = false

export default handler