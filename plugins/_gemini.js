import fetch from 'node-fetch'
import fs from 'fs'
import * as googleTTS from 'google-tts-api'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`😼 *Ejemplo:* ${usedPrefix + command} cuéntame un chiste de lasaña`)
    
    await m.react('⏳')
    
    try {
        // 1. PEDIR RESPUESTA A GEMINI COMO GARFIELD
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text + ". Responde como Garfield: sarcástico, flojo, ama la lasaña, odia los lunes. Máximo 2 lineas")}&key=garfield-vip`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()
        
        let respuesta = aiJson.result || aiJson.data || aiJson.response || "Miau, no entendí 🐱"
        
        // 2. CONVERTIR A AUDIO CON TU MISMO TTS
        let url = googleTTS.getAudioUrl(respuesta, {
            lang: 'es',
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        })

        let tmpFilePath = path.join(tmpdir(), `garfield-${Date.now()}.opus`)

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

        // 3. ENVIAR AUDIO + TEXTO
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true // nota de voz
        }, { quoted: m })

        await m.reply(`😼 *Garfield dice:* ${respuesta}`)
        
        if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath)
        await m.react('✅')

    } catch (e) {
        console.log(e)
        await m.react('❌')
        await m.reply(`⚠️ Error: Gemini o TTS falló\nIntenta de nuevo`)
    }
}

handler.help = ['garfield <texto>']
handler.tags = ['ai']
handler.command = ['garfield', 'gato', 'habla']
handler.register = false

export default handler