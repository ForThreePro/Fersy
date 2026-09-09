import { existsSync, promises as fs } from 'fs'
import path from 'path'

var handler = async (m, { conn, usedPrefix }) => {

if (global.conn.user.jid !== conn.user.jid) {
return conn.reply(m.chat, '⚠️ *Utiliza este comando directamente en el número principal del Bot*', m)
}
await conn.reply(m.chat, '😴 *Iniciando proceso de eliminación de todos los archivos de sesión, excepto el archivo creds.json...*', m)

// FIX 1: Poner "sessions" entre comillas
let sessionPath = `./sessions/Principal/`

try {

if (!existsSync(sessionPath)) {
return await conn.reply(m.chat, '🧐 *La carpeta no existe o está vacía*', m)
}

let files = await fs.readdir(sessionPath)
let filesDeleted = 0

for (const file of files) {
    // FIX 2: Proteger creds.json y cualquier .json importante
    if (file !== 'creds.json' && !file.startsWith('creds') && file !== 'apikey.json') {
        await fs.unlink(path.join(sessionPath, file))
        filesDeleted++;
    }
}

if (filesDeleted === 0) {
await conn.reply(m.chat, '🧐 *No había archivos para eliminar*',  m)
} else {
await conn.reply(m.chat, `😮‍💨 *Se eliminaron ${filesDeleted} archivos de sesión, excepto creds.json*`,  m)
// FIX 3: Esperar a que se envíe antes de reiniciar
await conn.reply(m.chat, `⭐ *¡Listo! Reinicia el bot con .restart para aplicar los cambios*`, m)
}

} catch (err) {
console.error('Error al leer la carpeta o los archivos de sesión:', err);
await conn.reply(m.chat, '⚠️ *Ocurrió un fallo: ' + err.message + '*',  m)
}

}
handler.help = ['dsowner']
handler.tags = ['fix', 'owner']
handler.command = ['delai', 'delyaemori', 'dsowner', 'clearallsession']
handler.rowner = true

export default handler