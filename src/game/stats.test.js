// Pruebas de las stats: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aplicarStat, estadoDe, tipoCorazon, STATS_INICIO } from './stats.js';
import { CARAS_PIRINOLA, CASTIGO_CARA } from '../data/pirinola.js';

test('un trago quita medio corazón y sube el mareo; un shot cuenta como trago y como shot', () => {
  const t = aplicarStat(STATS_INICIO, 'trago');
  assert.equal(t.medios, 19);
  assert.equal(t.tragos, 1);
  assert.ok(t.mareo > 0);
  const s = aplicarStat(t, 'shot');
  assert.deepEqual([s.medios, s.tragos, s.shots], [17, 2, 1]);
});

test('las stats no se salen de sus límites', () => {
  const ko = aplicarStat(STATS_INICIO, 'fondo', 10);
  assert.equal(ko.medios, 0);
  assert.equal(ko.mareo, 100);
  assert.equal(estadoDe(ko).nombre, 'K.O.');
  const agua = aplicarStat(STATS_INICIO, 'agua', 3);
  assert.equal(agua.medios, 20, 'el agua no pasa de 10 corazones');
  assert.equal(agua.mareo, 0, 'ni baja el mareo de cero');
});

test('partidas guardadas sin stats arrancan desde el inicio', () => {
  assert.equal(aplicarStat(undefined, 'trago').medios, 19);
  assert.equal(estadoDe(undefined).nombre, 'Al cien');
});

test('corazones: lleno, medio y vacío', () => {
  assert.deepEqual([0, 1, 2].map(k => tipoCorazon(3, k)), ['lleno', 'medio', 'vacio']);
});

test('cada cara de la pirinola dice cuánto se toma', () => {
  for (const cara of CARAS_PIRINOLA) assert.ok(CASTIGO_CARA[cara], `a la cara "${cara}" le falta su castigo`);
});
