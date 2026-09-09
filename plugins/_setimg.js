import fs from 'fs'

let handler = async (m, { conn, args, isOwner, isROwner }) => {
if (!isOwner &&!isROwner) return m.reply(`*Solo Owner*`)

let link = args[0]
if (!link) return m.reply(`*USO INCORRECTO*\n\n*Ejemplo:*.setimg https://i.imgur.com/tu-foto.jpg`)
if (!link.startsWith('http')) return m.reply(`*El link debe ser un URL valido*`)

try {
    // Actualizar variable global
    global.botimg = link

    // Guardar en config.json para que no se pierda al reiniciar
    let config = {}
    if (fs.existsSync('./config.json')) {
        config = JSON.parse(fs.readFileSync('./config.json'))
    }
    config.botimg = link
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))

    await m.reply(`*✅ IMAGEN GLOBAL ACTUALIZADA*\n\n*➤ Nuevo link:* ${link}\n*➤ Estado:* Se aplico en todos los comandos`)

} catch (e) {
    console.log(e)
    m.reply(`*Error al guardar la imagen*`)
}
}

handler.help = ['setimg <link>']
handler.tags = ['owner']
handler.command = ['setimg', 'img', 'fotobot']
handler.owner = true
export default handler