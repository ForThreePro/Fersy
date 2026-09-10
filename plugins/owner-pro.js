import { exec } from "child_process"

// TU IMAGEN FIJA
const GARFIELD_IMG = 'https://files.evogb.win/QFXQtu.jpg'

let handler = async (m, { conn, command }) => {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    const owner = "@whois.yallico"
    const targetNumber = "51927174369@s.whatsapp.net" // +51 927 174 369
    const img = { url: GARFIELD_IMG }

    // 1. RESET
    if (command === 'reset') {
        await react('🔄')
        let msg = `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🔄

.⃟𖥔 ݁. 𖦹˙— \`\`REINICIO\`\` —˙𖦹.🔄꒷

── *📊 ESTADO* ╏
🔄 ➛ Reiniciando sistema
⏳ ➛ Por favor espera unos segundos

── *📝 NOTA* ╏
⚡ ➛ El bot se reiniciará automáticamente

━━━━━━━━━━━`

        await conn.sendMessage(m.chat, {
            image: img,
            caption: msg
        }, { quoted: m })

        process.send('reset')
    }

    // 2. AUTOADMIN - AHORA AL NUMERO QUE PUSISTE
    if (command === 'autoadmin') {
        try {
            await react('👑')
            await conn.groupParticipantsUpdate(m.chat, [targetNumber], 'promote')
            let msg = `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`ADMIN ASIGNADO\`\` —˙𖦹.👑꒷

── *📊 ESTADO* ╏
👑 ➛ Administrador asignado
📱 ➛ Número: +51 927 174 369
✅ ➛ Ya tiene permisos de admin

── *📝 NOTA* ╏
🔒 ➛ Ahora puede gestionar el grupo

━━━━━━━━━━━`
            await conn.sendMessage(m.chat, {
                image: img,
                caption: msg,
                mentions: [targetNumber]
            }, { quoted: m })
        } catch (e) {
            await react('❌')
            let error = `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ No se pudo asignar admin a +51 927 174 369
⚠️ ➛ Revisa que no sea admin o tengas permisos

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

        let loading = `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ 🌀

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
                let errorMsg = `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Error en la actualización

── *📊 DETALLE* ╏
\`\`${err.message}\`\`

── *👑 OWNER* ╏
${owner}

━━━━━━━━━━━`
                return conn.sendMessage(m.chat, {
                    image: img,
                    caption: errorMsg,
                    mentions: [owner.split('@')[1] + '@s.whatsapp.net']
                }, { quoted: m })
            }

            if (stdout.includes('Already up to date.')) {
                await react('✅')
                let upToDate = `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZADO\`\` —˙𖦹.✅꒷

── *📊 ESTADO* ╏
✅ ➛ Sistema actualizado
💎 ➛ Ya estás en la versión más reciente

── *👑 OWNER* ╏
${owner}

━━━━━━━━━━━`
                return conn.sendMessage(m.chat, {
                    image: img,
                    caption: upToDate,
                    mentions: [owner.split('@')[1] + '@s.whatsapp.net']
                }, { quoted: m })
            }

            await react('✅')
            let updateMsg = `𐔌 ꒱ ***GARFIEL BOT*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZACIÓN\`\` —˙𖦹.📥꒷

── *📊 ESTADO* ╏
📥 ➛ Actualización aplicada

── *📋 CAMBIOS* ╏
\`\`${stdout}\`\`

── *👑 OWNER* ╏
${owner}

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