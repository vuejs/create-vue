#!/usr/bin/env node
/**
 * Two wrangler configs exist so the deploy works whichever Root directory
 * Cloudflare's build is set to:
 *
 *   Root directory blank    -> wrangler.jsonc          (assets ./medhub24)
 *   Root directory `deploy` -> deploy/wrangler.jsonc   (assets ../medhub24)
 *
 * Two configs that can drift are worse than one that is wrong: the site
 * would publish differently depending on a dashboard field nobody is
 * looking at. This asserts they describe the same deployment, comparing
 * the assets directory by its RESOLVED absolute path so the deliberately
 * different relative strings are not flagged.
 *
 * Exits non-zero, naming every mismatch, if they disagree.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const FILES = ['wrangler.jsonc', 'deploy/wrangler.jsonc'];

/** Strip // line comments that JSONC allows and JSON.parse does not. */
const parse = (file) => {
  const raw = readFileSync(file, 'utf8');
  const stripped = raw.replace(/^\s*\/\/.*$/gm, '');
  try {
    return JSON.parse(stripped);
  } catch (error) {
    console.error(`FAIL  ${file} is not valid JSONC: ${error.message}`);
    process.exit(1);
  }
};

/** The fields that must agree, normalised so the two are comparable. */
const shape = (config, file) => ({
  name: config.name,
  compatibility_date: config.compatibility_date,
  main: config.main ?? '(assets-only)',
  not_found_handling: config.assets?.not_found_handling,
  // Resolved against each file's own directory — this is the point of the check.
  assets: resolve(dirname(resolve(file)), config.assets?.directory ?? ''),
  routes: (config.routes ?? [])
    .map((r) => `${r.pattern}${r.custom_domain ? ' (custom_domain)' : ''}`)
    .sort()
    .join(', '),
});

const [a, b] = FILES.map((file) => shape(parse(file), file));

const mismatches = Object.keys(a).filter(
  (key) => JSON.stringify(a[key]) !== JSON.stringify(b[key]),
);

if (mismatches.length > 0) {
  console.error('FAIL  the two wrangler configs describe different deployments:\n');
  for (const key of mismatches) {
    console.error(`  ${key}`);
    console.error(`    ${FILES[0]}: ${a[key]}`);
    console.error(`    ${FILES[1]}: ${b[key]}\n`);
  }
  console.error('Both must describe the same deployment — see the comment at the');
  console.error('top of either file for why they exist.');
  process.exit(1);
}

console.log('OK    both wrangler configs describe the same deployment');
console.log(`      name:   ${a.name}`);
console.log(`      assets: ${a.assets}`);
console.log(`      routes: ${a.routes}`);
