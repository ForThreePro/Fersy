let vs = global.vsData = global.vsData || {}

const crear = async (m, { conn, args, usedPrefix, command }) => {
    if (args.length < 2) return conn.reply(m.chat, `*❌ Ejemplo:* ${usedPrefix + command} 20 pe infinito`, m);

    let [hora, minutos] = args[0].includes(':')? args[0].split(':').map(Number) : [Number(args[0]), 0];
    const pais = args[1].toUpperCase();
    const diferenciasHorarias = { CL: 2, AR: 2, PE: 0 };
    if (!(pais in diferenciasHorarias)) return conn.reply(m.chat, '*⚠️ Usa AR, PE o CL*', m);

    const diferenciaHoraria = diferenciasHorarias[pais];
    const formatTime = (date) => date.toLocaleTimeString('es', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const horasEnPais = { CL: '', AR: '', PE: '' };
    for (const key in diferenciasHorarias) {
        const horaActual = new Date(); horaActual.setHours(hora, minutos, 0, 0);
        const horaEnPais = new Date(horaActual.getTime() + (3600000 * (diferenciasHorarias[key] - diferenciaHoraria)));
        horasEnPais[key] = formatTime(horaEnPais);
    }

    const modalidad = args.slice(2).join(' ');
    let titulo = '', players = '', icons1 = [], icons2 = [];
    if(command.includes('4') && command.includes('fem')){ titulo='4VS4 FEM'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖺𝗌'; icons1=['🌸','🌸','🌸','🌸']; icons2=['🌸','🌸'] }
    if(command.includes('4') && command.includes('masc')){ titulo='4VS4 MASC'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖾𝗌'; icons1=['🥥','🥥','🥥','🥥']; icons2=['🥥','🥥'] }
    if(command.includes('4') && command.includes('mixto')){ titulo='4VS4 MIXTO'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖾𝗌'; icons1=['🍁','🍁','🍁','🍁']; icons2=['🍁','🍁'] }
    if(command.includes('6') && command.includes('fem')){ titulo='6VS6 FEM'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖺𝗌'; icons1=['🦋','🦋','🦋','🦋','🦋','🦋']; icons2=['🦋','🦋'] }
    if(command.includes('6') && command.includes('masc')){ titulo='6VS6 MASC'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖾𝗌'; icons1=['🥞','🥞','🥞','🥞','🥞','🥞']; icons2=['🥞','🥞'] }
    if(command.includes('6') && command.includes('mixto')){ titulo='6VS6 MIXTO'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖾𝗌'; icons1=['🥯','🥯','🥯','🥯','🥯','🥯']; icons2=['🥯','🥯'] }

    // GUARDA LA VS COMO "ACTIVA" EN ESE GRUPO
    vs[m.chat] = { jugadores: [], suplentes: [], titulo, players, modalidad, horasEnPais, icons1, icons2 };

    let msg = await actualizarLista(m.chat, conn, usedPrefix)
    await conn.sendMessage(m.chat, { react: { text: '🎮', key: msg.key }})
}

const anotar = async (m, { conn, usedPrefix, command }) => {
    if (!vs[m.chat]) return m.reply(`*❌ No hay VS activa en este grupo*\nCrea una con: ${usedPrefix}v4fem 20 pe`)

    let sala = vs[m.chat]
    let user = m.sender

    sala.jugadores = sala.jugadores.filter(v => v!== user)
    sala.suplentes = sala.suplentes.filter(v => v!== user)

    if (command === 'j') {
        if (sala.jugadores.length >= sala.icons1.length) return m.reply('*⚠️ Jugadores llenos*')
        sala.jugadores.push(user)
        await conn.reply(m.chat, `✅ @${user.split('@')[0]} JUGADOR 🎮`, { mentions: [user] })
    }
    if (command === 's') {
        if (sala.suplentes.length >= sala.icons2.length) return m.reply('*⚠️ Suplentes llenos*')
        sala.suplentes.push(user)
        await conn.reply(m.chat, `✅ @${user.split('@')[0]} SUPLENTE 🌸`, { mentions: [user] })
    }
    if (command === 'out') {
        return m.reply(`❌ @${user.split('@')[0]} salió`, null, { mentions: [user] })
    }

    await actualizarLista(m.chat, conn, usedPrefix)
}

const actualizarLista = async (chat, conn, usedPrefix) => {
    let sala = vs[chat]
    let listaJug = sala.jugadores.map((v, i) => `${sala.icons1[i]} @${v.split('@')[0]}`).join('\n')
    let listaSup = sala.suplentes.map((v, i) => `${sala.icons2[i]} @${v.split('@')[0]}`).join('\n')
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
│ *.j* = 🎮 JUGADOR
│ *.s* = 🌸 SUPLENTE
│ *.out* = ❌ SALIR
╰───────────────────
> © VS BOT`;

    return await conn.sendMessage(chat, { text: message, mentions: [...sala.jugadores,...sala.suplentes] })
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (['v4fem','vsfem4','v4masc','vsmasc4','v4mixto','vsmixto4','v6fem','vsfem6','v6masc','vsmasc6','v6mixto','vsmixto6'].includes(command)) return crear(m, {conn, args, usedPrefix, command})
    if (['j','s','out'].includes(command)) return anotar(m, {conn, usedPrefix, command})
}

handler.command = /^(v4fem|vsfem4|v4masc|vsmasc4|v4mixto|vsmixto4|v6fem|vsfem6|v6masc|vsmasc6|v6mixto|vsmixto6|j|s|out)$/i
export default handler