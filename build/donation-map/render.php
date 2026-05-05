<?php
/**
 * Server-side render for the Donation Map block.
 *
 * Outputs a fully accessible static SVG plus a noscript pin list. view.js
 * hydrates the container into an interactive React component on the frontend.
 *
 * The coastline path is loaded from coastline-path-data.php — that file is
 * auto-generated from coastline-path-data.js by scripts/sync-coastline-data.js
 * (runs on every `npm run build` / `npm run start`), so the JS bundle and the
 * server render always emit identical geometry.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

$config = array(
	'pins'           => ( isset( $attributes['pins'] ) && is_array( $attributes['pins'] ) )
		? array_values( $attributes['pins'] )
		: array(),
	'rangeNote'      => $attributes['rangeNote'] ?? '',
	'defaultViewBox' => $attributes['defaultViewBox'] ?? '200 645 90 25',
	'mapImageUrl'    => isset( $attributes['mapImageUrl'] ) ? (string) $attributes['mapImageUrl'] : '',
	'mapImageAlt'    => isset( $attributes['mapImageAlt'] ) ? (string) $attributes['mapImageAlt'] : '',
);

$has_custom_image = '' !== $config['mapImageUrl'];
$initial_viewbox  = $config['defaultViewBox'];

// Pin radius scales with the displayed viewBox width so pins stay
// the same apparent size on screen at any zoom (matches view.js).
$initial_vb_parts = preg_split( '/\s+/', $initial_viewbox );
$initial_vb_w     = isset( $initial_vb_parts[2] ) ? (float) $initial_vb_parts[2] : 800;
$pin_radius       = $initial_vb_w / 100;

$coastline_path = require __DIR__ . '/coastline-path-data.php';

$landmarks = array(
	array( 'x' => 420, 'y' => 100, 'label' => 'Labrador' ),
	array( 'x' => 100, 'y' => 655, 'label' => 'New England' ),
	array( 'x' => 130, 'y' => 970, 'label' => 'Cape Hatteras' ),
);

$wrapper_attributes = get_block_wrapper_attributes( array(
	'class'       => 'donation-map',
	'data-config' => wp_json_encode( $config ),
) );
?>
<figure <?php echo $wrapper_attributes; ?>>
	<div class="donation-map__svg-container">
		<svg
			class="donation-map__svg"
			viewBox="<?php echo esc_attr( $initial_viewbox ); ?>"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="<?php echo esc_attr( $config['mapImageAlt'] ?: __( 'Map of the East Coast lobster range with donation origin pins', 'ngn-demo' ) ); ?>"
			preserveAspectRatio="xMidYMid meet"
		>
			<?php if ( $has_custom_image ) : ?>
				<image
					class="donation-map__custom-image"
					href="<?php echo esc_url( $config['mapImageUrl'] ); ?>"
					x="0"
					y="0"
					width="800"
					height="992"
					preserveAspectRatio="xMidYMid meet"
				/>
			<?php else : ?>
				<path class="donation-map__coast" d="<?php echo esc_attr( $coastline_path ); ?>" fill="none" />
				<g class="donation-map__landmarks" data-faded="<?php echo ( $initial_vb_w < 200 ) ? 'true' : 'false'; ?>">
					<?php foreach ( $landmarks as $landmark ) : ?>
						<text
							class="donation-map__landmark"
							x="<?php echo esc_attr( $landmark['x'] ); ?>"
							y="<?php echo esc_attr( $landmark['y'] ); ?>"
						><?php echo esc_html( $landmark['label'] ); ?></text>
					<?php endforeach; ?>
				</g>
			<?php endif; ?>
			<?php foreach ( $config['pins'] as $pin ) : ?>
				<g
					class="donation-map__pin<?php echo ( ! empty( $pin['isPlaceholder'] ) ) ? ' is-placeholder' : ''; ?>"
					transform="translate(<?php echo esc_attr( $pin['svgX'] ?? 0 ); ?> <?php echo esc_attr( $pin['svgY'] ?? 0 ); ?>)"
				>
					<?php // Halo multiplier (3.5) matches PIN_HALO_MULT in view.js. ?>
					<circle class="donation-map__pin-halo" r="<?php echo esc_attr( $pin_radius * 3.5 ); ?>" />
					<circle class="donation-map__pin-dot" r="<?php echo esc_attr( $pin_radius ); ?>" />
				</g>
			<?php endforeach; ?>
		</svg>
	</div>
	<noscript>
		<ul class="donation-map__pin-list">
			<?php foreach ( $config['pins'] as $pin ) : ?>
				<?php if ( ! empty( $pin['isPlaceholder'] ) ) {
					continue;
				} ?>
				<li>
					<strong><?php echo esc_html( $pin['lobsterName'] ?? '' ); ?></strong>
					<?php if ( ! empty( $pin['lobsterType'] ) ) : ?>
						(<?php echo esc_html( $pin['lobsterType'] ); ?>)
					<?php endif; ?>
					— <?php esc_html_e( 'donated by', 'ngn-demo' ); ?>
					<?php echo esc_html( $pin['donor'] ?? '' ); ?>
					<?php if ( ! empty( $pin['donorBusiness'] ) ) : ?>
						<?php echo esc_html( __( 'of', 'ngn-demo' ) ); ?>
						<?php echo esc_html( $pin['donorBusiness'] ); ?>,
					<?php endif; ?>
					<?php echo esc_html( $pin['locationName'] ?? '' ); ?>,
					<?php echo esc_html( $pin['donationDate'] ?? '' ); ?>.
					<?php if ( ! empty( $pin['rarity'] ) ) : ?>
						<em>Rarity: <?php echo esc_html( $pin['rarity'] ); ?></em>
					<?php endif; ?>
				</li>
			<?php endforeach; ?>
		</ul>
	</noscript>
	<figcaption class="donation-map__note"><?php echo wp_kses_post( $config['rangeNote'] ); ?></figcaption>
</figure>
