let handler = async (m, { conn, command, text, participants }) => {

    let who = m.mentionedJid[0] || m.quoted?.sender || (conn.parseMention(text)[0]) || (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    if (who === '@s.whatsapp.net' ||!who) who = null

    let necesitaPersona = ['chisme','rumor','tentacion','caleta','chonguear'].includes(command)

    if (necesitaPersona &&!who) return m.reply(`❌ *Error 404* ❌\nTienes que:\n1. *Tocar @*\n2. *Responder* +.comando\n3..comando 519123456`)

    let user = `@${m.sender.split('@')[0]}`
    let target = who? `@${who.split('@')[0]}` : user

    const juegos = {
        chisme: [
            `📢 OEEE ${user} cuenta el chisme: ${target} se quedó sin saldo y pidió wifi prestado`,
            `🫢 ${user} dice que ${target} llora viendo "Al Fondo Hay Sitio"`,
            `👀 ${user} filtró que ${target} come pan con gaseosa Inca Kola`,
            `📻 Radio Chisme: ${user} vio a ${target} en el micro sin mascarilla`,
            `📝 ${user} cuenta que ${target} usa medias con sandalias. ASCO`,
            `🗣️ ${user} dice que ${target} se baña con agua fría pa ahorrar`,
            `🔥 ${user} quemó a ${target}: Le debe 5 soles a medio grupo`,
            `📱 ${user} chismeó que ${target} tiene 2 celulares. Uno pa la flaca`,
            `🚨 ${user} reveló que ${target} se mete al micro con su taper`,
            `😱 ${user} dice que ${target} habla solo en el baño`,
            `🤫 ${user} cuenta que ${target} colecciona tapitas de gaseosa`,
            `📢 ${user} funó a ${target}: Usa "xq" en vez de "porque"`,
            `🫣 ${user} dice que ${target} ve novelas turcas escondidas`,
            `💬 ${user} tiró la bomba: ${target} se quedó dormido en clase`,
            `📣 ${user} cuenta que ${target} pide "yapa" hasta en la bodega`,
            `😂 ${user} dice que ${target} dice "ya pe" cada 3 segundos`,
            `📰 Chisme del día: ${user} vio a ${target} corriendo pa agarrar micro`,
            `☕ ${user} tomó desayuno con ${target} y se enteró de todo`
        ],
        rumor: [
            `📰 RUMOR: ${user} dice que ${target} se va a casar con su ex`,
            `🔍 ${user} escuchó que ${target} ganó la lotería y no dijo nada`,
            `👂 ${user} jura que ${target} es hijo de alguien pituco`,
            `📢 Se dice que ${user} vio a ${target} saliendo del hotel`,
            `🤫 Corre el rumor que ${user} cachó a ${target} copiando en el cole`,
            `📱 ${user} dice que ${target} tiene Only... de recetas`,
            `🫢 ${user} comentó que ${target} habla 3 idiomas. Mentira`,
            `🚨 OJO: ${user} dice que ${target} se ganó una beca trucha`,
            `💬 ${user} soltó que ${target} es familiar de un alcalde`,
            `📣 ${user} rumoró que ${target} vende cosas por marketplace`,
            `👀 ${user} dice que ${target} se fue de viaje y mintió`,
            `🔥 ${user} contó que ${target} peleó en la calle`,
            `🗣️ ${user} dice que ${target} tiene plata pero vive como pobre`,
            `📝 ${user} escuchó que ${target} canta en la ducha reggaetón`,
            `😱 ${user} dice que ${target} se mete a robar wifi`,
            `☕ ${user} chismeó que ${target} toma emoliente todos los días`,
            `📻 ${user} afirmó que ${target} se sabe todo el himno`,
            `💣 ÚLTIMO MINUTO: ${user} dice que ${target} es tu crush`
        ],
        tentacion: [
            `😈 ${user} tienta a ${target}: Oe vamos a florear, yo invito`,
            `🍺 ${user} a ${target}: Una chela no hace daño... o sí?`,
            `🌙 ${user} a ${target}: Salgamos a las 12, nadie se entera`,
            `💸 ${user} a ${target}: Gasta esa plata, mañana trabajas`,
            `📱 ${user} a ${target}: Manda foto nomás, confía en mí`,
            `🎮 ${user} a ${target}: Falta 1 pa rankear, déjate de vago`,
            `🍗 ${user} a ${target}: Come ese pollo a la brasa, estás flaco`,
            `😏 ${user} a ${target}: Dile que no a tu flaco/a y vente conmigo`,
            `🚗 ${user} a ${target}: Sube, te llevo... a donde quieras`,
            `💊 ${user} a ${target}: Prueba esto, es "vitamina"`,
            `🎰 ${user} a ${target}: Mete 10 soles, capaz ganas`,
            `📸 ${user} a ${target}: Tómate una selfie atrevida pues`,
            `🏠 ${user} a ${target}: En mi jato no hay nadie`,
            `💌 ${user} a ${target}: Escríbele a tu ex, que puede pasar`,
            `🍰 ${user} a ${target}: Un pedacito más de torta no engorda`,
            `😈 ${user} a ${target}: Pídele aumento al jefe, qué pierdes`,
            `🌃 ${user} a ${target}: Vámonos de joda al centro`,
            `🔥 ${user} a ${target}: Hazlo, vive la vida loca pe causa`
        ],
        caleta: [
            `🫣 ${user} cachó a ${target} haciendo algo caleta\nShhh nadie sabe`,
            `🤫 ${user} dice que ${target} tiene su chat caleta`,
            `👀 ${user} vio a ${target} saliendo caleta del jato`,
            `📱 ${user} encontró el insta caleta de ${target}`,
            `😏 ${user} sabe el secreto caleta de ${target}\nNo diré nada... o sí?`,
            `🚨 ${user} descubrió que ${target} tiene 2 vidas`,
            `🔍 ${user} stalkeó caleta a ${target} toda la noche`,
            `💬 ${user} guarda el secreto caleta de ${target}`,
            `📰 ${user} filtró lo caleta de ${target}\nSe armó`,
            `🎭 ${user} dice que ${target} es doble cara`,
            `👂 ${user} escuchó caleta a ${target} hablando solo`,
            `📸 ${user} tiene pruebas caletas de ${target}`,
            `😈 ${user} y ${target} tienen un plan caleta`,
            `🌙 ${user} vio a ${target} en la calle a las 3am caleta`,
            `💸 ${user} sabe que ${target} cobra caleta`,
            `🍺 ${user} cachó a ${target} tomando caleta`,
            `❤️ ${user} sabe que ${target} tiene crush caleta`,
            `📦 ${user} abrió el paquete caleta de ${target}`
        ],
        chonguear: [
            `🎉 ${user} sacó a ${target} a chonguear al centro`,
            `🍻 ${user} invita a ${target} a tomar unas chelas`,
            `💃 ${user} + ${target} = juerga hasta las 6am`,
            `🌃 ${user} dice: ${target} vámonos de farra pe`,
            `🔥 ${user} prendió la fiesta con ${target}`,
            `🎵 ${user} pone huayno y saca a bailar a ${target}`,
            `🚕 ${user} pide taxi pa irse de chongo con ${target}`,
            `😵 ${user} dejó borracho a ${target} chongueando`,
            `🏠 ${user} hace previa en su jato con ${target}`,
            `📢 ${user} grita: Hoy chongueamos con ${target}!`,
            `💰 ${user} gastó todo chongueando con ${target}`,
            `🎊 ${user} armó juerga y invitó a ${target}`,
            `🍗 ${user} y ${target} terminaron comiendo pollería a las 4am`,
            `😂 ${user} se rió toda la noche chongueando con ${target}`,
            `📱 ${user} subió historias chongueando con ${target}`,
            `🤪 ${user} + ${target} = descontrol total`,
            `🌅 ${user} amaneció chongueando con ${target}`,
            `💀 ${user} dice que ${target} no aguanta ni 2 chelas`
        ]
    }

    if (!juegos[command]) return

    let res = juegos[command][Math.floor(Math.random() * juegos[command].length)]
    await conn.reply(m.chat, res, m, { mentions: [who, m.sender] })
    await conn.sendMessage(m.chat, { react: { text: '🇵🇪', key: m.key } })
}

handler.help = [
'chisme @ | rumor @',
'tentacion @ | caleta @ | chonguear @'
]
handler.tags = ['fun']
handler.command = ['chisme','rumor','tentacion','caleta','chonguear']
handler.group = true

export default handler