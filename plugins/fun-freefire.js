let handler = async (m, { conn, command }) => {

let idLista = `vs16_${m.chat}`

global.db = global.db || {}
global.db.listas = global.db.listas || {}

// Si no existe la crea
if(!global.db.listas[idLista]){
    global.db.listas[idLista] = { titulares: [], suplentes: [] }
}

let lista = global.db.listas[idLista]
let user = m.sender
let name = await conn.getName(user)

// SI TOCARON LA LISTA
if(m.text.includes('tit_vs16') || m.text.includes('sup_vs16') || m.text.includes('out_vs16')){
    let tipo = m.text.includes('tit')? 'tit' : m.text.includes('sup')? 'sup' : 'out'

    lista.titulares = lista.titulares.filter(v => v.id!== user)
    lista.suplentes = lista.suplentes.filter(v => v.id!== user)

    if(tipo === 'tit'){
        if(lista.titulares.length < 4){
            lista.titulares.push({id: user, name})
            await m.reply(`🎀 @${user.split('@')[0]} TITULAR`, { mentions: [user] })
        } else { return m.reply('⚠️ Lleno. Usa Suplente') }
    }
    if(tipo === 'sup'){
        if(lista.suplentes.length < 2){
            lista.suplentes.push({id: user, name})
            await m.reply(`🌸 @${user.split('@')[0]} SUPLENTE`, { mentions: [user] })
        } else { return m.reply('⚠️ Lleno') }
    }
    if(tipo === 'out'){
        await m.reply(`❌ @${user.split('@')[0]} salió`, { mentions: [user] })
    }
}

// MOSTRAR LISTA
let textoTit = lista.titulares.map((v,i) => `⌇🪭 ${i+1}. @${v.id.split('@')[0]}`).join('\n') || '⌇🪭𐑞'
let textoSup = lista.suplentes.map((v,i) => `⌇🎐 ${i+1}. @${v.id.split('@')[0]}`).join('\n') || '⌇🎐𐑞'

const sections = [{
    title: "ANOTARSE AL VS16",
    rows: [
        {title: "🎀 Jugadora", rowId: ".vs16 tit_vs16", description: "Entrar como titular"},
        {title: "🌸 Suplente", rowId: ".vs16 sup_vs16", description: "Entrar como suplente"},
        {title: "❌ Salir", rowId: ".vs16 out_vs16", description: "Salir de la lista"}
    ]
}]

const listMessage = {
    text: `߳₊🪭⋆.˚ 𝟦𝑽𝑺4 𝑺𝑼𝑹 ꒱ ˖ׄ ୭
╭ ꕀ ֹ
⌇ ⸝⸝ 🆚 𖥦 ﹕
⌇ ⸝⸝ ⏰ 𖥦 ﹕ _16 🇦🇷 ʾ 🇵🇪14_
╰ ☆⃞ 　 ʾ 　 ๑
╭ ꕀ ֹ
⌇ ◟✦ 𓏼𝑻𝑰𝑻𝑼𝑳𝑨𝑹𝑬𝑺﹕ ${lista.titulares.length}/4
${textoTit}
⌇ ◟✦ 𓏼𝑺𝑼𝑷𝑳𝑬𝑵𝑻𝑬𝑺﹕ ${lista.suplentes.length}/2
${textoSup}
╰ ☆⃞ 　 ʾ 　 ๑
\`｡⁖. 𝑷𝒖𝒏𝒕𝒖𝒂𝒍𝒊𝒅𝒂𝒅 | 𝑺𝒊𝒏 𝒍𝒂𝒈 | 𝑹𝒆𝒔𝒑𝒆𝒕𝒐 ⁖｡\``,
    footer: "Toca aquí abajo para anotarte",
    title: "LISTA VS16",
    buttonText: "🎀 ANOTARSE",
    sections
}

await conn.sendMessage(m.chat, listMessage, { quoted: m, mentions: [...lista.titulares.map(v=>v.id),...lista.suplentes.map(v=>v.id)] })

}

handler.help = ['vs16']
handler.tags = ['ff']
handler.command = /^vs16$/i
export default handler