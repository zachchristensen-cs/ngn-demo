/**
 * Pure helpers for the donation-map view layer.
 *
 * Extracted into their own module so they can be unit-tested without
 * pulling in React, the DOM, or the full view component (and without
 * loading the 218 KB coastline-path-data string at test time).
 */

export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 992;
export const ASPECT = MAP_WIDTH / MAP_HEIGHT;
export const MIN_VB_W = 8;
export const MAX_VB_W = 1100;
export const PAN_OVERSCROLL = 80;

const DEFAULT_VB = [ 0, 0, MAP_WIDTH, MAP_HEIGHT ];

export function parseVB( s ) {
	const parts = String( s || '' ).trim().split( /\s+/ ).map( Number );
	if ( parts.length === 4 && parts.every( Number.isFinite ) ) {
		return parts;
	}
	return [ ...DEFAULT_VB ];
}

export function formatVB( arr ) {
	return arr.join( ' ' );
}

export function easeInOut( t ) {
	return t < 0.5 ? 2 * t * t : 1 - Math.pow( -2 * t + 2, 2 ) / 2;
}

export function clampW( w ) {
	return Math.max( MIN_VB_W, Math.min( MAX_VB_W, w ) );
}

// Clamp viewBox origin so the *center* of the viewport stays inside the map
// (plus a small overscroll allowance). Keeps the user from panning the
// coastline fully off-screen at any zoom level.
export function clampVBOrigin( x, y, w, h ) {
	const minX = -PAN_OVERSCROLL - w / 2;
	const maxX = MAP_WIDTH + PAN_OVERSCROLL - w / 2;
	const minY = -PAN_OVERSCROLL - h / 2;
	const maxY = MAP_HEIGHT + PAN_OVERSCROLL - h / 2;
	return [
		Math.max( minX, Math.min( maxX, x ) ),
		Math.max( minY, Math.min( maxY, y ) ),
	];
}

export function zoomVB( [ x, y, w, h ], factor, mx, my ) {
	const newW = clampW( w * factor );
	const newH = newW / ASPECT;
	const rawX = x + mx * ( w - newW );
	const rawY = y + my * ( h - newH );
	const [ clampedX, clampedY ] = clampVBOrigin( rawX, rawY, newW, newH );
	return [ clampedX, clampedY, newW, newH ];
}

export function panVB( [ x, y, w, h ], dxScreen, dyScreen, rect ) {
	const rawX = x - dxScreen * ( w / rect.width );
	const rawY = y - dyScreen * ( h / rect.height );
	const [ clampedX, clampedY ] = clampVBOrigin( rawX, rawY, w, h );
	return [ clampedX, clampedY, w, h ];
}
