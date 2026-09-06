import axios from "axios"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const D = {
    name: 'GARFIELD BOT', emoji: '🐱🍝',
    border: '╭─── 𓆩🐱𓆪 ───╮', border2: '╰─── 𓆩🍝𓆪 ───╯',
    title: '𝐆𝐀𝐑𝐅𝐈𝐄𝐋𝐃 𝐈𝐆', footer: '> "Bajando como lasaña" 😼',
    process: '🐱 DESCARGANDO', found: '🍝 LISTO', error: '😿 NO SE PUDO'
}

let handler = async (m, { conn, args, usedPrefix }) => {
    if (!args.length) return m.reply(`${D.border}\n✎ Manda el link de IG\n${D.border2}`)

    let url = args[0].split('?')[0] // <-- QUITA EL TOKEN AUTOMATICO
    if (!url.match(/instagram\.com\/(p|reel|tv)/i)) {
      return m.reply(`${D.border}\n⚠️ ➛ Link inválido\n${D.border2}`)
    }

    try {
      await m.react('🐱')
      await m.reply(`${D.border}\n⤷ ┇ ${D.process} ：✿ 。\n${D.border2}`)

      const apiUrl = `${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`
      const { data } = await axios.get(apiUrl, { timeout: 30000 })

      if (!data ||!data.status) throw data?.message || 'Stellar no respondió'
      if (!data.data?.download?.length) throw 'Stellar no encontró el video'

      const medias = data.data.download.map(media => ({
        type: media.type,
        data: { url: media.url },
        caption: `${D.border}\n${D.emoji} 𓆩 ${D.name} 𓆪 ${D.emoji}\n⤷ ┇ ${D.found}\n${D.border2}`
      }))

      if (medias.length === 1) await conn.sendMessage(m.chat, medias[0], { quoted: m })
      else await conn.sendAlbumMessage(m.chat, medias, { quoted: m })

      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      await m.reply(`${D.border}
${D.emoji} 𓆩 𝗘𝗟 ${D.name} 𓆪 ${D.emoji}

 ⤷ ┇ ${D.error} ：✿ 。

⚠️ ➛ ${e.message || e}

──愛 *TIP* ╏ ❄️
💭 ➛ Stellar está caída con proyectsV2
💭 ➛ Intenta en 5 min o usa otro link sin?stkn=

${D.border2}`)
    }
}

handler.help = ['ig']
handler.tags = ['downloader']
handler.command = /^(ig|instagram|reel)$/i
export default handler