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

const saveDB = (db) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
    } catch (e) {
        console.log('[SET] Error al guardar:', e)
    }
}

let handler = async (m, { conn, text, command }) => {
    let chatId = m.chat
    let db = loadDB() // Cargar cada vez para evitar bug de sincronización
    if (!db[chatId]) db[chatId] = {}

    if (command === 'set') {
        let [nombre,...contenido] = (text || '').split(' ')
        nombre = nombre?.toLowerCase().replace(/[^a-z0-9_]/g, '')
        contenido = contenido.join(' ')

        if (!nombre) return m.reply('Ejemplo:\n.set pago Yape 999\nResponde a algo con.set nombre')
        if (nombre.length < 2) return m.reply('Mínimo 2 letras')
        if (['set','del','listset'].includes(nombre)) return m.reply('Nombre reservado')

        let quoted = m.quoted
        let type = 'text'
        let dataToSave = {}

        if (quoted) {
            let buf = await quoted.download().catch(() => null)
            if (!buf || buf.length < 100) return m.reply('Archivo corrupto')

            if (quoted.mtype === 'imageMessage') {
                type = 'image'
                if (buf.length > 15*1024*1024) return m.reply('Imagen muy pesada. Max 15MB')
                dataToSave = { content: buf.toString('base64') }
            }
            else if (quoted.mtype === 'videoMessage') {
                type = 'video'
                if (buf.length > 15*1024*1024) return m.reply('Video muy pesado. Max 15MB')
                dataToSave = { content: buf.toString('base64') }
            }
            else if (quoted.mtype === 'audioMessage') {
                type = 'audio'
                if (buf.length > 10*1024*1024) return m.reply('Audio muy pesado. Max 10MB')
                dataToSave = { content: buf.toString('base64') }
            }
            else if (quoted.mtype === 'stickerMessage') {
                type = 'sticker'
                dataToSave = { content: buf.toString('base64') }
            }
            else if (quoted.mtype === 'documentMessage') {
                type = 'document'
                dataToSave = { content: buf.toString('base64'), fileName: quoted.msg.fileName || 'archivo' }
            } else return m.reply('Tipo de archivo no soportado')

            dataToSave.caption = contenido.slice(0,1024) || ''
        } else {
            if (!contenido) return m.reply('Falta el texto')
            if (contenido.length > 4000) return m.reply('Texto muy largo. Max 4000')
            dataToSave = { content: contenido }
        }

        db[chatId][nombre] = { type,...dataToSave, time: Date.now() }
        saveDB(db)
        return m.reply(`✅.${nombre} [${type}] creado`)
    }

    if (command === 'del') {
        let nombre = text?.toLowerCase().replace(/[^a-z0-9_]/g, '')
        if (!nombre ||!db[chatId][nombre]) return m.reply('No existe')
        delete db[chatId][nombre]
        saveDB(db)
        return m.reply(`🗑️.${nombre} eliminado`)
    }

    if (command === 'listset') {
        let lista = Object.keys(db[chatId])
        if (lista.length === 0) return m.reply('Sin comandos')
        return m.reply('*Comandos:*\n' + lista.map(v => `.${v} [${db[chatId][v].type}]`).join('\n'))
    }
}

// EJECUTOR CON ANTI-CRASH
handler.before = async (m, { conn }) => {
    try {
        if (!m.text?.startsWith('.') || m.text.length < 2) return
        let chatId = m.chat
        let db = loadDB()
        let cmd = m.text.slice(1).split(' ')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
        let data = db[chatId]?.[cmd]
        if (!data) return

        const buffer = data.content? Buffer.from(data.content,'base64') : null

        if (data.type === 'text') return await conn.reply(chatId, data.content, m)
        if (data.type === 'image' && buffer) await conn.sendMessage(chatId, { image: buffer, caption: data.caption }, { quoted: m })
        if (data.type === 'video' && buffer) await conn.sendMessage(chatId, { video: buffer, caption: data.caption }, { quoted: m })
        if (data.type === 'audio' && buffer) await conn.sendMessage(chatId, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })
        if (data.type === 'sticker' && buffer) await conn.sendMessage(chatId, { sticker: buffer }, { quoted: m })
        if (data.type === 'document' && buffer) await conn.sendMessage(chatId, { document: buffer, fileName: data.fileName, caption: data.caption }, { quoted: m })

    } catch (e) {
        console.log('[SET BEFORE ERROR]', e) // No crashea el bot
    }
}

handler.command = ['set', 'del', 'listset']
handler.admin = true
handler.group = true
export default handler