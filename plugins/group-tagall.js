const handler = async (m, { isOwner, isAdmin, conn, participants, args }) => {
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  try {
    if (!(isAdmin || isOwner)) {
      await react('❌')
      return conn.sendMessage(m.chat, {
        text: `💗 ***FERSY BOT*** 🎀\n\n── *📝 AVISO* ╏\n❌ ➛ Solo admins pueden usar este comando\n━━━━━━━━━━━`
      }, { quoted: m })
    }

    const customMessage = args.join(' ') || '📢 INVOCACIÓN GENERAL'
    const groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({ subject: 'Grupo', participants: [] }))
    const groupName = groupMetadata.subject

    // Lista de banderas por prefijo
    const countryFlags = [
      { prefijo: '502', bandera: '🇬🇹' }, { prefijo: '503', bandera: '🇸🇻' },
      { prefijo: '504', bandera: '🇭🇳' }, { prefijo: '505', bandera: '🇳🇮' },
      { prefijo: '506', bandera: '🇨🇷' }, { prefijo: '507', bandera: '🇵🇦' },
      { prefijo: '591', bandera: '🇧🇴' }, { prefijo: '592', bandera: '🇬🇾' },
      { prefijo: '593', bandera: '🇪🇨' }, { prefijo: '595', bandera: '🇵🇾' },
      { prefijo: '598', bandera: '🇺🇾' }, { prefijo: '58', bandera: '🇻🇪' },
      { prefijo: '52', bandera: '🇲🇽' }, { prefijo: '54', bandera: '🇦🇷' },
      { prefijo: '57', bandera: '🇨🇴' }, { prefijo: '51', bandera: '🇵🇪' },
      { prefijo: '56', bandera: '🇨🇱' }, { prefijo: '55', bandera: '🇧🇷' },
      { prefijo: '34', bandera: '🇪🇸' }, { prefijo: '44', bandera: '🇬🇧' },
      { prefijo: '33', bandera: '🇫🇷' }, { prefijo: '49', bandera: '🇩🇪' },
      { prefijo: '39', bandera: '🇮🇹' }, { prefijo: '81', bandera: '🇯🇵' },
      { prefijo: '82', bandera: '🇰🇷' }, { prefijo: '86', bandera: '🇨🇳' },
      { prefijo: '91', bandera: '🇮🇳' }, { prefijo: '61', bandera: '🇦🇺' },
      { prefijo: '64', bandera: '🇳🇿' }, { prefijo: '1', bandera: '🇺🇸' },
      { prefijo: '7', bandera: '🇷🇺' }, { prefijo: '63', bandera: '🇵🇭' },
      { prefijo: '95', bandera: '🇲' }
    ]

    const getCountryFlag = (mem) => {
      const rawJid = mem.jid || mem.id || ''
      const phoneNumber = rawJid.split('@')[0]
      const match3 = countryFlags.find(c => c.prefijo.length === 3 && phoneNumber.startsWith(c.prefijo))
      if (match3) return match3.bandera
      const match2 = countryFlags.find(c => c.prefijo.length === 2 && phoneNumber.startsWith(c.prefijo))
      if (match2) return match2.bandera
      const match1 = countryFlags.find(c => c.prefijo.length === 1 && phoneNumber.startsWith(c.prefijo))
      if (match1) return match1.bandera
      return '🚩'
    }

    // Agrupar participantes por bandera
    const grouped = {}
    for (const mem of participants) {
      const flag = getCountryFlag(mem)
      if (!grouped[flag]) grouped[flag] = []
      grouped[flag].push(mem)
    }

    // Ordenar las banderas según el orden definido
    const orderedFlags = countryFlags.map(c => c.bandera).concat(['🚩'])

    // TU IMAGEN NUEVA FERSY
    const catalogoImg = { url: 'https://files.evogb.win/GEkGfz.jpg' }

    let messageText = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`INVOCACIÓN GENERAL\`\` —˙𖦹.📢꒷

── *📊 INFORMACIÓN* ╏
👥 ➛ Grupo: *${groupName}*
👤 ➛ Integrantes: *${participants.length}*
💬 ➛ Mensaje: *${customMessage}*

── *🌍 MIEMBROS POR PAÍS* ╏
`

    for (const flag of orderedFlags) {
      if (grouped[flag]) {
        for (const mem of grouped[flag]) {
          const realJid = mem.jid || mem.id || ''
          const displayNumber = realJid.split('@')[0]
          messageText += `${flag} @${displayNumber}\n`
        }
      }
    }

    messageText += `
── *📝 NOTA* ╏
📢 ➛ Todos fueron mencionados
> _"Brillando como Fersy"_ 🪩

━━━━━━━━━━━`

    await conn.sendMessage(m.chat, {
      image: catalogoImg,
      caption: messageText,
      mentions: participants.map(a => a.jid || a.id)
    }, { quoted: m })

    await react('📢')

  } catch (error) {
    console.error("[ERROR EN TODOS]:", error)
    await react('❌')
    let errorMsg = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Ocurrió un error al ejecutar el comando

━━━━━━━━━━━`
    conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m })
  }
}

handler.help = ['todos <texto>']
handler.tags = ['grupos']
handler.command = /^(todos|invocar|tagall)$/i
handler.admin = true
handler.group = true

export default handler