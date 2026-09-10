import fs from 'fs'
let db = './src/database/lista.json'

if (!fs.existsSync('./src/database')) fs.mkdirSync('./src/database', { recursive: true })
if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

let handler = async (m, { conn }) => {
    let data = JSON.parse(fs.readFileSync(db))
    let total = data.length

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (total === 0) {
        await react('📭')
        let vacia = `𐔌 ꒱ ***BORRAR LISTA*** 𐔌 ꒱ 📭

.⃟𖥔 ݁. 𖦹˙— \`\`LISTA VACÍA\`\` —˙𖦹.🗑️꒷

── *📝 AVISO* ╏
📭 ➛ La lista ya está vacía
📭 ➛ No hay registros para borrar

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: vacia }, { quoted: m })
    }

    await react('🗑️')
    fs.writeFileSync(db, JSON.stringify([]))

    let hora = new Date().toLocaleTimeString('es-PE', {timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit'})
    let texto = `𐔌 ꒱ ***BORRAR LISTA*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`BORRADO EXITOSO\`\` —˙𖦹.🗑️꒷

── *📊 INFORMACIÓN* ╏
🗑️ ➛ Se eliminaron: *${total}* registro${total > 1 ? 's' : ''}
📅 ➛ Rango: *Lunes a Sábado*
⏰ ➛ Hora: *${hora}*

── *📦 ESTADO* ╏
✅ ➛ Lista reiniciada correctamente

━━━━━━━━━━━`

    return conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}

handler.help = ['borrarlista']
handler.tags = ['grupo']
handler.command = /^(borrarlista)$/i
handler.group = true
handler.admin = true
export default handler