// Match the PHP allow-list in render.php so editor previews and the front
// end render identical strings. Anything outside the allowed forms collapses
// to `transparent` rather than smuggling unexpected CSS into the page.
const SAFE_COLOR_RE =
	/^(#[0-9a-f]{3,8}|rgba?\(\s*[0-9.,%/\s-]+\s*\)|hsla?\(\s*[0-9.,%/\s-]+\s*\))$/i;

export const isSafeCssColor = ( value ) => {
	if ( typeof value !== 'string' ) {
		return false;
	}
	const trimmed = value.trim();
	if ( ! trimmed ) {
		return false;
	}
	if ( trimmed.toLowerCase() === 'transparent' ) {
		return true;
	}
	return SAFE_COLOR_RE.test( trimmed );
};

export const safeColor = ( value ) =>
	isSafeCssColor( value ) ? value.trim() : 'transparent';

const clampPos = ( n ) => Math.max( 0, Math.min( 100, Number( n ) || 0 ) );

export const sortStops = ( stops ) =>
	[ ...stops ].sort( ( a, b ) => a.position - b.position );

export const buildGradientCss = ( gradient ) => {
	const { angle = 180, stops = [] } = gradient || {};
	if ( ! stops.length ) {
		return 'transparent';
	}
	const safeAngle = Math.max( -360, Math.min( 720, Number( angle ) || 0 ) );
	const parts = sortStops( stops ).map(
		( stop ) => `${ safeColor( stop.color ) } ${ clampPos( stop.position ) }%`
	);
	return `linear-gradient(${ safeAngle }deg, ${ parts.join( ', ' ) })`;
};

export const buildOverlayCss = ( {
	overlayType,
	overlayColor,
	overlayGradient,
} ) => {
	if ( overlayType === 'gradient' ) {
		return buildGradientCss( overlayGradient );
	}
	return safeColor( overlayColor );
};

let counter = 0;
export const newStopId = () => {
	counter += 1;
	return `s-${ Date.now().toString( 36 ) }-${ counter }`;
};
