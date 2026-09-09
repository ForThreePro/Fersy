import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`🤖 *Ejemplo:* .ia ¿qué día es hoy?`)
    
    await m.react('⏳')
    
    try {
        // 1. PEDIR RESPUESTA A GEMINI
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text + ". Responde corto, máximo 3 lineas")}&key=proyectsV2`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()
        let respuesta = aiJson.result || aiJson.data || "No entendí"
        
        // 2. CONVERTIR A VOZ CON API DE STELLAR
        let ttsUrl = `https://api.stellarwa.xyz/tts?text=${encodeURIComponent(respuesta)}&lang=es`
        let ttsRes = await fetch(ttsUrl)
        let audioBuffer = await ttsRes.buffer()

        // 3. ENVIAR SOLO AUDIO - FORMATO MP3
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg', // MP3 en vez de opus
            ptt: true // nota de voz
        }, { quoted: m })
        
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