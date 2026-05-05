/**
 * Frontend hydration for the Donation Map block.
 *
 * Replaces the server-rendered static SVG with an interactive React component
 * supporting:
 *   - mouse-wheel and trackpad zoom (centered on cursor)
 *   - click-and-drag pan
 *   - touch pan (1 finger) and pinch zoom (2 fingers)
 *   - + / − zoom buttons
 *   - "Full range" / "Donations" preset jumps (animated)
 *   - click-to-expand pin info cards
 */

import {
	forwardRef,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';

import { hydrateBlock } from '../_shared/hydrate-block';
import {
	MapMarkup,
	RANGE_VIEWBOX,
	DONATIONS_VIEWBOX,
} from './map-svg';
import {
	easeInOut,
	formatVB,
	parseVB,
	panVB,
	zoomVB,
} from './utils';

const PIN_DIVISOR = 100; // pin radius = vbW / PIN_DIVISOR (≈ constant on screen)
const PIN_HALO_MULT = 3.5; // halo radius = pinR * PIN_HALO_MULT (also the click target)
const PRESET_DURATION = 600; // ms

/**
 * State hook: viewBox with two update modes.
 *   - set(updater): immediate update (used by wheel, drag, pinch, +/− buttons)
 *   - animate(target, duration): smooth interpolation to a target (used by
 *     preset buttons like "Full range" / "Donations")
 */
function useViewBox( initial ) {
	const [ vb, setVb ] = useState( initial );
	const vbRef = useRef( vb );
	const animRef = useRef( null );

	useEffect( () => {
		vbRef.current = vb;
	}, [ vb ] );

	const stopAnim = useCallback( () => {
		if ( animRef.current ) {
			cancelAnimationFrame( animRef.current );
			animRef.current = null;
		}
	}, [] );

	const set = useCallback(
		( updater ) => {
			stopAnim();
			setVb( updater );
		},
		[ stopAnim ]
	);

	const animate = useCallback(
		( target, duration = PRESET_DURATION ) => {
			stopAnim();
			const start = vbRef.current;
			const startTime = performance.now();
			const tick = ( now ) => {
				const t = Math.min(
					( now - startTime ) / duration,
					1
				);
				const eased = easeInOut( t );
				setVb( start.map( ( v, i ) => v + ( target[ i ] - v ) * eased ) );
				if ( t < 1 ) {
					animRef.current = requestAnimationFrame( tick );
				} else {
					animRef.current = null;
				}
			};
			animRef.current = requestAnimationFrame( tick );
		},
		[ stopAnim ]
	);

	useEffect( () => () => stopAnim(), [ stopAnim ] );

	return [ vb, set, animate ];
}

const Pin = forwardRef( function Pin(
	{ pin, isSelected, pinR, cardId, onActivate },
	ref
) {
	const handleKey = ( e ) => {
		if ( e.key === 'Enter' || e.key === ' ' ) {
			e.preventDefault();
			onActivate();
		}
	};
	return (
		<g
			ref={ ref }
			className={ `donation-map__pin${
				pin.isPlaceholder ? ' is-placeholder' : ''
			}${ isSelected ? ' is-selected' : '' }` }
			transform={ `translate(${ pin.svgX } ${ pin.svgY })` }
			tabIndex={ 0 }
			role="button"
			aria-label={ pin.lobsterName }
			aria-expanded={ isSelected }
			aria-controls={ isSelected ? cardId : undefined }
			onClick={ ( e ) => {
				e.stopPropagation();
				onActivate();
			} }
			onKeyDown={ handleKey }
		>
			<circle
				className="donation-map__pin-halo"
				r={ pinR * PIN_HALO_MULT }
			/>
			<circle className="donation-map__pin-dot" r={ pinR } />
		</g>
	);
} );

// Card placement around the pin.
//   side:   'right' (default) anchors the card to the right of the pin;
//           'left' anchors it to the left (used near the right viewport edge).
//   anchor: 'center' (default) vertically centers the card on the pin;
//           'top' drops the card down (top edge at pin) — used near the top
//           of the viewport so the card doesn't clip above the container;
//           'bottom' raises the card (bottom edge at pin) — used near the
//           bottom of the viewport.
function placementTransform( { side, anchor } ) {
	const horiz = side === 'left' ? 'calc(-100% - 12px)' : '12px';
	const vert =
		// eslint-disable-next-line no-nested-ternary
		anchor === 'top' ? '0' : anchor === 'bottom' ? '-100%' : '-50%';
	return `translate(${ horiz }, ${ vert })`;
}

const InfoCard = forwardRef( function InfoCard(
	{ pin, x, y, placement, id, onClose, closeButtonRef },
	ref
) {
	return (
		<div
			ref={ ref }
			id={ id }
			className="donation-map__card"
			style={ {
				left: `${ x }px`,
				top: `${ y }px`,
				transform: placementTransform( placement ),
			} }
			role="dialog"
			aria-label={ pin.lobsterName }
		>
			<button
				ref={ closeButtonRef }
				type="button"
				className="donation-map__card-close"
				onClick={ onClose }
				aria-label="Close"
			>
				×
			</button>
			<div className="donation-map__card-name">{ pin.lobsterName }</div>
			{ pin.lobsterType && (
				<div className="donation-map__card-type">
					{ pin.lobsterType }
				</div>
			) }
			{ pin.imageUrl && (
				<div className="donation-map__card-image">
					<img
						src={ pin.imageUrl }
						alt={ pin.imageAlt || '' }
					/>
				</div>
			) }
			<dl className="donation-map__card-meta">
				{ pin.donor && (
					<>
						<dt>Donor</dt>
						<dd>{ pin.donor }</dd>
					</>
				) }
				{ pin.donorBusiness && (
					<>
						<dt>Business</dt>
						<dd>{ pin.donorBusiness }</dd>
					</>
				) }
				{ pin.locationName && (
					<>
						<dt>Location</dt>
						<dd>{ pin.locationName }</dd>
					</>
				) }
				{ pin.donationDate && (
					<>
						<dt>Donated</dt>
						<dd>{ pin.donationDate }</dd>
					</>
				) }
				{ pin.rarity && (
					<>
						<dt>Rarity</dt>
						<dd>{ pin.rarity }</dd>
					</>
				) }
			</dl>
		</div>
	);
} );

function DonationMapInteractive( {
	pins,
	rangeNote,
	defaultViewBox,
	mapImageUrl,
	mapImageAlt,
} ) {
	const initialVb = parseVB( defaultViewBox || DONATIONS_VIEWBOX );
	const [ vb, setVb, animateVb ] = useViewBox( initialVb );
	const [ selectedPinId, setSelectedPinId ] = useState( null );
	const [ isPanning, setIsPanning ] = useState( false );
	const [ showZoomHint, setShowZoomHint ] = useState( false );
	const containerRef = useRef( null );
	const svgRef = useRef( null );
	const panRef = useRef( null );
	const pinchRef = useRef( null );
	const zoomHintTimerRef = useRef( null );
	// Refs for focus management when the info card opens/closes:
	//   - pinRefs maps pin id → SVG <g> element so we can restore focus to
	//     the originating pin when the user dismisses the card.
	//   - cardCloseButtonRef receives focus when the card opens so keyboard
	//     users land on a control instead of the un-focusable card body.
	//   - returnFocusPinIdRef remembers which pin to restore focus to,
	//     since by the time the close handler runs the pin id has been
	//     cleared from state.
	const pinRefs = useRef( new Map() );
	const cardCloseButtonRef = useRef( null );
	const returnFocusPinIdRef = useRef( null );
	const cardId = 'donation-map-card';

	const isMacLike =
		typeof navigator !== 'undefined' &&
		/Mac|iPhone|iPad|iPod/i.test( navigator.platform || '' );
	const zoomHintLabel = `Hold ${ isMacLike ? '⌘' : 'Ctrl' } to zoom`;

	// Wheel / trackpad zoom — non-passive listener so we can preventDefault
	useEffect( () => {
		const el = containerRef.current;
		if ( ! el ) {
			return undefined;
		}
		const onWheel = ( e ) => {
			// Only hijack the wheel for zoom when the user holds a modifier
			// (Cmd on macOS, Ctrl elsewhere). Without a modifier, let the
			// page scroll through naturally — otherwise the map traps
			// readers who happen to be scrolling past it.
			if ( ! e.ctrlKey && ! e.metaKey ) {
				setShowZoomHint( true );
				if ( zoomHintTimerRef.current ) {
					clearTimeout( zoomHintTimerRef.current );
				}
				zoomHintTimerRef.current = setTimeout( () => {
					setShowZoomHint( false );
				}, 1200 );
				return;
			}
			setShowZoomHint( false );
			if ( zoomHintTimerRef.current ) {
				clearTimeout( zoomHintTimerRef.current );
				zoomHintTimerRef.current = null;
			}
			e.preventDefault();
			const rect = el.getBoundingClientRect();
			const mx = ( e.clientX - rect.left ) / rect.width;
			const my = ( e.clientY - rect.top ) / rect.height;
			// Tighter steps for trackpad (small deltas), looser for wheel
			const intensity = Math.min(
				1,
				Math.abs( e.deltaY ) / 100
			);
			const factor =
				e.deltaY < 0
					? 1 - 0.18 * intensity
					: 1 + 0.22 * intensity;
			setVb( ( curr ) => zoomVB( curr, factor, mx, my ) );
		};
		el.addEventListener( 'wheel', onWheel, { passive: false } );
		return () => el.removeEventListener( 'wheel', onWheel );
	}, [ setVb ] );

	// Clear pending zoom-hint timer on unmount so it can't fire setState
	// against a torn-down component.
	useEffect(
		() => () => {
			if ( zoomHintTimerRef.current ) {
				clearTimeout( zoomHintTimerRef.current );
				zoomHintTimerRef.current = null;
			}
		},
		[]
	);

	// Mouse drag pan — start
	const onMouseDown = ( e ) => {
		if ( e.button !== 0 ) {
			return;
		}
		if (
			e.target.closest( '.donation-map__pin' ) ||
			e.target.closest( '.donation-map__card' )
		) {
			return;
		}
		setIsPanning( true );
		panRef.current = { x: e.clientX, y: e.clientY };
	};

	// Mouse drag pan — move/end (document-level so drag can leave the SVG)
	useEffect( () => {
		if ( ! isPanning ) {
			return undefined;
		}
		const onMove = ( e ) => {
			const rect = containerRef.current.getBoundingClientRect();
			const dx = e.clientX - panRef.current.x;
			const dy = e.clientY - panRef.current.y;
			panRef.current = { x: e.clientX, y: e.clientY };
			setVb( ( curr ) => panVB( curr, dx, dy, rect ) );
		};
		const onUp = () => setIsPanning( false );
		document.addEventListener( 'mousemove', onMove );
		document.addEventListener( 'mouseup', onUp );
		return () => {
			document.removeEventListener( 'mousemove', onMove );
			document.removeEventListener( 'mouseup', onUp );
		};
	}, [ isPanning, setVb ] );

	// Touch handlers — start
	const onTouchStart = ( e ) => {
		if (
			e.target.closest( '.donation-map__pin' ) ||
			e.target.closest( '.donation-map__card' )
		) {
			return;
		}
		if ( e.touches.length === 1 ) {
			panRef.current = {
				x: e.touches[ 0 ].clientX,
				y: e.touches[ 0 ].clientY,
			};
			pinchRef.current = null;
		} else if ( e.touches.length === 2 ) {
			const t1 = e.touches[ 0 ];
			const t2 = e.touches[ 1 ];
			const dx = t2.clientX - t1.clientX;
			const dy = t2.clientY - t1.clientY;
			pinchRef.current = {
				dist: Math.hypot( dx, dy ),
				cx: ( t1.clientX + t2.clientX ) / 2,
				cy: ( t1.clientY + t2.clientY ) / 2,
			};
			panRef.current = null;
		}
	};

	// Touch move — non-passive listener so we can preventDefault during pinch
	useEffect( () => {
		const el = containerRef.current;
		if ( ! el ) {
			return undefined;
		}
		const onTouchMove = ( e ) => {
			const rect = el.getBoundingClientRect();
			if ( e.touches.length === 1 && panRef.current ) {
				e.preventDefault();
				const dx =
					e.touches[ 0 ].clientX - panRef.current.x;
				const dy =
					e.touches[ 0 ].clientY - panRef.current.y;
				panRef.current = {
					x: e.touches[ 0 ].clientX,
					y: e.touches[ 0 ].clientY,
				};
				setVb( ( curr ) => panVB( curr, dx, dy, rect ) );
			} else if (
				e.touches.length === 2 &&
				pinchRef.current
			) {
				e.preventDefault();
				const t1 = e.touches[ 0 ];
				const t2 = e.touches[ 1 ];
				const dx = t2.clientX - t1.clientX;
				const dy = t2.clientY - t1.clientY;
				const dist = Math.hypot( dx, dy );
				const cx = ( t1.clientX + t2.clientX ) / 2;
				const cy = ( t1.clientY + t2.clientY ) / 2;
				// Amplify the raw distance ratio so pinches map to a more
				// pronounced zoom change. The exponent acts as a sensitivity
				// multiplier — 1.0 is neutral, higher = more zoom per pinch.
				// 1.3 was tuned empirically: 1.0 felt sluggish, 2.0 (the prior
				// value) felt twitchy and overshot on long pinches.
				const rawFactor = pinchRef.current.dist / dist;
				const factor = Math.pow( rawFactor, 1.3 );
				const mx = ( cx - rect.left ) / rect.width;
				const my = ( cy - rect.top ) / rect.height;
				setVb( ( curr ) => zoomVB( curr, factor, mx, my ) );
				pinchRef.current = { dist, cx, cy };
			}
		};
		const onTouchEnd = () => {
			panRef.current = null;
			pinchRef.current = null;
		};
		el.addEventListener( 'touchmove', onTouchMove, {
			passive: false,
		} );
		el.addEventListener( 'touchend', onTouchEnd );
		el.addEventListener( 'touchcancel', onTouchEnd );
		return () => {
			el.removeEventListener( 'touchmove', onTouchMove );
			el.removeEventListener( 'touchend', onTouchEnd );
			el.removeEventListener( 'touchcancel', onTouchEnd );
		};
	}, [ setVb ] );

	// Esc closes the info card and restores focus to the originating pin.
	useEffect( () => {
		const onKey = ( e ) => {
			if ( e.key === 'Escape' && selectedPinId ) {
				closeCard();
			}
		};
		document.addEventListener( 'keydown', onKey );
		return () => document.removeEventListener( 'keydown', onKey );
	}, [ selectedPinId, closeCard ] );

	// Button actions
	const zoomIn = () =>
		setVb( ( curr ) => zoomVB( curr, 0.7, 0.5, 0.5 ) );
	const zoomOut = () =>
		setVb( ( curr ) => zoomVB( curr, 1.4, 0.5, 0.5 ) );
	const goRange = () => animateVb( parseVB( RANGE_VIEWBOX ) );
	const goDonations = () =>
		animateVb( parseVB( DONATIONS_VIEWBOX ) );

	const onPinActivate = ( pinId ) => {
		setSelectedPinId( ( curr ) => {
			const opening = curr !== pinId;
			// Remember which pin to restore focus to when the card later
			// closes. We capture this on activation, before state changes
			// have torn the pin id out of selectedPinId.
			returnFocusPinIdRef.current = opening ? pinId : null;
			return opening ? pinId : null;
		} );
	};

	const closeCard = useCallback( () => {
		setSelectedPinId( null );
		const returnId = returnFocusPinIdRef.current;
		if ( returnId ) {
			const node = pinRefs.current.get( returnId );
			if ( node && typeof node.focus === 'function' ) {
				node.focus();
			}
			returnFocusPinIdRef.current = null;
		}
	}, [] );

	// When the card opens, focus its close button so keyboard users can
	// dismiss it without having to tab in. The layout effect runs after
	// the card has been mounted by React.
	useLayoutEffect( () => {
		if ( selectedPinId && cardCloseButtonRef.current ) {
			cardCloseButtonRef.current.focus();
		}
	}, [ selectedPinId ] );

	const pinR = vb[ 2 ] / PIN_DIVISOR;
	const selectedPin =
		selectedPinId && pins.find( ( p ) => p.id === selectedPinId );

	// Card position computed via the SVG's getScreenCTM (the actual rendered
	// coordinate transform). This handles preserveAspectRatio letterboxing
	// correctly — percentage-based positioning of the parent container
	// would put the card in the wrong place when the viewBox aspect ratio
	// doesn't match the container aspect ratio (e.g. donations zoom is 90×25
	// but container is portrait 800×992).
	const [ cardPos, setCardPos ] = useState( null );
	const recomputeCardPos = useCallback( () => {
		if ( ! selectedPin ) {
			setCardPos( null );
			return;
		}
		const svg = svgRef.current;
		const container = containerRef.current;
		if ( ! svg || ! container ) {
			return;
		}
		const ctm = svg.getScreenCTM();
		if ( ! ctm ) {
			return;
		}
		const pt = svg.createSVGPoint();
		pt.x = selectedPin.svgX;
		pt.y = selectedPin.svgY;
		const screen = pt.matrixTransform( ctm );
		const rect = container.getBoundingClientRect();
		setCardPos( {
			x: screen.x - rect.left,
			y: screen.y - rect.top,
			cw: rect.width,
			ch: rect.height,
		} );
	}, [ selectedPin ] );

	useLayoutEffect( () => {
		recomputeCardPos();
	}, [ recomputeCardPos, vb ] );

	// Recompute on container resize so the card stays anchored to its pin
	// when the viewport (or any responsive ancestor) changes size.
	useEffect( () => {
		if ( ! selectedPin ) {
			return undefined;
		}
		const container = containerRef.current;
		if ( ! container || typeof ResizeObserver === 'undefined' ) {
			return undefined;
		}
		const ro = new ResizeObserver( () => recomputeCardPos() );
		ro.observe( container );
		return () => ro.disconnect();
	}, [ selectedPin, recomputeCardPos ] );

	// Choose card placement around the pin's screen position. Top/bottom 25%
	// of the container drops the card down or raises it so it doesn't clip
	// out of the SVG container; otherwise vertically center on the pin.
	// Right half of the container flips the card to the pin's left side.
	const placement = cardPos
		? {
				side: cardPos.x > cardPos.cw / 2 ? 'left' : 'right',
				// eslint-disable-next-line no-nested-ternary
				anchor:
					cardPos.y < cardPos.ch * 0.25
						? 'top'
						: cardPos.y > cardPos.ch * 0.75
						? 'bottom'
						: 'center',
		  }
		: { side: 'right', anchor: 'center' };

	return (
		<>
			<div className="donation-map__toolbar">
				<div className="donation-map__zoom-group">
					<button
						type="button"
						className="donation-map__zoom-btn"
						onClick={ zoomIn }
						aria-label="Zoom in"
					>
						+
					</button>
					<button
						type="button"
						className="donation-map__zoom-btn"
						onClick={ zoomOut }
						aria-label="Zoom out"
					>
						−
					</button>
				</div>
				<button
					type="button"
					className="donation-map__toggle"
					onClick={ goRange }
				>
					Full range
				</button>
				<button
					type="button"
					className="donation-map__toggle"
					onClick={ goDonations }
				>
					Donations
				</button>
			</div>

			<div
				ref={ containerRef }
				className="donation-map__svg-container"
				onMouseDown={ onMouseDown }
				onTouchStart={ onTouchStart }
				data-panning={ isPanning ? 'true' : 'false' }
			>
				<MapMarkup
					ref={ svgRef }
					viewBox={ formatVB( vb ) }
					landmarksFaded={ vb[ 2 ] < 200 }
					mapImageUrl={ mapImageUrl }
					mapImageAlt={ mapImageAlt }
				>
					{ pins.map( ( pin ) => (
						<Pin
							key={ pin.id }
							ref={ ( node ) => {
								if ( node ) {
									pinRefs.current.set( pin.id, node );
								} else {
									pinRefs.current.delete( pin.id );
								}
							} }
							pin={ pin }
							isSelected={ selectedPinId === pin.id }
							pinR={ pinR }
							cardId={ cardId }
							onActivate={ () => onPinActivate( pin.id ) }
						/>
					) ) }
				</MapMarkup>

				{ selectedPin && cardPos && (
					<InfoCard
						pin={ selectedPin }
						x={ cardPos.x }
						y={ cardPos.y }
						placement={ placement }
						id={ cardId }
						closeButtonRef={ cardCloseButtonRef }
						onClose={ closeCard }
					/>
				) }

				<div
					className="donation-map__zoom-hint"
					data-visible={ showZoomHint ? 'true' : 'false' }
					aria-hidden="true"
				>
					{ zoomHintLabel }
				</div>
			</div>

			<figcaption className="donation-map__note">
				{ rangeNote }
			</figcaption>
		</>
	);
}

hydrateBlock( {
	selector: '.donation-map[data-config]',
	blockName: 'donation-map',
	render: ( config ) => <DonationMapInteractive { ...config } />,
} );
