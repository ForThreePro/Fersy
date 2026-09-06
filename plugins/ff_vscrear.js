let vs = global.vsData = global.vsData || {}

const crear = async (m, { conn, args, usedPrefix, command }) => {
    if (args.length < 2) return conn.reply(m.chat, `*❌ Ejemplo:* ${usedPrefix + command} 14 pe Apos`, m);

    let horaRaw = args[0];
    let hora, minutos;
    if(horaRaw.includes(':')){ [hora, minutos] = horaRaw.split(':').map(Number) } else { hora = Number(horaRaw); minutos = 0 }

    const pais = args[1].toUpperCase();
    const diferenciasHorarias = { CL: 2, AR: 2, PE: 0, BO: 2 };
    if (!(pais in diferenciasHorarias)) return conn.reply(m.chat, '*⚠️ Usa PE, CL, AR o BO*', m);

    const diferenciaHoraria = diferenciasHorarias[pais];
    const formatTime = (date) => date.toLocaleTimeString('es', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const horasEnPais = { PE: '', CL: '', AR: '', BO: '' };
    for (const key in diferenciasHorarias) {
        const horaActual = new Date(); horaActual.setHours(hora, minutos, 0, 0);
        const horaEnPais = new Date(horaActual.getTime() + (3600000 * (diferenciasHorarias[key] - diferenciaHoraria)));
        horasEnPais[key] = formatTime(horaEnPais);
    }

    const modalidad = args.slice(2).join(' ') || 'APOS';

    let groupName = 'VS'
    if(m.isGroup){
        let groupMeta = await conn.groupMetadata(m.chat)
        groupName = groupMeta.subject.toUpperCase()
    }

    let cantidad = command.includes('6')? 6 : 4
    let tipo = command.includes('fem')? 'FEM' : command.includes('masc')? 'MASC' : 'MIXTO'
    let titulo = `${cantidad}VS${cantidad} ${tipo}`

    let playerIcon = tipo === 'FEM'? '🍭' : tipo === 'MASC'? '🥥' : '🍁'
    let suplenteIcon = '🧁'
    let icons1 = Array(cantidad).fill(playerIcon)
    let icons2 = [suplenteIcon, suplenteIcon]

    vs[m.chat] = { jugadores: [], suplentes: [], titulo, modalidad, horasEnPais, icons1, icons2, header: groupName };
    await actualizarLista(m.chat, conn, usedPrefix)
    m.react('🎮')
}

const anotar = async (m, { conn, usedPrefix, command }) => {
    if (!vs[m.chat]) return conn.reply(m.chat, `*❌ No hay VS activa*`, m)
    let sala = vs[m.chat]
    let users = m.mentionedJid || []
    if(users.length === 0) return conn.reply(m.chat, `*❌ Menciona a alguien*\nEj:.anotar @pepito @juana`, m)

    for(let user of users){
        sala.jugadores = sala.jugadores.filter(v => v!== user)
        sala.suplentes = sala.suplentes.filter(v => v!== user)

        if (command === 'anotar') { // SOLO ANOTAR
            if (sala.jugadores.length >= sala.icons1.length) return conn.reply(m.chat, '*⚠️ Jugadores llenos*', m)
            sala.jugadores.push(user)
            await conn.reply(m.chat, `✅ @${user.split('@')[0]} ANOTADO 🎮`, m, { mentions: [user] })
        }
        if (command === 'suplente') { // SOLO SUPLENTE
            if (sala.suplentes.length >= sala.icons2.length) return conn.reply(m.chat, '*⚠️ Suplentes llenos*', m)
            sala.suplentes.push(user)
            await conn.reply(m.chat, `✅ @${user.split('@')[0]} SUPLENTE 🌸`, m, { mentions: [user] })
        }
        if (command === 'salir') {
            await conn.reply(m.chat, `❌ @${user.split('@')[0]} salió`, m, { mentions: [user] })
        }
    }
    await actualizarLista(m.chat, conn, usedPrefix)
}

const actualizarLista = async (chat, conn, usedPrefix) => {
    let sala = vs[chat]
    let listaJug = sala.jugadores.map((v, i) => `┆⋆${sala.icons1[i]} @${v.split('@')[0]}`).join('\n')
    let listaSup = sala.suplentes.map((v, i) => `┆ ⋆${sala.icons2[i]} @${v.split('@')[0]}`).join('\n')

    for(let i = sala.jugadores.length; i < sala.icons1.length; i++){ listaJug += `\n┆⋆${sala.icons1[i]} ` }
    for(let i = sala.suplentes.length; i < sala.icons2.length; i++){ listaSup += `\n┆ ⋆${sala.icons2[i]} ` }

    const message = `ㅤ ㅤㅤ ˗ˏˋ ꒰ ♡ ꒱ ˎˊ˗
🩷⃝☁️🍭̊${sala.header}.🍭🩷⃝☁️

⁀➴
┆ *${sala.icons2[0]}MODO : ${sala.modalidad}${sala.icons2[0]}*
┆⋆.˚ּ ֶָ ${sala.horasEnPais.PE}🇵🇪${sala.horasEnPais.CL}🇨🇱🇧🇴 ${sala.horasEnPais.AR}🇦🇷
┆⋆𝗥𝗶𝘃𝗮𝗹:
${listaJug}
┆ *Suplentes:*
${listaSup}
╰────────────⁀➴

╭─「 COMO ANOTARSE 」
│ Admin: *.anotar @user1 @user2*
│ Admin: *.suplente @user*
│ Admin: *.salir @user*
╰───────────────────`;

    await conn.sendMessage(chat, { text: message, mentions: [...sala.jugadores,...sala.suplentes] })
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (/^v[46](fem|masc|mixto)?$/i.test(command)) return crear(m, {conn, args, usedPrefix, command})
    if (['anotar','suplente','salir'].includes(command)) return anotar(m, {conn, usedPrefix, command}) // BORRADO J S OUT
}

handler.command = /^(v[46](fem|masc|mixto)?|anotar|suplente|salir)$/i // BORRADO J S OUT
export default handler