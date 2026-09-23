import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('web/generated/licenses', {recursive:true});
await build({entryPoints:['web/3d/finish-viewer-entry.js'], bundle:true, format:'iife', globalName:'QPixel3D', outfile:'web/generated/finish-viewer.bundle.js', minify:true, target:['safari15'], legalComments:'eof'});
await copyFile('node_modules/three/LICENSE','web/generated/licenses/three-LICENSE.txt');
