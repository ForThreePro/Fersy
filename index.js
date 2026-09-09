import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { watchFile, unwatchFile, existsSync, mkdirSync } from 'fs';
import cfonts from 'cfonts';
import './plugins/serbot-serbot.js';
import { createInterface } from 'readline';
import yargs from 'yargs';
import chalk from 'chalk';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { name, version } = require(join(__dirname, './package.json'));
const rl = createInterface(process.stdin, process.stdout);

const inicializarEntorno = () => {
  const carpetas = ['tmp', 'Sesiones/Subbots', 'Sesiones/Principal'];
  carpetas.forEach(dir => {
    if (dir?.trim() && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
};

const mostrarBanner = () => {
  cfonts.say('nox bot', {
    font: 'block',
    align: 'center',
    colors: ['blue', 'white'],
    background: 'black'
  });

  cfonts.say('Developed By • Nox Bot MD', {
    font: 'console',
    align: 'center',
    colors: ['cyan']
  });
};

let ejecucionActiva = false;
let procesoHijo;

const ejecutarProceso = (archivo) => {
  if (ejecucionActiva) return;
  ejecucionActiva = true;

  const rutaArchivo = join(__dirname, archivo);
  const argumentos = [rutaArchivo, ...process.argv.slice(2)];

  procesoHijo = spawn('node', argumentos, { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });

  procesoHijo.on('message', codigo => {
    if (codigo === 'reset') {
      procesoHijo.kill();
      ejecucionActiva = false;
      ejecutarProceso(archivo);
    } else if (codigo === 'uptime') {
      procesoHijo.send(process.uptime());
    }
  });

  procesoHijo.on('exit', estado => {
    ejecucionActiva = false;
    console.error('🚩 Error :\n', estado);
    process.exit();
  });

  const opciones = yargs(process.argv.slice(2)).exitProcess(false).parse();
  if (!opciones['test'] && !rl.listenerCount('line')) {
    rl.on('line', entrada => {
      if (procesoHijo?.connected) {
        procesoHijo.send(entrada.trim());
      }
    });
  }

  watchFile(argumentos[0], () => {
    unwatchFile(argumentos[0]);
    if (procesoHijo) procesoHijo.kill();
    ejecucionActiva = false;
    ejecutarProceso(archivo);
  });
};

process.on('warning', alerta => {
  if (alerta.name === 'MaxListenersExceededWarning') {
    console.warn('🚩 Se excedió el límite de Listeners en :');
    console.warn(alerta.stack);
  }
});

inicializarEntorno();
mostrarBanner();
ejecutarProceso('main.js');