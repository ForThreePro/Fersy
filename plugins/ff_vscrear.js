const handler = async (m, { text, conn, args, usedPrefix, command }) => {
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

    const salaId = `vs_${m.chat}_${Date.now()}`;
    global.vsData = global.vsData || {};
    global.vsData[salaId] = { jugadores: [], suplentes: [], titulo, players, modalidad, horasEnPais, icons1, icons2, chat: m.chat };

    const message = `ꆬ ݂ *${titulo}* 🌹֟፝
  ത *𝖬𝗈𝖽𝖺𝗅𝗂𝖽𝖺𝖽:* ${modalidad}
  ത *𝖧𝗈𝗋𝖺:* ${horasEnPais.PE} 🇵🇪 ${horasEnPais.AR} 🇦🇷
ㅤ࿙࿚ㅤׅㅤ࿙࿚࿙࿚ㅤׅㅤ࿙࿚
߳𑁍̵ ֕︵۪᷼ ּ \`${players}:\` ׅ░ׅ
${icons1.map(icono => `${icono}˚ `).join('\n')}
      ꛁ⵿ֹ𐑼᪲ ۪ \`𝖲𝗎𝗉𝗅𝖾𝗇𝗍𝖾𝗌:\` ֹ̼ ׅ ❜𝆬 ᨩ̼
${icons2.map(icono => `${icono}˚ `).join('\n')}

╭─「 PARA ANOTARSE 」
│ Responde a *ESTE MENSAJE* con:
│ *1* = 🎮 JUGADOR
│ *2* = 🌸 SUPLENTE
│ *3* = ❌ SALIR
╰───────────────────
> © VS BOT`;

    let msg = await conn.sendMessage(m.chat, { text: message }, { quoted: m });
    global.vsData[salaId].msgId = msg.key.id // Guardamos el ID del mensaje para detectar replies
    await conn.sendMessage(m.chat, { react: { text: '🎮', key: msg.key }})
};

handler.command = /^(v4fem|vsfem4|v4masc|vsmasc4|v4mixto|vsmixto4|v6fem|vsfem6|v6masc|vsmasc6|v6mixto|vsmixto6)$/i;
export default handler;