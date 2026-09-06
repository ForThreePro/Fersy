const anotar = async (m, { conn, usedPrefix, command }) => {
    if (!vs[m.chat]) return conn.reply(m.chat, `*❌ No hay VS activa*\nCrea una con: ${usedPrefix}v4fem 20 pe`, m)

    let sala = vs[m.chat]
    let user = m.key.participant || m.key.remoteJid // <- CLAVE: agarra al que escribió, no al bot
    if (user === conn.user.jid) return // <- SI ES EL BOT, IGNORAR

    sala.jugadores = sala.jugadores.filter(v => v!== user)
    sala.suplentes = sala.suplentes.filter(v => v!== user)

    if (command === 'j') {
        if (sala.jugadores.length >= sala.icons1.length) return conn.reply(m.chat, '*⚠️ Jugadores llenos*', m)
        sala.jugadores.push(user)
        await conn.reply(m.chat, `✅ @${user.split('@')[0]} JUGADOR 🎮`, m, { mentions: [user] })
    }
    if (command === 's') {
        if (sala.suplentes.length >= sala.icons2.length) return conn.reply(m.chat, '*⚠️ Suplentes llenos*', m)
        sala.suplentes.push(user)
        await conn.reply(m.chat, `✅ @${user.split('@')[0]} SUPLENTE 🌸`, m, { mentions: [user] })
    }
    if (command === 'out') {
        await conn.reply(m.chat, `❌ @${user.split('@')[0]} salió`, m, { mentions: [user] })
    }

    await actualizarLista(m.chat, conn, usedPrefix)
}