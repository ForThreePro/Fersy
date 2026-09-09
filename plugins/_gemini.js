import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`🤖 *Ejemplo:* .ia ¿qué día es hoy?`)
    
    await m.react('⏳')
    
    try {
        // 1. GEMINI
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text)}&key=proyectsV2`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()
        let respuesta = aiJson.result || "No entendí"
        
        // 2. TTS DE STELLAR - MÁS ESTABLE
        let ttsUrl = `https://api.stellarwa.xyz/tts?text=${encodeURIComponent(respuesta)}&lang=es`
        let ttsRes = await fetch(ttsUrl)
        let audioBuffer = await ttsRes.buffer()

        // 3. ENVIAR SOLO AUDIO
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: m })
        
        await m.react('✅')

    } catch (e) {
        console.log(e)
        await m.react('❌')
        await m.reply(`⚠️ Error: ${e.message}`)
    }
}
handler.command = ['ia']
export default handler