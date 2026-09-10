import util from 'util'
import path from 'path'

let user = a => '@' + a.split('@')[0]

function handler(m, { groupMetadata, command, conn, text }) {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (!groupMetadata) {
        return m.reply(`𐔌 ꒱ ***TOP 10*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n❌ ➛ Este comando solo funciona en grupos\n━━━━━━━━━━━`)
    }

    if (!text) {
        await react('❌')
        let error = `𐔌 ꒱ ***TOP 10*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` —˙𖦹.🏆꒷

── *📖 USO* ╏
➛ top <motivo del ranking>

── *💡 EJEMPLOS* ╏
➛ top Mejores en PVP
➛ top Más activos
➛ top Más tóxicos

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    let ps = groupMetadata.participants.map(v => v.id)
    if (ps.length < 10) {
        await react('⚠️')
        return m.reply(`𐔌 ꒱ ***TOP 10*** 𐔌 ꒱ ⚠️\n\n── *📝 AVISO* ╏\n⚠️ ➛ Se necesitan mínimo 10 miembros en el grupo\n━━━━━━━━━━━`)
    }

    let a = ps.getRandom()
    let b = ps.getRandom()
    let c = ps.getRandom()
    let d = ps.getRandom()
    let e = ps.getRandom()
    let f = ps.getRandom()
    let g = ps.getRandom()
    let h = ps.getRandom()
    let i = ps.getRandom()
    let j = ps.getRandom()
    let k = Math.floor(Math.random() * 70)

    let emojis = ['🐱','🍕','💤','😼','🙄','😂','👀','🔥','🤑','💩','🥱','😎','😅','👇🏻','😔','🌚','🗿','✨','❤️']
    let x = pickRandom(emojis)

    let vn = `https://hansxd.nasihosting.com/sound/sound${k}.mp3`

    let top = `𐔌 ꒱ ***TOP 10*** 𐔌 ꒱ 🏆

.⃟𖥔 ݁. 𖦹˙— \`\`${text.toUpperCase()}\`\` —˙𖦹.${x}꒷

── *🏅 RANKING* ╏
${x} *1.* ${user(a)}
${x} *2.* ${user(b)}
${x} *3.* ${user(c)}
${x} *4.* ${user(d)}
${x} *5.* ${user(e)}
${x} *6.* ${user(f)}
${x} *7.* ${user(g)}
${x} *8.* ${user(h)}
${x} *9.* ${user(i)}
${x} *10.* ${user(j)}

── *📝 NOTA* ╏
🎲 ➛ Ranking 100% aleatorio y divertido

━━━━━━━━━━━`

    m.reply(top, null, { mentions: [a, b, c, d, e, f, g, h, i, j] })

    // Descomenta si quieres que mande audio
    // conn.sendFile(m.chat, vn, 'top.mp3', null, m, true, { type: 'audioMessage', ptt: true })
}

handler.help = ['top <texto>']
handler.tags = ['fun']
handler.command = /^(top)$/i
handler.group = true

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

Array.prototype.getRandom = function() {
    return this[Math.floor(Math.random() * this.length)]
}