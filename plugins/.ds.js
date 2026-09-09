import { existsSync, promises as fs } from 'fs'
import path from 'path'

var handler = async (m, { conn }) => {

if (global.conn.user.jid !== conn.user.jid) {
return conn.reply(m.chat, '⚠️ *Utiliza este comando directamente en el número principal del Bot*', m)
}
await conn.reply(m.chat, '😴 *Buscando carpeta de sesión...*', m)

// PRUEBA LAS 3 CARPETAS MÁS COMUNES
const rutas = [
    `./Sesiones/Principal/`,
    `./sesiones/Principal/`,
    `./sessions/Principal/`
]

let sessionPath = null
for (let ruta of rutas) {
    if (existsSync(ruta)) {
        sessionPath = ruta
        break
    }
}

if (!sessionPath) {
return await conn.reply(m.chat, '🧐 *No encontré ninguna carpeta: Sesiones/Principal, sesiones/Principal o sessions/Principal*', m)
}

await conn.reply(m.chat, `✅ *Carpeta encontrada:* ${sessionPath}\n\n*Iniciando limpieza...*`, m)

try {
let files = await fs.readdir(sessionPath)
let filesDeleted = 0

for (const file of files) {
    if (file !== 'creds.json' && !file.startsWith('creds')) {
        await fs.unlink(path.join(sessionPath, file))
        filesDeleted++;
    }
}

if (filesDeleted === 0) {
await conn.reply(m.chat, '🧐 *No había archivos para eliminar*',  m)
} else {
await conn.reply(m.chat, `😮‍💨 *Se eliminaron ${filesDeleted} archivos de sesión*`,  m)
await conn.reply(m.chat, `⭐ *¡Listo! Ahora haz .restart y escanea QR*`, m)
}

} catch (err) {
console.error('Error:', err);
await conn.reply(m.chat, '⚠️ *Ocurrió un fallo: ' + err.message + '*',  m)
}

}
handler.help = ['dsowner']
handler.tags = ['fix', 'owner']
handler.command = ['delai', 'delyaemori', 'dsowner', 'clearallsession']
handler.rowner = true

export default handler