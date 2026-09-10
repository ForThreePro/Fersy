import ytSearch from 'yt-search'

let handler = async (m, { conn, text }) => {
    let user = `@${m.sender.split('@')[0]}`
    let groupName = m.isGroup? (await conn.groupMetadata(m.chat)).subject : 'Privado'

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (!text) {
        await react('❌')
        let error = `𐔌 ꒱ ***BUSCADOR*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ ¿Qué quieres buscar?

── *💡 EJEMPLO* ╏
➛ google garfield comiendo lasaña

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    await react('🔍')
    await m.reply(`𐔌 ꒱ ***BUSCADOR*** 𐔌 ꒱ ⏳

.⃟𖥔 ݁. 𖦹˙— \`\`BUSCANDO\`\` —˙𖦹.🔍꒷

── *📊 ESTADO* ╏
🔍 ➛ Buscando: *${text}*
⏳ ➛ Obteniendo resultados...

━━━━━━━━━━━`)

    try {
        let search = await ytSearch(text)
        let results = search.videos.slice(0, 5)

        if (!results.length) {
            await react('❌')
            let vacio = `𐔌 ꒱ ***BUSCADOR*** 𐔌 ꒱ 📭

.⃟𖥔 ݁. 𖦹˙— \`\`SIN RESULTADOS\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
📭 ➛ No encontré resultados para: *${text}*

━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: vacio }, { quoted: m })
        }

        let txt = `𐔌 ꒱ ***BUSCADOR*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADOS\`\` —˙𖦹.📺꒷

── *📊 BÚSQUEDA* ╏
🔎 ➛ ${text}

${results.map((v, i) => {
            return `── *${i + 1}* ╏
📺 ➛ *${v.title}*
⏱️ ➛ Duración: *${v.timestamp}*
👁️ ➛ Vistas: *${v.views.toLocaleString()}*
👤 ➛ Canal: *${v.author.name}*
🔗 ➛ ${v.url}`
        }).join('\n\n')}

━━━━━━━━━━━
── *📋 INFORMACIÓN* ╏
👤 ➛ Solicitado por: ${user}
👥 ➛ Grupo: *${groupName}*

── *💡 TIP* ╏
➛ Usa: ytmp4 + link
➛ Usa: ytmp3 + link

━━━━━━━━━━━`

        await conn.sendMessage(m.chat, { text: txt, mentions: [m.sender] }, { quoted: m })
        await react('✅')

    } catch (e) {
        console.error(e)
        await react('❌')
        let error = `𐔌 ꒱ ***BUSCADOR*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ No se pudo realizar la búsqueda
🔧 ➛ Intenta más tarde

━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }
}

handler.help = ['google <busqueda>']
handler.tags = ['búsqueda']
handler.command = /^google$/i

export default handler