#!/usr/bin/env node
/**
 * Single source of truth for the donation-map coastline:
 *   src/donation-map/coastline-path-data.js (canonical, imported by map-svg.js)
 *
 * This script regenerates the PHP twin
 *   src/donation-map/coastline-path-data.php
 * which is consumed by render.php at runtime.
 *
 * Runs as a `prebuild` / `prestart` hook so the two stay in sync without
 * any manual ceremony.
 */

const fs = require( 'fs' );
const path = require( 'path' );

const ROOT = path.resolve( __dirname, '..' );
const JS_PATH = path.join( ROOT, 'src/donation-map/coastline-path-data.js' );
const PHP_PATH = path.join( ROOT, 'src/donation-map/coastline-path-data.php' );

const source = fs.readFileSync( JS_PATH, 'utf8' );
const match = source.match(
	/export\s+const\s+COASTLINE_PATH\s*=\s*'([^']*)'\s*;/
);
if ( ! match ) {
	process.stderr.write(
		`sync-coastline-data: could not find COASTLINE_PATH export in ${ JS_PATH }\n`
	);
	process.exit( 1 );
}
const data = match[ 1 ];

// PHP single-quoted strings: only ' and \ need escaping. The coastline data
// is just digits, spaces, dots, and the letter 'M' so this is a no-op in
// practice, but kept for safety in case the source ever changes.
const escaped = data.replace( /\\/g, '\\\\' ).replace( /'/g, "\\'" );

const php = `<?php
/**
 * AUTO-GENERATED FILE — do not edit by hand.
 *
 * Regenerated from src/donation-map/coastline-path-data.js by
 * scripts/sync-coastline-data.js. Run \`npm run sync:coastline\` (or any
 * \`build\` / \`start\`) to refresh.
 */

return '${ escaped }';
`;

fs.writeFileSync( PHP_PATH, php, 'utf8' );
process.stdout.write(
	`sync-coastline-data: wrote ${ data.length } chars to ${ path.relative( ROOT, PHP_PATH ) }\n`
);
