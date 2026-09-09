import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'

global.owner = [
  [ '51927174369', 'Barboza OFC 🌃', true ],
  [ '51924636698', 'Jota 🐼', true ]
]

global.mods = []
global.prems = []

global.packname = `[ 𝙉𝙤𝙭 𝘽ο𝙩 🌃`
global.author = '𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃]'
global.stickpack = '© 𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃'
global.stickauth = '𝘽𝙮 𝙉𝙤𝙭 𝘽ο𝙩'
global.wm = '𝙉𝙤𝙭 🌃'
global.botname = '[ 𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃 ]'
global.textbot = `𝙋ο𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝙉𝙤𝙭 🌀`
global.dev = '• 𝙋ο𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘾ο𝙢𝙪𝙣𝙞𝙩𝙮 𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃'
global.wait = '🌪️ *𝘼𝙜𝙪𝙖𝙧𝙙𝙚 𝙪𝙣 𝙢ο𝙢𝙚𝙣𝙩ο, 𝙨ο𝙮 𝙡𝙚𝙣𝙩ο... ฅ^•ﻌ•^ฅ\n> 𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃 🌪️*'
global.listo = '*𝘼𝙦𝙪𝙞 𝙩𝙞𝙚𝙣𝙚 ฅ^•ﻌ•^ฅ*'
global.namechannel = '𝙉𝙤𝙭 𝘽ο𝙩 𝙈𝘿 🌃'
global.channel = 'https://whatsapp.com/channel/0029Vaua0ZD3gvWjQaIpSy18'

global.catalogo = fs.readFileSync('./storage/img/catalogo.png')

global.group = 'https://chat.whatsapp.com/CBuLXuVZcg9FEfCSHiY6b0'
global.canal = 'https://whatsapp.com/channel/0029Vaua0ZD3gvWjQaIpSy18'
global.insta = 'https://www.insta.com/sebastian_barboza13'

// IMAGEN GLOBAL CON FALLBACK Y CARGA DESDE DB
global.botimg = global.db?.data?.settings?.botimg || 'https://files.evogb.win/QFXQtu.jpg'

global.estilo = { 
  key: { 
    fromMe: false, 
    participant: `0@s.whatsapp.net`, 
    ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) 
  }, 
  message: { 
    orderMessage: { 
      itemCount: -999, 
      status: 1, 
      surface: 1, 
      message: global.packname, 
      orderTitle: 'Bang', 
      thumbnail: global.catalogo, 
      sellerJid: '0@s.whatsapp.net'
    }
  }
}

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.jadi = 'Sesiones/Subbots'
global.Sesion = 'Sesiones/Principal'
global.dbname = 'database.json'

global.multiplier = 69 
global.maxwarn = '2' 

global.APIs = {
  amel: 'https://melcanz.com',
  bx: 'https://bx-hunter.herokuapp.com',
  nrtm: 'https://nurutomo.herokuapp.com',
  xteam: 'https://api.xteam.xyz',
  nzcha: 'http://nzcha-apii.herokuapp.com',
  bg: 'http://bochil.ddns.net',
  fdci: 'https://api.fdci.se',
  dzx: 'https://api.dhamzxploit.my.id',
  bsbt: 'https://bsbt-api-rest.herokuapp.com',
  zahir: 'https://zahirr-web.herokuapp.com',
  zeks: 'https://api.zeks.me',
  hardianto: 'https://hardianto-chan.herokuapp.com',
  pencarikode: 'https://pencarikode.xyz',
  LeysCoder: 'https://leyscoders-api.herokuapp.com',
  adiisus: 'https://adiixyzapi.herokuapp.com',
  lol: 'https://api.lolhuman.xyz',
  fgmods: 'https://api-fgmods.ddns.net',
  Velgrynd: 'https://velgrynd.herokuapp.com',
  rey: 'https://server-api-rey.herokuapp.com',
  shadow: 'https://api.reysekha.xyz',
  apialc: 'https://api-alc.herokuapp.com',
  botstyle: 'https://botstyle-api.herokuapp.com',
  neoxr: 'https://neoxr-api.herokuapp.com',
  ana: 'https://anabotofc.herokuapp.com/',
  kanx: 'https://kannxapi.herokuapp.com/',
  dhnjing: 'https://dhnjing.xyz'
}

global.APIKeys = {
  'https://api-alc.herokuapp.com': 'ConfuMods',
  'https://api.reysekha.xyz': 'apirey',
  'https://melcanz.com': 'F3bOrWzY',
  'https://bx-hunter.herokuapp.com': 'Ikyy69',
  'https://api.xteam.xyz': '5bd33b276d41d6b4',
  'https://zahirr-web.herokuapp.com': 'zahirgans',
  'https://bsbt-api-rest.herokuapp.com': 'benniismael',
  'https://api.zeks.me': 'apivinz',
  'https://hardianto-chan.herokuapp.com': 'hardianto',
  'https://pencarikode.xyz': 'pais',
  'https://api-fgmods.ddns.net': 'fg-dylux',
  'https://leyscoders-api.herokuapp.com': 'MIMINGANZ',
  'https://server-api-rey.herokuapp.com': 'apirey',
  'https://api.lolhuman.xyz': 'GataDiosV2',
  'https://botstyle-api.herokuapp.com': 'Eyar749L',
  'https://neoxr-api.herokuapp.com': 'yntkts',
  'https://anabotofc.herokuapp.com/': 'AnaBot'
} 

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})