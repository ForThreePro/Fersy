// ESTE HANDLER LEE LOS BOTONES
let handler = async (m, { conn, usedPrefix }) => {}

// SE EJECUTA ANTES DE TODO
handler.before = async (m, { conn }) => {
    if (!m.message?.buttonsResponseMessage) return // si no es boton, salir
    const buttonId = m.message.buttonsResponseMessage.selectedButtonId

    if (!buttonId?.startsWith('.anotarme_')) return // si no es de anotarme, salir

    let partes = buttonId.split('_') //.anotarme_jugador_vs_grupo_123
    let tipo = partes[1] // jugador o suplente
    let salaId = partes.slice(2).join('_') // vs_grupo_123

    global.vsData = global.vsData || {}
    let sala = global.vsData[salaId]
    if (!sala) return m.reply('*❌ Esta lista ya expiró*')

    let user = m.sender
    sala.jugadores = sala.jugadores.filter(v => v.id!== user)
    sala.suplentes = sala.suplentes.filter(v => v.id!== user)

    if (tipo === 'jugador') {
        if (sala.jugadores.length >= sala.icons1.length) return m.reply('*⚠️ Jugadores llenos*')
        sala.jugadores.push({ id: user })
        await m.reply(`✅ @${user.split('@')[0]} se anotó como JUGADOR`, { mentions: [user] })
    }
    if (tipo === 'suplente') {
        if (sala.suplentes.length >= sala.icons2.length) return m.reply('*⚠️ Suplentes llenos*')
        sala.suplentes.push({ id: user })
        await m.reply(`✅ @${user.split('@')[0]} se anotó como SUPLENTE`, { mentions: [user] })
    }

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
> © VS BOT`;

    await conn.sendMessage(m.chat, {
        text: message,
        footer: 'Toca un botón para anotarte',
        buttons: [
            { buttonId: `.anotarme_jugador_${salaId}`, buttonText: { displayText: '🎮 JUGADOR' }, type: 1 },
            { buttonId: `.anotarme_suplente_${salaId}`, buttonText: { displayText: '🌸 SUPLENTE' }, type: 1 }
        ],
        headerType: 1
    }, { quoted: m });
}

handler.command = /^$/i // no tiene comando, solo before
export default handler