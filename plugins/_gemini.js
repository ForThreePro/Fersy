import fetch from 'node-fetch'
import fs from 'fs'
import * as googleTTS from 'google-tts-api'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🤖 *Ejemplo:* ${usedPrefix + command} ¿qué día es hoy?`)
    
    await m.react('⏳')
    
    try {
        // 1. PEDIR RESPUESTA A GEMINI SIN LÍMITE
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text + ". Responde de forma normal, clara y amable. Puedes responder largo si es necesario")}&key=garfield-vip`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()
        
        let respuesta = aiJson.result || aiJson.data || aiJson.response || "No pude entender eso"
        
        // Si la respuesta es muy larga, Google TTS la corta. La dividimos
        if (respuesta.length > 500) {
            respuesta = respuesta.substring(0, 500) + "..."
        }
        
        // 2. CONVERTIR A AUDIO
        let url = googleTTS.getAudioUrl(respuesta, {
            lang: 'es',
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        })

        let tmpFilePath = path.join(tmpdir(), `ia-${Date.now()}.opus`)

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

        // 3. ENVIAR SOLO AUDIO
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

handler.help = ['ia <texto>', 'bot <texto>']
handler.tags = ['ai']
handler.command = ['ia', 'bot', 'voz']
handler.register = false

export default handler