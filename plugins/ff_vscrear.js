let vs = global.vsData = global.vsData || {}

const crear = async (m, { conn, args, usedPrefix, command }) => {
    if (args.length < 2) return conn.reply(m.chat, `*❌ Ejemplo:* ${usedPrefix + command} 20 pe infinito`, m);
    let horaRaw = args[0];
    let hora, minutos;
    if(horaRaw.includes(':')){ [hora, minutos] = horaRaw.split(':').map(Number) } else { hora = Number(horaRaw); minutos = 0 }
    if(isNaN(hora) || hora < 0 || hora > 23) return conn.reply(m.chat, '*❌ Hora inválida*', m)

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

    const modalidad = args.slice(2).join(' ') || 'Sala Normal';
    let titulo = '', players = '', icons1 = [], icons2 = [];
    if(command.includes('4') && command.includes('fem')){ titulo='4VS4 FEM'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖺𝗌'; icons1=['1️⃣','2️⃣','3️⃣','4️⃣']; icons2=['5️⃣','6️⃣'] }
    if(command.includes('4') && command.includes('masc')){ titulo='4VS4 MASC'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖾𝗌'; icons1=['1️⃣','2️⃣','3️⃣','4️⃣']; icons2=['5️⃣','6️⃣'] }
    if(command.includes('4') && command.includes('mixto')){ titulo='4VS4 MIXTO'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖾𝗌'; icons1=['1️⃣','2️⃣','3️⃣','4️⃣']; icons2=['5️⃣','6️⃣'] }
    if(command.includes('6') && command.includes('fem')){ titulo='6VS6 FEM'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖺𝗌'; icons1=['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣']; icons2=['7️⃣','8️⃣'] }
    if(command.includes('6') && command.includes('masc')){ titulo='6VS6 MASC'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖾𝗌'; icons1=['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣']; icons2=['7️⃣','8️⃣'] }
    if(command.includes('6') && command.includes('mixto')){ titulo='6VS6 MIXTO'; players='𝖩𝗎𝗀𝖺𝖽𝗈𝗋𝖾𝗌'; icons1=['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣']; icons2=['7️⃣','8️⃣'] }

    vs[m.chat] = { jugadores: [], suplentes: [], titulo, players, modalidad, horasEnPais, icons1, icons2 };
    await actualizarLista(m.chat, conn, usedPrefix)
    m.react('🎮')
}

const anotar = async (m, { conn, usedPrefix, command }) => {
    if (!vs[m.chat]) return conn.reply(m.chat, `*❌ No hay VS activa*`, m)
    let sala = vs[m.chat]

    // AGARRA TODOS LOS MENCIONADOS
    let users = m.mentionedJid || []
    if(users.length === 0) return conn.reply(m.chat, `*❌ Menciona a alguien*\nEj:.anotar @pepito @juana`, m)

    for(let user of users){
        sala.jugadores = sala.jugadores.filter(v => v!== user)
        sala.suplentes = sala.suplentes.filter(v => v!== user)

        if (command === 'anotar' || command === 'j') {
            if (sala.jugadores.length >= sala.icons1.length) return conn.reply(m.chat, '*⚠️ Jugadores llenos*', m)
            sala.jugadores.push(user)
        }
        if (command === 'suplente' || command === 's') {
            if (sala.suplentes.length >= sala.icons2.length) return conn.reply(m.chat, '*⚠️ Suplentes llenos*', m)
            sala.suplentes.push(user)
        }
        if (command === 'salir' || command === 'out') {
            await conn.reply(m.chat, `❌ @${user.split('@')[0]} salió`, m, { mentions: [user] })
        }
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

╭─「 COMO ANOTARSE 」
│ Admin: *.anotar @user1 @user2*
│ Admin: *.suplente @user*
│ Admin: *.salir @user*
│
│ Players: Reaccionen con:
│ 🎮 = Quiero JUGAR
│ 🌸 = Quiero SUPLENTE
╰───────────────────
> © VS BOT`;

    await conn.sendMessage(chat, { text: message, mentions: [...sala.jugadores,...sala.suplentes] })
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (['v4fem','vsfem4','v4masc','vsmasc4','v4mixto','vsmixto4','v6fem','vsfem6','v6masc','vsmasc6','v6mixto','vsmixto6'].includes(command)) return crear(m, {conn, args, usedPrefix, command})
    if (['anotar','suplente','salir','j','s','out'].includes(command)) return anotar(m, {conn, usedPrefix, command})
}

handler.command = /^(v4fem|vsfem4|v4masc|vsmasc4|v4mixto|vsmixto4|v6fem|vsfem6|v6masc|vsmasc6|v6mixto|vsmixto6|anotar|suplente|salir|j|s|out)$/i
export default handler