import {
	buildGradientCss,
	buildOverlayCss,
	isSafeCssColor,
	newStopId,
	safeColor,
	sortStops,
} from '../utils';

describe( 'isSafeCssColor', () => {
	it.each( [
		'transparent',
		'TRANSPARENT',
		'#fff',
		'#ffffff',
		'#ffffffff',
		'rgb(0, 0, 0)',
		'rgba(0, 0, 0, 0.5)',
		'hsl(120, 50%, 50%)',
		'hsla(120 50% 50% / 0.5)',
	] )( 'accepts %s', ( v ) => {
		expect( isSafeCssColor( v ) ).toBe( true );
	} );

	it.each( [
		'',
		null,
		undefined,
		42,
		'red; behavior:url(x)',
		'expression(alert(1))',
		'url(x)',
		'#xyz',
		'rgb(<script>)',
	] )( 'rejects %s', ( v ) => {
		expect( isSafeCssColor( v ) ).toBe( false );
	} );
} );

describe( 'safeColor', () => {
	it( 'returns the input when valid', () => {
		expect( safeColor( '#fff' ) ).toBe( '#fff' );
		expect( safeColor( 'rgba(0,0,0,0.5)' ) ).toBe( 'rgba(0,0,0,0.5)' );
	} );

	it( 'collapses to transparent when invalid', () => {
		expect( safeColor( 'red; behavior:url(x)' ) ).toBe( 'transparent' );
		expect( safeColor( '' ) ).toBe( 'transparent' );
		expect( safeColor( undefined ) ).toBe( 'transparent' );
	} );

	it( 'trims whitespace from valid input', () => {
		expect( safeColor( '   #fff   ' ) ).toBe( '#fff' );
	} );
} );

describe( 'sortStops', () => {
	it( 'sorts by position ascending without mutating', () => {
		const stops = [
			{ id: 'a', position: 80 },
			{ id: 'b', position: 10 },
			{ id: 'c', position: 50 },
		];
		const out = sortStops( stops );
		expect( out.map( ( s ) => s.id ) ).toEqual( [ 'b', 'c', 'a' ] );
		// Original untouched.
		expect( stops.map( ( s ) => s.id ) ).toEqual( [ 'a', 'b', 'c' ] );
	} );
} );

describe( 'buildGradientCss', () => {
	it( 'returns transparent when there are no stops', () => {
		expect( buildGradientCss( { angle: 90, stops: [] } ) ).toBe(
			'transparent'
		);
		expect( buildGradientCss( {} ) ).toBe( 'transparent' );
		expect( buildGradientCss( null ) ).toBe( 'transparent' );
	} );

	it( 'sorts stops by position before emitting', () => {
		const css = buildGradientCss( {
			angle: 180,
			stops: [
				{ color: '#000', position: 100 },
				{ color: '#fff', position: 0 },
			],
		} );
		expect( css ).toBe( 'linear-gradient(180deg, #fff 0%, #000 100%)' );
	} );

	it( 'clamps stop positions to the [0, 100] range', () => {
		const css = buildGradientCss( {
			angle: 0,
			stops: [
				{ color: '#000', position: -50 },
				{ color: '#fff', position: 250 },
			],
		} );
		expect( css ).toBe( 'linear-gradient(0deg, #000 0%, #fff 100%)' );
	} );

	it( 'replaces unsafe colors with transparent', () => {
		const css = buildGradientCss( {
			angle: 90,
			stops: [
				{ color: 'red; behavior:url(x)', position: 0 },
				{ color: '#fff', position: 100 },
			],
		} );
		expect( css ).toBe(
			'linear-gradient(90deg, transparent 0%, #fff 100%)'
		);
	} );

	it( 'clamps the angle to a sane range', () => {
		const css = buildGradientCss( {
			angle: 100000,
			stops: [
				{ color: '#000', position: 0 },
				{ color: '#fff', position: 100 },
			],
		} );
		expect( css ).toBe( 'linear-gradient(720deg, #000 0%, #fff 100%)' );
	} );
} );

describe( 'buildOverlayCss', () => {
	it( 'returns the gradient form when overlayType is gradient', () => {
		const css = buildOverlayCss( {
			overlayType: 'gradient',
			overlayColor: '#fff',
			overlayGradient: {
				angle: 0,
				stops: [
					{ color: '#000', position: 0 },
					{ color: '#fff', position: 100 },
				],
			},
		} );
		expect( css ).toMatch( /^linear-gradient/ );
	} );

	it( 'returns the (validated) flat color when overlayType is color', () => {
		expect(
			buildOverlayCss( {
				overlayType: 'color',
				overlayColor: '#abc',
				overlayGradient: {},
			} )
		).toBe( '#abc' );
	} );

	it( 'collapses unsafe flat color to transparent', () => {
		expect(
			buildOverlayCss( {
				overlayType: 'color',
				overlayColor: 'expression(alert(1))',
				overlayGradient: {},
			} )
		).toBe( 'transparent' );
	} );
} );

describe( 'newStopId', () => {
	it( 'produces unique ids on successive calls', () => {
		const a = newStopId();
		const b = newStopId();
		expect( a ).not.toBe( b );
		expect( a ).toMatch( /^s-/ );
	} );
} );
