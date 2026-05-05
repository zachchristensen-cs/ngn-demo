import { forwardRef } from 'react';

import { COASTLINE_PATH } from './coastline-path-data';
import { MAP_HEIGHT, MAP_WIDTH } from './utils';

export { COASTLINE_PATH, MAP_HEIGHT, MAP_WIDTH };

/**
 * Shared SVG geometry for the Donation Map block.
 *
 * Coordinate system (range viewBox is 800 × 992):
 *   - Default coastline (COASTLINE_PATH, see coastline-path-data.js) is
 *     Natural Earth 10m coastline data clipped to the East Coast and
 *     projected via Lambert Conformal Conic. Editors can replace it with
 *     a custom raster/vector image via the "Map background" inspector.
 *   - x: 0 (west) → 800 (east). y: 0 (north) → 992 (south).
 *
 * Pin svgX/svgY are real lat/lng projected through the same LCC. To compute
 * a pin's coordinates from lat/lng, use the projection script in
 * /tmp/lcc_project.py or re-run the mapshaper export.
 *
 * Donation cluster (Salem / Marblehead / Nahant) sits around (216, 663).
 *
 * Reference points in viewBox coords (computed from real lat/lng):
 *   Salem, MA            42.52°N, 70.90°W → (216, 661)
 *   Marblehead, MA       42.50°N, 70.86°W → (217, 662)
 *   Nahant, MA           42.43°N, 70.92°W → (216, 665)
 *   Boston               42.36°N, 71.06°W → (212, 668)
 *   Cape Cod tip         42.06°N, 70.18°W → (237, 681)
 *   Cape Hatteras        35.22°N, 75.53°W → ( 77, 980)
 *   Newfoundland (St J)  47.60°N, 52.70°W → (678, 375)
 *   Hamilton Inlet       54.20°N, 57.50°W → (517, 108)
 */

export const RANGE_VIEWBOX = '0 0 800 988';
export const DONATIONS_VIEWBOX = '200 645 90 25';

export const LANDMARKS = [
	{ id: 'labrador', x: 420, y: 100, label: 'Labrador' },
	{ id: 'new-england', x: 100, y: 655, label: 'New England' },
	{ id: 'hatteras', x: 130, y: 970, label: 'Cape Hatteras' },
];

export const COORDINATE_HELP = 'X: 0–800 (range viewBox), Y: 0–992';

/**
 * Renders the static map layers. Pins are rendered separately by the
 * consumer as children. Land fill is achieved via the SVG container's
 * background color (no polygon — the Natural Earth data is line geometry,
 * not closed polygons).
 *
 * If `mapImageUrl` is provided, it replaces the default coastline path
 * (and hides the default landmarks, which were positioned for the default
 * coastline geometry). The image is fit to the full 800×992 SVG canvas via
 * `preserveAspectRatio="xMidYMid meet"` — uploaders should match that
 * aspect ratio (or accept letterboxing) and re-pick pin coordinates against
 * the new background.
 *
 * forwardRef so consumers can read the SVG's getScreenCTM() to convert
 * pin svgX/svgY into accurate screen positions for absolutely-positioned
 * overlays (info cards). Without the ref, percentage-based positioning
 * breaks when preserveAspectRatio letterboxes the SVG inside its
 * container.
 */
export const MapMarkup = forwardRef( function MapMarkup(
	{ viewBox, children, landmarksFaded, mapImageUrl, mapImageAlt },
	ref
) {
	const hasCustomImage = Boolean( mapImageUrl );
	return (
		<svg
			ref={ ref }
			className="donation-map__svg"
			viewBox={ viewBox }
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label={
				mapImageAlt ||
				'Map of the East Coast lobster range with donation origin pins'
			}
			preserveAspectRatio="xMidYMid meet"
		>
			{ hasCustomImage ? (
				<image
					className="donation-map__custom-image"
					href={ mapImageUrl }
					x="0"
					y="0"
					width={ MAP_WIDTH }
					height={ MAP_HEIGHT }
					preserveAspectRatio="xMidYMid meet"
				/>
			) : (
				<>
					<path
						className="donation-map__coast"
						d={ COASTLINE_PATH }
						fill="none"
					/>
					<g
						className="donation-map__landmarks"
						data-faded={ landmarksFaded ? 'true' : 'false' }
					>
						{ LANDMARKS.map( ( l ) => (
							<text
								key={ l.id }
								className="donation-map__landmark"
								x={ l.x }
								y={ l.y }
							>
								{ l.label }
							</text>
						) ) }
					</g>
				</>
			) }
			{ children }
		</svg>
	);
} );
