const handler = async (m, { conn, args }) => {
    if (args.length < 2) return
    let tipo = args[0].toLowerCase()
    let salaId = args[1]
    global.vsData = global.vsData || {}
    let sala = global.vsData[salaId]
    if (!sala) return m.reply('*❌ Lista expirada*')

    let user = m.sender
    sala.jugadores = sala.jugadores.filter(v => v.id!== user)
    sala.suplentes = sala.suplentes.filter(v => v.id!== user)

    if (tipo === 'jugador') {
        if (sala.jugadores.length >= sala.icons1.length) return m.reply('*⚠️ Jugadores llenos*')
        sala.jugadores.push({ id: user })
        await conn.reply(m.chat, `✅ @${user.split('@')[0]} JUGADOR`, { mentions: [user] })
    }
    if (tipo === 'suplente') {
        if (sala.suplentes.length >= sala.icons2.length) return m.reply('*⚠️ Suplentes llenos*')
        sala.suplentes.push({ id: user })
        await conn.reply(m.chat, `✅ @${user.split('@')[0]} SUPLENTE`, { mentions: [user] })
    }

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
> © VS BOT`;

    await conn.sendListM(m.chat, `ꆬ ݂ *${sala.titulo}*`, message, 'Toca aquí para anotarte', [
        ['🎮 ANOTARSE COMO JUGADOR', `.anotarme jugador ${salaId}`],
        ['🌸 ANOTARSE COMO SUPLENTE', `.anotarme suplente ${salaId}`]
    ], m)
}
handler.command = /^anotarme$/i
export default handler