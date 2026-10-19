// Registra el loader ESM de ts-node usando la API estable `module.register`
// (Node >= 20.6). Reemplaza al flag `--loader ts-node/esm`, que está deprecado.
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('ts-node/esm', pathToFileURL('./'));
