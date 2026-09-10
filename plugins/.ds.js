import { existsSync, promises as fs } from 'fs'
import path from 'path'

var handler = async (m, { conn }) => {
    if (global.conn.user.jid !== conn.user.jid) {
        return conn.reply(m.chat, '⚠️ *Usa esto en el número principal*', m)
    }

    let rutas = [`./Sesiones/Principal/`, `./sesiones/Principal/`, `./sessions/Principal/`]
    let sessionPath = rutas.find(r => existsSync(r))

    if (!sessionPath) return m.reply('🧐 *No encontré la carpeta de sesión*')

    await m.reply(`😴 *Limpiando archivos basura de sesión...*`)

    let files = await fs.readdir(sessionPath)
    let filesDeleted = 0

    for (const file of files) {
        // SOLO BORRAR: pre-keys, sender-key, session
        if (
            file.startsWith('pre-key-') || 
            file.startsWith('sender-key') || 
            file.startsWith('session-')
        ) {
            if (!file.startsWith('creds') && !file.startsWith('app-state')) {
                await fs.unlink(path.join(sessionPath, file))
                filesDeleted++;
            }
        }
    }

    let menu = `𐔌 ꒱ ***.dsowner*** 𐔌 ꒱ 🧹

.⃟𖥔 ݁. 𖦹˙— \`\`FIX\`\` —˙𖦹.⚙️꒷

── *📝 DESCRIPCIÓN* ╏
🗑️ ➛ Elimina archivos de caché basura de la sesión
🔒 ➛ No borra \`creds\` ni \`app-state\` para que el bot no se desconecte

── *📖 USO* ╏
👑 ➛ Usar solo en el número principal del bot
🔌 ➛ El bot sigue conectado, no necesita reinicio

── *📊 RESULTADO* ╏
✅ ➛ Archivos eliminados: *${filesDeleted}*
💎 ➛ Estado: *${filesDeleted === 0 ? 'Todo limpio' : 'Limpieza completada'}*

━━━━━━━━━━━`

    await conn.sendMessage(m.chat, { text: menu }, { quoted: m })
}
handler.help = ['dsowner']
handler.tags = ['fix', 'owner']
handler.command = ['dsowner','delai','clearcache']
handler.rowner = true
export default handler