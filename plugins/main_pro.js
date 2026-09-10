import fs from 'fs'
import os from 'os'
import * as googleTTS from 'google-tts-api'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, command, text, usedPrefix }) => {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    // OWNER
    if (command === 'owner' || command === 'creator') {
        let owner = '51927174369@s.whatsapp.net'
        let texto = `𐔌 ꒱ ***OWNER*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`INFORMACIÓN\`\` —˙𖦹.👑꒷

── *📊 CONTACTO* ╏
👑 ➛ Owner: @${owner.split('@')[0]}
📱 ➛ Número: +51 927 174 369

── *📝 NOTA* ╏
💬 ➛ Contacta solo para cosas importantes

━━━━━━━━━━━`
        await react('✅')
        return conn.sendMessage(m.chat, { text: texto, mentions: [owner] }, { quoted: m })
    }

    // PING
    if (command === 'ping' || command === 'p') {
        let start = new Date * 1
        await conn.reply(m.chat, `𐔌 ꒱ ***PING*** 𐔌 ꒱ ⏳\n\n── *📊 ESTADO* ╏\n⏳ ➛ Calculando...`, m)
        let end = new Date * 1
        let speed = end - start
        let texto = `𐔌 ꒱ ***PING*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`VELOCIDAD\`\` —˙𖦹.📡꒷

── *📊 ESTADÍSTICAS* ╏
📡 ➛ Velocidad: ${speed}ms
✅ ➛ Estado: Activo

── *📝 NOTA* ╏
🌐 ➛ Servidor estable

━━━━━━━━━━━`
        await react('✅')
        return conn.sendMessage(m.chat, { text: texto }, { quoted: m })
    }

    if (command === 'cleartmp') {
        const tmpPath = './tmp'
        if (fs.existsSync(tmpPath)) {
            fs.readdirSync(tmpPath).forEach(file => fs.unlinkSync(`${tmpPath}/${file}`))
        }
        let texto = `𐔌 ꒱ ***LIMPIEZA*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`CACHE\`\` —˙𖦹.🗑️꒷

── *📊 RESULTADO* ╏
🗑️ ➛ Caché temporal eliminado
💾 ➛ Memoria liberada con éxito

── *📝 NOTA* ╏
✅ ➛ El bot está más ligero

━━━━━━━━━━━`
        await react('✅')
        return m.reply(texto)
    }

    if (command === 'cpu') {
        let cpu = os.loadavg()[0].toFixed(2)
        let texto = `𐔌 ꒱ ***CPU*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESADOR\`\` —˙𖦹.💻꒷

── *📊 ESTADÍSTICAS* ╏
💻 ➛ Carga CPU: ${cpu}%

── *📝 NOTA* ╏
⚠️ ➛ Si supera 90% el bot va lento

━━━━━━━━━━━`
        await react('✅')
        return m.reply(texto)
    }

    if (command === 'ram') {
        const used = process.memoryUsage()
        let ram = (used.heapUsed / 1024 / 1024).toFixed(2)
        let texto = `𐔌 ꒱ ***RAM*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`MEMORIA\`\` —˙𖦹.💾꒷

── *📊 ESTADÍSTICAS* ╏
💾 ➛ Consumo RAM: ${ram} MB

── *📝 NOTA* ╏
📊 ➛ Memoria usada por el proceso

━━━━━━━━━━━`
        await react('✅')
        return m.reply(texto)
    }

    if (command === 'uptime') {
        let _uptime = process.uptime() * 1000
        let uptime = clockString(_uptime)
        let texto = `𐔌 ꒱ ***UPTIME*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`TIEMPO ACTIVO\`\` —˙𖦹.⏱️꒷

── *📊 ESTADÍSTICAS* ╏
⏱️ ➛ Tiempo activo: ${uptime}

── *📝 NOTA* ╏
🔄 ➛ Desde que se inició el bot

━━━━━━━━━━━`
        await react('✅')
        return m.reply(texto)
    }

    if (command === 'info') {
        let _muptime = process.uptime() * 1000
        let muptime = clockString(_muptime)
        const used = process.memoryUsage()
        let cpu = os.loadavg()[0].toFixed(2)
        let ram = (used.heapUsed / 1024 / 1024).toFixed(2)

        let texto = `𐔌 ꒱ ***INFO DEL SISTEMA*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`REPORTE COMPLETO\`\` —˙𖦹.📊꒷

── *📊 ESTADÍSTICAS* ╏
⏱️ ➛ Uptime: ${muptime}
💾 ➛ Memoria RAM: ${ram} MB
💻 ➛ Carga CPU: ${cpu}%

── *📝 DETALLES* ╏
👑 ➛ Desarrollado por: Sebastián Barboza
✅ ➛ Estado: Operativo

━━━━━━━━━━━`
        await react('✅')
        return m.reply(texto)
    }

    if (command === 'tts' || command === 'gtts' || command === 'ttss') {
        let q = m.quoted? m.quoted : m
        let txt = text || q.text || q.caption || q.body || ''

        if (!txt) {
            await react('❌')
            let texto = `𐔌 ꒱ ***TTS*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📖 USO* ╏
➛ Escribe el texto que deseas convertir
➛ O responde a un mensaje

── *💡 EJEMPLO* ╏
➛ ${usedPrefix}tts Hola, ¿cómo estás?

━━━━━━━━━━━`
            return m.reply(texto)
        }

        await react('🎙️')

        let lang = 'es'
        let url = googleTTS.getAudioUrl(txt, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        })

        let tmpFilePath = path.join(tmpdir(), `tts-${Date.now()}.opus`)

        await new Promise((resolve, reject) => {
            ffmpeg(url)
        .audioCodec('libopus')
        .toFormat('opus')
        .outputOptions([
                    '-avoid_negative_ts make_zero',
                    '-ac 1',
                    '-b:a 64k'
                ])
        .on('end', () => resolve(true))
        .on('error', (err) => reject(err))
        .save(tmpFilePath)
        })

        let audioBuffer = fs.readFileSync(tmpFilePath)

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: m })

        if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath)
        await react('✅')
    }
}

function clockString(ms) {
    let d = Math.floor(ms / 86400000)
    let h = Math.floor(ms / 3600000) % 24
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return `${d}d ${h}h ${m}m ${s}s`
}

handler.help = ['owner', 'ping', 'cleartmp', 'cpu', 'ram', 'uptime', 'info', 'tts <texto>']
handler.tags = ['main', 'tools', 'info']
handler.command = /^(owner|creator|ping|p|cleartmp|cpu|ram|uptime|info|g?tts|ttss)$/i
handler.rowner = false

export default handler