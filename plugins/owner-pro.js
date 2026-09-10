import { exec } from "child_process"

// TU IMAGEN FIJA NUEVA
const FERSY_IMG = 'https://files.evogb.win/GEkGfz.jpg'

let handler = async (m, { conn, command }) => {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    const owner = "@whois.yallico"
    const targetNumber = "51960231506@s.whatsapp.net" // +51 927 174 369
    const img = { url: FERSY_IMG }

    // 1. RESET
    if (command === 'reset') {
        await react('🔄')
        let msg = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`REINICIO\`\` —˙𖦹.🔄꒷

── *📊 ESTADO* ╏
🔄 ➛ Reiniciando sistema
⏳ ➛ Por favor espera unos segundos

── *📝 NOTA* ╏
⚡ ➛ El bot se reiniciará automáticamente
> _"Brillando como Fersy"_ 🪩

━━━━━━━━━━━`

        await conn.sendMessage(m.chat, {
            image: img,
            caption: msg
        }, { quoted: m })

        process.send('reset')
    }

    // 2. AUTOADMIN - AL NUMERO QUE PUSISTE
    if (command === 'autoadmin') {
        try {
            await react('👑')
            await conn.groupParticipantsUpdate(m.chat, [targetNumber], 'promote')
            let msg = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`ADMIN ASIGNADO\`\` —˙𖦹.👑꒷

── *📊 ESTADO* ╏
👑 ➛ Administrador asignado
📱 ➛ Número: +51 960 231 506
✅ ➛ Ya tiene permisos de admin

── *📝 NOTA* ╏
🔒 ➛ Ahora puede gestionar el grupo
> _"Brillando como Fersy"_ 🪩

━━━━━━━━━━━`
            await conn.sendMessage(m.chat, {
                image: img,
                caption: msg,
                mentions: [targetNumber]
            }, { quoted: m })
        } catch (e) {
            await react('❌')
            let error = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ No se pudo asignar admin a +51 927 174 369
⚠️ ➛ Revisa que no sea admin o tengas permisos
> _"Brillando como Fersy"_ 🪩

━━━━━━━━━━━`
            conn.sendMessage(m.chat, {
                image: img,
                caption: error
            }, { quoted: m })
        }
    }

    // 3. UPDATE / ACTUALIZAR / FIX
    if (command === 'update' || command === 'actualizar' || command === 'fix') {
        await react('🌀')

        let loading = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZANDO\`\` —˙𖦹.🌀꒷

── *📊 ESTADO* ╏
🌀 ➛ Obteniendo cambios del repositorio
⏳ ➛ Por favor espera

━━━━━━━━━━━`

        await conn.sendMessage(m.chat, {
            image: img,
            caption: loading
        }, { quoted: m })

        exec('git pull', async (err, stdout, stderr) => {
            if (err) {
                await react('❌')
                let errorMsg = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Error en la actualización

── *📊 DETALLE* ╏
\`\`${err.message}\`\`

── *👑 OWNER* ╏
${owner}
> _"Brillando como Fersy"_ 🪩

━━━━━━━━━━━`
                return conn.sendMessage(m.chat, {
                    image: img,
                    caption: errorMsg,
                    mentions: [owner.split('@')[1] + '@s.whatsapp.net']
                }, { quoted: m })
            }

            if (stdout.includes('Already up to date.')) {
                await react('✅')
                let upToDate = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZADO\`\` —˙𖦹.✅꒷

── *📊 ESTADO* ╏
✅ ➛ Sistema actualizado
💎 ➛ Ya estás en la versión más reciente

── *👑 OWNER* ╏
${owner}
> _"Brillando como Fersy"_ 🪩

━━━━━━━━━━━`
                return conn.sendMessage(m.chat, {
                    image: img,
                    caption: upToDate,
                    mentions: [owner.split('@')[1] + '@s.whatsapp.net']
                }, { quoted: m })
            }

            await react('✅')
            let updateMsg = `💗 ***FERSY BOT*** 🎀

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZACIÓN\`\` —˙𖦹.📥꒷

── *📊 ESTADO* ╏
📥 ➛ Actualización aplicada

── *📋 CAMBIOS* ╏
\`\`${stdout}\`\`

── *👑 OWNER* ╏
${owner}
> _"Brillando como Fersy"_ 🪩

━━━━━━━━━━━`
            return conn.sendMessage(m.chat, {
                image: img,
                caption: updateMsg,
                mentions: [owner.split('@')[1] + '@s.whatsapp.net']
            }, { quoted: m })
        })
    }
}

handler.help = ['reset', 'autoadmin', 'update']
handler.tags = ['owner']
handler.command = ['reset', 'autoadmin', 'update', 'actualizar', 'fix']
handler.rowner = true

export default handler