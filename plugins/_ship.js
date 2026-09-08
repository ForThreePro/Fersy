import fetch from 'node-fetch'
import { uploadImage } from '../lib/uploadImage.js' // si tienes esto

let handler = async (m, { conn, participants }) => {
    if (!m.isGroup) return m.reply('🐱 Solo en grupos')

    let members = participants.map(u => u.id)
    let user1 = members[Math.floor(Math.random() * members.length)]
    let user2 = members[Math.floor(Math.random() * members.length)]
    while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)]

    await m.reply(`💘 *CALCULANDO SHIP...* 💘\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}`, null, { mentions: [user1, user2] })

    try {
        let defaultImg = 'https://i.imgur.com/1tMFa32.png'
        let pp1 = await conn.profilePictureUrl(user1, 'image').catch(_ => defaultImg)
        let pp2 = await conn.profilePictureUrl(user2, 'image').catch(_ => defaultImg)
        
        // Subir a telegra para que Stellar lo acepte
        let avatar1 = await uploadImage(await (await fetch(pp1)).buffer())
        let avatar2 = await uploadImage(await (await fetch(pp2)).buffer())
        let background = 'https://i.imgur.com/jm5Yl1r.png'

        let url = `https://api.stellarwa.xyz/generate/ship?avatar1=${avatar1}&avatar2=${avatar2}&background=${background}&key=proyectsV2`
        
        let res = await fetch(url)
        if(!res.ok) throw await res.text()
        let buffer = await res.buffer()

        let porcentaje = Math.floor(Math.random() * 101)
        let texto = porcentaje < 30 ? '💔 Frio frio...' : porcentaje < 60 ? '💛 Podría funcionar' : porcentaje < 80 ? '❤️ Tienen química' : '💖 BODA A LA VISTA!!'

        await conn.sendFile(m.chat, buffer, 'ship.png', `🐱 *GARFIELD SHIP* 🐱\n\n@${user1.split('@')[0]} + @${user2.split('@')[0]}\n\n*${porcentaje}%* ${texto}`, m, { mentions: [user1, user2] })

    } catch (e) {
        console.log(e)
        m.reply('⚠️ La API de Stellar está fallando. Intenta en 5 min')
    }
}
handler.help = ['ship']
handler.tags = ['fun'] 
handler.command = ['ship']
handler.group = true
export default handler