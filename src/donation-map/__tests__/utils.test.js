import {
	ASPECT,
	MAP_HEIGHT,
	MAP_WIDTH,
	MAX_VB_W,
	MIN_VB_W,
	clampVBOrigin,
	clampW,
	easeInOut,
	formatVB,
	panVB,
	parseVB,
	zoomVB,
} from '../utils';

describe( 'parseVB', () => {
	it( 'parses a well-formed viewBox string', () => {
		expect( parseVB( '0 0 800 992' ) ).toEqual( [ 0, 0, 800, 992 ] );
	} );

	it( 'parses with extra whitespace', () => {
		expect( parseVB( '  10   20\t30  40 ' ) ).toEqual( [ 10, 20, 30, 40 ] );
	} );

	it( 'falls back to default for an empty string', () => {
		expect( parseVB( '' ) ).toEqual( [ 0, 0, MAP_WIDTH, MAP_HEIGHT ] );
	} );

	it( 'falls back to default for null/undefined', () => {
		expect( parseVB( null ) ).toEqual( [ 0, 0, MAP_WIDTH, MAP_HEIGHT ] );
		expect( parseVB( undefined ) ).toEqual( [ 0, 0, MAP_WIDTH, MAP_HEIGHT ] );
	} );

	it( 'falls back to default when the wrong number of parts is given', () => {
		expect( parseVB( '0 0 800' ) ).toEqual( [ 0, 0, MAP_WIDTH, MAP_HEIGHT ] );
		expect( parseVB( '0 0 800 992 50' ) ).toEqual( [ 0, 0, MAP_WIDTH, MAP_HEIGHT ] );
	} );

	it( 'falls back to default when any part is non-numeric', () => {
		expect( parseVB( '0 0 800 abc' ) ).toEqual( [ 0, 0, MAP_WIDTH, MAP_HEIGHT ] );
	} );
} );

describe( 'formatVB', () => {
	it( 'space-joins the four numbers', () => {
		expect( formatVB( [ 0, 0, 800, 992 ] ) ).toBe( '0 0 800 992' );
	} );
} );

describe( 'easeInOut', () => {
	it( 'is 0 at t=0 and 1 at t=1', () => {
		expect( easeInOut( 0 ) ).toBe( 0 );
		expect( easeInOut( 1 ) ).toBe( 1 );
	} );

	it( 'is 0.5 at t=0.5 (curve symmetry)', () => {
		expect( easeInOut( 0.5 ) ).toBeCloseTo( 0.5, 5 );
	} );

	it( 'is monotonically non-decreasing across the unit interval', () => {
		let prev = -Infinity;
		for ( let i = 0; i <= 20; i += 1 ) {
			const v = easeInOut( i / 20 );
			expect( v ).toBeGreaterThanOrEqual( prev );
			prev = v;
		}
	} );
} );

describe( 'clampW', () => {
	it( 'returns the input when in range', () => {
		expect( clampW( 500 ) ).toBe( 500 );
	} );

	it( 'clamps below MIN_VB_W', () => {
		expect( clampW( 0 ) ).toBe( MIN_VB_W );
		expect( clampW( -100 ) ).toBe( MIN_VB_W );
	} );

	it( 'clamps above MAX_VB_W', () => {
		expect( clampW( 99999 ) ).toBe( MAX_VB_W );
	} );
} );

describe( 'clampVBOrigin', () => {
	it( 'leaves an in-bounds origin untouched', () => {
		expect( clampVBOrigin( 100, 100, 200, 250 ) ).toEqual( [ 100, 100 ] );
	} );

	it( 'clamps x and y so the viewport center stays inside the map (with overscroll)', () => {
		// Push origin far positive — the center is offset by w/2, h/2.
		const w = 200;
		const h = 250;
		const [ clampedX, clampedY ] = clampVBOrigin( 100000, 100000, w, h );
		// Center after clamping must not exceed MAP + overscroll.
		expect( clampedX + w / 2 ).toBeLessThanOrEqual( MAP_WIDTH + 80 + 0.001 );
		expect( clampedY + h / 2 ).toBeLessThanOrEqual( MAP_HEIGHT + 80 + 0.001 );
	} );

	it( 'clamps negative origins', () => {
		const w = 200;
		const h = 250;
		const [ clampedX, clampedY ] = clampVBOrigin( -100000, -100000, w, h );
		// Center after clamping must not go below 0 - overscroll.
		expect( clampedX + w / 2 ).toBeGreaterThanOrEqual( -80 - 0.001 );
		expect( clampedY + h / 2 ).toBeGreaterThanOrEqual( -80 - 0.001 );
	} );
} );

describe( 'zoomVB', () => {
	it( 'preserves the screen-fraction point in SVG coords', () => {
		// Zoom in to 0.5x at the center: that point's SVG coord shouldn't move.
		const startVB = [ 0, 0, 800, 992 ];
		const centerSvgX = startVB[ 0 ] + 0.5 * startVB[ 2 ];
		const centerSvgY = startVB[ 1 ] + 0.5 * startVB[ 3 ];
		const [ x, y, w, h ] = zoomVB( startVB, 0.5, 0.5, 0.5 );
		expect( x + 0.5 * w ).toBeCloseTo( centerSvgX, 5 );
		expect( y + 0.5 * h ).toBeCloseTo( centerSvgY, 5 );
	} );

	it( 'enforces width clamping', () => {
		// Try to shrink past the floor.
		const [ , , w ] = zoomVB( [ 0, 0, 100, 100 / ASPECT ], 0.0001, 0.5, 0.5 );
		expect( w ).toBe( MIN_VB_W );
	} );

	it( 'maintains aspect ratio of the new viewBox', () => {
		const [ , , w, h ] = zoomVB( [ 0, 0, 800, 992 ], 0.7, 0.3, 0.7 );
		expect( w / h ).toBeCloseTo( ASPECT, 5 );
	} );
} );

describe( 'panVB', () => {
	const rect = { width: 400, height: 500 };

	it( 'translates origin proportional to screen-space delta', () => {
		const [ x, y ] = panVB( [ 100, 100, 200, 250 ], -40, -50, rect );
		// dx=-40 of 400px width = -1/10 of vb width (200) = +20 to x.
		// dy=-50 of 500px height = -1/10 of vb height (250) = +25 to y.
		expect( x ).toBeCloseTo( 120, 5 );
		expect( y ).toBeCloseTo( 125, 5 );
	} );

	it( 'preserves width and height', () => {
		const [ , , w, h ] = panVB( [ 0, 0, 200, 250 ], 10, 10, rect );
		expect( w ).toBe( 200 );
		expect( h ).toBe( 250 );
	} );

	it( 'clamps the result origin inside the map', () => {
		// Pan far to the right.
		const [ x ] = panVB( [ 0, 0, 200, 250 ], -1000000, 0, rect );
		expect( x + 200 / 2 ).toBeLessThanOrEqual( MAP_WIDTH + 80 + 0.001 );
	} );
} );
