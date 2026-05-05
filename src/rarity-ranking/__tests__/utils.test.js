import { splitDonorContext } from '../utils';

describe( 'splitDonorContext', () => {
	it( 'returns empty parts for empty/null input', () => {
		expect( splitDonorContext( '' ) ).toEqual( {
			context: '',
			location: '',
		} );
		expect( splitDonorContext( null ) ).toEqual( {
			context: '',
			location: '',
		} );
		expect( splitDonorContext( undefined ) ).toEqual( {
			context: '',
			location: '',
		} );
	} );

	it( 'returns the whole string as context when there is no comma', () => {
		expect( splitDonorContext( 'Lobster boat captain' ) ).toEqual( {
			context: 'Lobster boat captain',
			location: '',
		} );
	} );

	it( 'splits at the trailing comma into context + location', () => {
		expect(
			splitDonorContext( 'Lobster boat captain, Nahant' )
		).toEqual( {
			context: 'Lobster boat captain',
			location: 'Nahant',
		} );
	} );

	it( 'uses the LAST comma as the split point', () => {
		expect(
			splitDonorContext( 'Sophia & Emma, gift shop, Salem' )
		).toEqual( {
			context: 'Sophia & Emma, gift shop',
			location: 'Salem',
		} );
	} );

	it( 'trims whitespace around both halves', () => {
		expect(
			splitDonorContext( '  Lobster boat captain   ,   Nahant  ' )
		).toEqual( {
			context: 'Lobster boat captain',
			location: 'Nahant',
		} );
	} );
} );
