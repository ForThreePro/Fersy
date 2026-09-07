let handler = async (m, { conn }) => {
    let user = m.sender
    let nombre = conn.getName(user)
    let groupName = await conn.getName(m.chat)

    if (!m.isGroup) return m.reply('❌ *Garfield Bot:* Este comando solo funciona en grupos')

    // SOLO TU NUMERO PUEDE USARLO
    let miNumero = '51927174369@s.whatsapp.net' // <- TU NUMERO
    if (user!== miNumero) return m.reply('❌ *Garfield Bot:* Este comando es exclusivo del dueño')

    // AGARRA TU FOTO DE PERFIL
    let pp
    try {
        pp = await conn.profilePictureUrl(user, 'image')
    } catch {
        pp = 'https://files.evogb.win/E2yVdA.jpg' // foto por si no tienes
    }

    let texto = `👋 *GRACIAS POR LA CONFIANZA* 👋\n\n` +
                `*${nombre}* se despide de: *${groupName}*\n\n` +
                `*Garfield Bot 3.0 PREM* agradece:\n` +
                `✨ La confianza depositada en nuestro servicio\n` +
                `✨ Cada momento compartido en este grupo\n` +
                `✨ Por elegirnos como su Bot #1 de WhatsApp 2026\n` +
                `Me llevo los mejores recuerdos 🍕\n` +
                `Si necesitan volver a contar conmigo, aquí estaré.\n\n` +
                `*Soporte 24/7:* +51 927 174 369\n` +
                `*Atentamente: Garfield Bot* 🙏`

    // MANDA TU FOTO + TEXTO
    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: texto,
        mentions: [user]
    })

    // Espera 3 seg y saca al usuario aunque sea admin
    setTimeout(async () => {
        await conn.groupParticipantsUpdate(m.chat, [user], "remove")
    }, 3000)

}
handler.help = ['salir']
handler.tags = ['venta']
handler.command = /^salir$/i
handler.group = true
handler.botAdmin = true // el bot debe ser admin

export default handler