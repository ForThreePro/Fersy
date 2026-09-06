const handler = async (m, { conn, args, usedPrefix, command }) => {

    if (args.length < 2) return m.reply(`*❌ Usa:* ${usedPrefix}anotarme jugador/suplente`)

    let tipo = args[0].toLowerCase() // jugador o suplente
    let salaId = args[1] // el id de la sala

    global.vsData = global.vsData || {}
    let sala = global.vsData[salaId]

    if (!sala) return m.reply('*❌ Esta lista ya expiró o no existe*')

    let user = m.sender

    // Quitar de ambas listas si ya estaba
    sala.jugadores = sala.jugadores.filter(v => v.id!== user)
    sala.suplentes = sala.suplentes.filter(v => v.id!== user)

    if (tipo === 'jugador') {
        if (sala.jugadores.length >= sala.icons1.length) {
            return m.reply('*⚠️ Ya están todos los jugadores completos*')
        }
        sala.jugadores.push({ id: user })
        await m.reply(`✅ @${user.split('@')[0]} se anotó como JUGADOR`, { mentions: [user] })
    }

    if (tipo === 'suplente') {
        if (sala.suplentes.length >= sala.icons2.length) {
            return m.reply('*⚠️ Ya están los suplentes completos*')
        }
        sala.suplentes.push({ id: user })
        await m.reply(`✅ @${user.split('@')[0]} se anotó como SUPLENTE`, { mentions: [user] })
    }

    // ACTUALIZAR LA LISTA
    let listaJug = sala.jugadores.map((v, i) => `${sala.icons1[i]} @${v.id.split('@')[0]}`).join('\n')
    let listaSup = sala.suplentes.map((v, i) => `${sala.icons2[i]} @${v.id.split('@')[0]}`).join('\n')

    // Rellenar espacios vacíos
    for(let i = sala.jugadores.length; i < sala.icons1.length; i++){
        listaJug += `\n${sala.icons1[i]}˚ `
    }
    for(let i = sala.suplentes.length; i < sala.icons2.length; i++){
        listaSup += `\n${sala.icons2[i]}˚ `
    }

    const message = `ꆬ ݂ *${sala.titulo}* 🌹֟፝

  ത *𝖬𝗈𝖽𝖺𝗅𝗂𝖽𝖺𝖽:* ${sala.modalidad}
  ത *𝖧𝗈𝗋𝖺:* ${sala.horasEnPais.PE} 🇵🇪 ${sala.horasEnPais.AR} 🇦🇷

ㅤ࿙࿚ㅤׅㅤ࿙࿚࿙࿚ㅤׅㅤ࿙࿚

߳𑁍̵ ֕︵۪᷼ ּ \`${sala.players}:\` ׅ░ׅ

${listaJug}

      ꛁ⵿ֹ𐑼᪲ ۪ \`𝖲𝗎𝗉𝗅𝖾𝗇𝗍𝖾𝗌:\` ֹ̼ ׅ ❜𝆬 ᨩ̼

${listaSup}

> © Տһᥲძᨣᥕ Ɓᨣƚ Uᥣ𝗍rᥲ `;

    await conn.sendMessage(m.chat, {
        text: message,
        footer: 'Toca el botón para anotarte',
        buttons: [
            { buttonId: `${usedPrefix}anotarme jugador ${salaId}`, buttonText: { displayText: 'Jugador' }, type: 1 },
            { buttonId: `${usedPrefix}anotarme suplente ${salaId}`, buttonText: { displayText: 'Suplente' }, type: 1 }
        ],
        viewOnce: true
    }, { quoted: m });

}

handler.command = /^anotarme$/i
export default handler