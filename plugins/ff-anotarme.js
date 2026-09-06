const handler = async (m, { conn }) => {}

// ESTE BEFORE DETECTA CUANDO RESPONDEN A LA VS
handler.before = async (m, { conn }) => {
    if (!m.quoted) return // Si no responde a nada, salir
    if (!m.text) return // Si no manda texto, salir

    global.vsData = global.vsData || {}

    // BUSCAR A QUE VS RESPONDIO
    let salaId = Object.keys(global.vsData).find(k => global.vsData[k].msgId === m.quoted.id)
    if (!salaId) return // Si no responde a una VS, salir

    let sala = global.vsData[salaId]
    let user = m.sender
    let opcion = m.text.trim() // 1, 2 o 3

    // LIMPIAR AL USUARIO DE AMBAS LISTAS PRIMERO
    sala.jugadores = sala.jugadores.filter(v => v.id!== user)
    sala.suplentes = sala.suplentes.filter(v => v.id!== user)

    if (opcion === '1') { // JUGADOR
        if (sala.jugadores.length >= sala.icons1.length) return m.reply('*⚠️ Jugadores llenos*', m.chat, { quoted: m })
        sala.jugadores.push({ id: user })
        await conn.reply(sala.chat, `✅ @${user.split('@')[0]} se anotó como JUGADOR 🎮`, { mentions: [user] })
    }
    else if (opcion === '2') { // SUPLENTE
        if (sala.suplentes.length >= sala.icons2.length) return m.reply('*⚠️ Suplentes llenos*', m.chat, { quoted: m })
        sala.suplentes.push({ id: user })
        await conn.reply(sala.chat, `✅ @${user.split('@')[0]} se anotó como SUPLENTE 🌸`, { mentions: [user] })
    }
    else if (opcion === '3') { // SALIR
        await conn.reply(sala.chat, `❌ @${user.split('@')[0]} salió de la lista`, { mentions: [user] })
    }
    else return // Si pone otra cosa, no hacer nada

    // ACTUALIZAR LISTA
    let listaJug = sala.jugadores.map((v, i) => `${sala.icons1[i]} @${v.id.split('@')[0]}`).join('\n')
    let listaSup = sala.suplentes.map((v, i) => `${sala.icons2[i]} @${v.id.split('@')[0]}`).join('\n')
    for(let i = sala.jugadores.length; i < sala.icons1.length; i++){ listaJug += `\n${sala.icons1[i]}˚ ` }
    for(let i = sala.suplentes.length; i < sala.icons2.length; i++){ listaSup += `\n${sala.icons2[i]}˚ ` }

    const message = `ꆬ ݂ *${sala.titulo}* 🌹֟፝
  ത *𝖬𝗈𝖽𝖺𝗅𝗂𝖽𝖺𝖽:* ${sala.modalidad}
  ത *𝖧𝗈𝗋𝖺:* ${sala.horasEnPais.PE} 🇵🇪 ${sala.horasEnPais.AR} 🇦🇷
ㅤ࿙࿚ㅤׅㅤ࿙࿚࿙࿚ㅤׅㅤ࿙࿚
߳𑁍̵ ֕︵۪᷼ ּ \`${sala.players}:\` ׅ░ׅ
${listaJug}
      ꛁ⵿ֹ𐑼᪲ ۪ \`𝖲𝗎𝗉𝗅𝖾𝗇𝗍𝖾𝗌:\` ֹ̼ ׅ ❜𝆬 ᨩ̼
${listaSup}

╭─「 PARA ANOTARSE 」
│ Responde a *ESTE MENSAJE* con:
│ *1* = 🎮 JUGADOR
│ *2* = 🌸 SUPLENTE
│ *3* = ❌ SALIR
╰───────────────────
> © VS BOT`;

    await conn.sendMessage(sala.chat, { text: message, mentions: [...sala.jugadores.map(v=>v.id),...sala.suplentes.map(v=>v.id)] })
}

handler.command = /^$/i // No tiene comando, solo before
export default handler