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
    // REGLA DE ORO: SOLO BORRAR ESTOS 3 TIPOS DE BASURA
    // 1. No tocar nada que empiece con creds
    // 2. No tocar app-state
    // 3. Solo borrar pre-keys, sessions, y archivos viejos
    if (
        file.startsWith('pre-key-') || 
        file.startsWith('sender-key') || 
        file.startsWith('session-') ||
        file.startsWith('app-state-sync-key') === false && file.includes('app-state') // por si acaso
    ) {
        if (!file.startsWith('creds') && !file.startsWith('app-state')) {
            await fs.unlink(path.join(sessionPath, file))
            filesDeleted++;
        }
    }
}

if (filesDeleted === 0) {
await m.reply(`🧐 *No había basura que limpiar. Todo limpio*`)
} else {
await m.reply(`😮‍💨 *Se eliminaron ${filesDeleted} archivos de caché*\n\n*✅ Listo. El bot sigue conectado y no necesita reinicio*`)
}

}
handler.help = ['dsowner']
handler.tags = ['fix', 'owner']
handler.command = ['dsowner','delai','clearcache']
handler.rowner = true
export default handler