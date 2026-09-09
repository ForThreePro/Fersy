import fs from 'fs'
import * as googleTTS from 'google-tts-api'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        await m.reply(`🤖 *IA PERUANA*\n\n*Ejemplo:* ${usedPrefix}ia ¿qué tal causa?`)
        return
    }

    await m.react('⏳')

    try {
        // 1. PEDIR RESPUESTA A GEMINI BIEN PERUANO
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text + ". Responde de forma normal, clara, profesional y amable. Sin jerga. Máximo 2 líneas")}&key=proyectsV2`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()

        let respuesta = aiJson.result || aiJson.data || aiJson.response || "No te entendí pe causa"

        if(respuesta.length > 200) respuesta = respuesta.substring(0, 200) + "..."

        // 2. CONVERTIR A AUDIO - SUENA MÁS GRAVE CON ES
        let url = googleTTS.getAudioUrl(respuesta, {
            lang: 'es', // español latino suena más de hombre
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        })

        let tmpFilePath = path.join(tmpdir(), `ia-pe-${Date.now()}.opus`)

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
        await m.react('✅')

    } catch (e) {
        console.log(e)
        await m.react('❌')
        await m.reply(`⚠️ Error: ${e.message}`)
    }
}

handler.help = ['ia <texto>']
handler.tags = ['ai']
handler.command = ['ia', 'bot', 'voz']
handler.register = false

export default handler