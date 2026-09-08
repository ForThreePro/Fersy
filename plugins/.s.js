import fs from 'fs'

const dbPath = './libre.json'
const loadDB = () => {
    try {
        if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}')
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    } catch {
        fs.writeFileSync(dbPath, '{}')
        return {}
    }
}
const saveDB = (db) => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

const emojiType = { text: '📝', image: '🖼️', video: '🎥', audio: '🎙️', sticker: '🏷️', document: '📄' }

let handler = async (m, { conn, text, command }) => {
    let chatId = m.chat
    let db = loadDB()
    if (!db[chatId]) db[chatId] = {}

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
        // =====.set =====
        if (command === 'set') {
            let [nombre,...contenido] = (text || '').split(' ')
            nombre = nombre?.toLowerCase().replace(/[^a-z0-9_]/g, '')
            contenido = contenido.join(' ')

            if (!nombre) {
                let txt = `🐱 *𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗦𝗘𝗧 𝗩𝗜𝗣* 🐱
*━━━━━━━━━━━━━━━━━━*
*📋 COMO USAR:*

*1. Para Texto:*
.set nombre Tu texto aquí

*2. Para Media:*
Responde a imagen/video/audio/sticker/documento
.set nombre

*━━━━━━━━━━━━━━━━━━*
*💡 Ejemplos:*
.set pago Yape +51 927 174 369
Responde a imagen +.set menu
*━━━━━━━━━━*
> _Solo Admins_ | _Máx 15MB_`
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                return m.reply(txt)
            }

            if (nombre.length < 2) return m.reply('⚠️ Nombre muy corto')
            if (['set','del','listset'].includes(nombre)) return m.reply('⚠️ Nombre reservado')

            let quoted = m.quoted
            let type = 'text'
            let dataToSave = {}

            if (quoted) {
                let buf = await quoted.download().catch(() => null)
                if (!buf || buf.length < 100) return m.reply('❌ Archivo corrupto')

                if (quoted.mtype === 'imageMessage') {
                    type = 'image'
                    if (buf.length > 15*1024*1024) return m.reply('⚠️ Imagen muy pesada. Max 15MB')
                    dataToSave = { content: buf.toString('base64') }
                }
                else if (quoted.mtype === 'videoMessage') {
                    type = 'video'
                    if (buf.length > 15*1024*1024) return m.reply('⚠️ Video muy pesado. Max 15MB')
                    dataToSave = { content: buf.toString('base64') }
                }
                else if (quoted.mtype === 'audioMessage') {
                    type = 'audio'
                    if (buf.length > 10*1024*1024) return m.reply('⚠️ Audio muy pesado. Max 10MB')
                    dataToSave = { content: buf.toString('base64') }
                }
                else if (quoted.mtype === 'stickerMessage') {
                    type = 'sticker'
                    dataToSave = { content: buf.toString('base64') }
                }
                else if (quoted.mtype === 'documentMessage') {
                    type = 'document'
                    dataToSave = { content: buf.toString('base64'), fileName: quoted.msg.fileName || 'archivo' }
                } else return m.reply('❌ Tipo no soportado')

                dataToSave.caption = contenido.slice(0,1024) || ''
            } else {
                if (!contenido) return m.reply('⚠️ Falta el texto')
                if (contenido.length > 4000) return m.reply('⚠️ Texto muy largo. Max 4000')
                dataToSave = { content: contenido }
            }

            db[chatId][nombre] = { type,...dataToSave, time: Date.now() }
            saveDB(db)
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

            return m.reply(`🐱 *𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗦𝗘𝗧 𝗩𝗜𝗣* 🐱
*━━━━━━━━━━━━━━━━━━*
*✅ COMANDO CREADO EXITOSAMENTE*

*📊 DATOS:*
*➤ Comando:*.${nombre}
*➤ Tipo:* ${emojiType[type]} ${type.toUpperCase()}
*➤ Peso:* ${dataToSave.content? formatBytes(Buffer.from(dataToSave.content,'base64').length) : formatBytes(contenido.length)}
*➤ Creado:* ${new Date().toLocaleString('es-PE')}

*━━━━━━━━━━*
*Usa ahora:.${nombre}*
> _Guardado en DB Local_ 💾`)
        }

        // =====.del =====
        if (command === 'del') {
            let nombre = text?.toLowerCase().replace(/[^a-z0-9_]/g, '')
            if (!nombre ||!db[chatId][nombre]) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                return m.reply('⚠️ Ese comando no existe')
            }
            delete db[chatId][nombre]
            saveDB(db)
            await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } })
            return m.reply(`🐱 *𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗦𝗘𝗧 𝗩𝗜𝗣* 🐱\n*━━━━━━━━━━*\n*🗑️ COMANDO ELIMINADO*\n*➤ Comando:*.${nombre}\n*━━━━━━━━━━*`)
        }

        // =====.listset =====
        if (command === 'listset') {
            let lista = Object.keys(db[chatId])
            if (lista.length === 0) return m.reply('📭 *No hay comandos en este grupo*')

            let txt = `🐱 *𝗟𝗜𝗦𝗧𝗔 𝗗𝗘 𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦* 🐱
*━━━━━━━━━━*
*Total:* ${lista.length} comandos

`
            lista.forEach((v,i) => {
                txt += `${i+1}..${v} ${emojiType[db[chatId][v].type]} [${db[chatId][v].type}]\n`
            })
            txt += `*━━━━━━━━━━━━━━━━━━*
> _Usa.nombre para ejecutar_`
            await conn.sendMessage(m.chat, { react: { text: '📋', key: m.key } })
            return m.reply(txt)
        }

    } catch (e) {
        console.log('[SET VIP ERROR]', e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply('❌ Error interno del bot')
    }
}

// EJECUTOR CON DISEÑO
handler.before = async (m, { conn }) => {
    try {
        if (!m.text?.startsWith('.') || m.text.length < 2) return
        let chatId = m.chat
        let db = loadDB()
        let cmd = m.text.slice(1).split(' ')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
        let data = db[chatId]?.[cmd]
        if (!data) return

        await conn.sendMessage(m.chat, { react: { text: emojiType[data.type], key: m.key } })
        const buffer = data.content? Buffer.from(data.content,'base64') : null

        if (data.type === 'text') return await conn.reply(chatId, `*${data.content}*`, m)
        if (data.type === 'image' && buffer) await conn.sendMessage(chatId, { image: buffer, caption: `🐱 *${cmd.toUpperCase()}*\n\n${data.caption || ''}` }, { quoted: m })
        if (data.type === 'video' && buffer) await conn.sendMessage(chatId, { video: buffer, caption: `🐱 *${cmd.toUpperCase()}*\n\n${data.caption || ''}` }, { quoted: m })
        if (data.type === 'audio' && buffer) await conn.sendMessage(chatId, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })
        if (data.type === 'sticker' && buffer) await conn.sendMessage(chatId, { sticker: buffer }, { quoted: m })
        if (data.type === 'document' && buffer) await conn.sendMessage(chatId, { document: buffer, fileName: data.fileName, caption: data.caption }, { quoted: m })

    } catch (e) {
        console.log('[SET VIP BEFORE ERROR]', e)
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

handler.command = ['set', 'del', 'listset']
handler.admin = true
handler.group = true
export default handler