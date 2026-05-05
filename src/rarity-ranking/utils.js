/**
 * Pure helpers for the rarity-ranking view layer.
 *
 * Extracted into their own module so they can be unit-tested without
 * pulling in React or the DOM.
 */

/**
 * Split donor context like "Lobster boat captain, Nahant" into
 * { context: "Lobster boat captain", location: "Nahant" } using the
 * trailing comma-separated segment as the location.
 *
 * Mirrors the PHP `$split_donor_context` closure in render.php so the
 * SSR markup and the React tree partition the donor context identically.
 */
export function splitDonorContext( raw ) {
	const value = ( raw || '' ).trim();
	if ( ! value ) {
		return { context: '', location: '' };
	}
	const idx = value.lastIndexOf( ',' );
	if ( idx === -1 ) {
		return { context: value, location: '' };
	}
	return {
		context: value.slice( 0, idx ).trim(),
		location: value.slice( idx + 1 ).trim(),
	};
}
