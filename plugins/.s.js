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
                let menu = `𐔌 ꒱ ***.set*** 𐔌 ꒱ 📌

.⃟𖥔 ݁. 𖦹˙— \`\`HERRAMIENTA\`\` —˙𖦹.💾꒷

── *📝 DESCRIPCIÓN* ╏
💾 ➛ Guarda textos, imágenes, videos, audios y stickers
💾 ➛ Para usarlos después con.nombre

── *📖 USO* ╏
1️⃣ ➛ *Texto:*.set nombre Tu texto aquí
2️⃣ ➛ *Media:* Responde a una imagen/video/etc.set nombre

── *💡 EJEMPLOS* ╏
📌 ➛.set pago Yape +51 927 174 369
📌 ➛ Responde a imagen +.set menu

── *⚠️ NOTAS* ╏
🔒 ➛ Solo admins
📦 ➛ Máx: Imagen/Video 15MB | Audio 10MB | Texto 4000 chars

━━━━━━━━━━━`
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(m.chat, { text: menu }, { quoted: m })
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

            let size = dataToSave.content? formatBytes(Buffer.from(dataToSave.content,'base64').length) : formatBytes(contenido.length)
            let menuOk = `𐔌 ꒱ ***.set*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`CREADO\`\` —˙𖦹.💎꒷

── *📊 DATOS* ╏
📌 ➛ Comando: *.*${nombre}
${emojiType[type]} ➛ Tipo: *${type.toUpperCase()}*
📦 ➛ Peso: *${size}*
📅 ➛ Creado: *${new Date().toLocaleString('es-PE')}*

── *📖 USAR* ╏
➛ Ahora usa: *.*${nombre}

━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: menuOk }, { quoted: m })
        }

        // =====.del =====
        if (command === 'del') {
            let nombre = text?.toLowerCase().replace(/[^a-z0-9_]/g, '')
            if (!nombre ||!db[chatId][nombre]) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                let menuDel = `𐔌 ꒱ ***.del*** 𐔌 ꒱ 🗑️

.⃟𖥔 ݁. 𖦹˙— \`\`HERRAMIENTA\`\` —˙𖦹.❌꒷

── *📝 DESCRIPCIÓN* ╏
🗑️ ➛ Elimina un comando guardado

── *📖 USO* ╏
➛.del nombre

── *📊 RESULTADO* ╏
❌ ➛ Ese comando no existe

━━━━━━━━━━━`
                return conn.sendMessage(m.chat, { text: menuDel }, { quoted: m })
            }
            delete db[chatId][nombre]
            saveDB(db)
            await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } })
            let menuDelOk = `𐔌 ꒱ ***.del*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`ELIMINADO\`\` —˙𖦹.🗑️꒷

── *📊 RESULTADO* ╏
🗑️ ➛ Comando eliminado: *.*${nombre}

━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: menuDelOk }, { quoted: m })
        }

        // =====.listset =====
        if (command === 'listset') {
            let lista = Object.keys(db[chatId])
            if (lista.length === 0) {
                let menuVacio = `𐔌 ꒱ ***.listset*** 𐔌 ꒱ 📭

.⃟𖥔 ݁. 𖦹˙— \`\`LISTA\`\` —˙𖦹.📋꒷

── *📊 RESULTADO* ╏
📭 ➛ No hay comandos guardados en este grupo

━━━━━━━━━━━`
                return conn.sendMessage(m.chat, { text: menuVacio }, { quoted: m })
            }

            let txt = `𐔌 ꒱ ***.listset*** 𐔌 ꒱ 📋

.⃟𖥔 ݁. 𖦹˙— \`\`LISTA\`\` —˙𖦹.📋꒷

── *📊 TOTAL* ╏
📦 ➛ ${lista.length} comandos guardados

── *📜 COMANDOS* ╏\n`
            lista.forEach((v,i) => {
                txt += `${i+1} ➛.*${v}* ${emojiType[db[chatId][v].type]} [${db[chatId][v].type}]\n`
            })
            txt += `
── *📖 USO* ╏
➛ Usa.*nombre* para ejecutar

━━━━━━━━━━━`
            await conn.sendMessage(m.chat, { react: { text: '📋', key: m.key } })
            return conn.sendMessage(m.chat, { text: txt }, { quoted: m })
        }

    } catch (e) {
        console.log('[SET ERROR]', e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply('❌ Error interno del bot')
    }
}

// EJECUTOR
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
        if (data.type === 'image' && buffer) await conn.sendMessage(chatId, { image: buffer, caption: `📌 *${cmd.toUpperCase()}*\n\n${data.caption || ''}` }, { quoted: m })
        if (data.type === 'video' && buffer) await conn.sendMessage(chatId, { video: buffer, caption: `📌 *${cmd.toUpperCase()}*\n\n${data.caption || ''}` }, { quoted: m })
        if (data.type === 'audio' && buffer) await conn.sendMessage(chatId, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })
        if (data.type === 'sticker' && buffer) await conn.sendMessage(chatId, { sticker: buffer }, { quoted: m })
        if (data.type === 'document' && buffer) await conn.sendMessage(chatId, { document: buffer, fileName: data.fileName, caption: data.caption }, { quoted: m })

    } catch (e) {
        console.log('[SET BEFORE ERROR]', e)
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