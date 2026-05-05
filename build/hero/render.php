<?php
/**
 * Server-side render for the Hero block.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

$image_url   = isset( $attributes['imageUrl'] ) ? $attributes['imageUrl'] : '';
$image_alt   = isset( $attributes['imageAlt'] ) ? $attributes['imageAlt'] : '';
$focal_point = isset( $attributes['focalPoint'] ) && is_array( $attributes['focalPoint'] )
	? $attributes['focalPoint']
	: array( 'x' => 0.5, 'y' => 0.5 );
$min_height  = isset( $attributes['minHeight'] ) ? (int) $attributes['minHeight'] : 70;

$overlay_type    = isset( $attributes['overlayType'] ) ? $attributes['overlayType'] : 'color';
// Default kept in sync with block.json's `overlayColor` default.
$overlay_color   = isset( $attributes['overlayColor'] ) ? $attributes['overlayColor'] : 'rgba(0, 0, 0, 0.5)';
$overlay_opacity = isset( $attributes['overlayOpacity'] ) ? (float) $attributes['overlayOpacity'] : 1;

$gradient = isset( $attributes['overlayGradient'] ) && is_array( $attributes['overlayGradient'] )
	? $attributes['overlayGradient']
	: array();

/**
 * Tight allow-list for any color string we're about to drop into a
 * `style="background:..."` attribute. Limits the surface to recognized
 * color forms (hex, rgb/rgba, hsl/hsla, named "transparent"); anything
 * else is replaced with `transparent` so a malformed or hostile value
 * can't smuggle CSS expressions into the page.
 */
$is_safe_css_color = static function ( $value ) {
	if ( ! is_string( $value ) ) {
		return false;
	}
	$value = trim( $value );
	if ( '' === $value ) {
		return false;
	}
	if ( 'transparent' === strtolower( $value ) ) {
		return true;
	}
	if ( preg_match( '/^#[0-9a-f]{3,8}$/i', $value ) ) {
		return true;
	}
	// rgb(), rgba(), hsl(), hsla() with digits, dots, commas, %, /, spaces.
	if ( preg_match( '/^(rgba?|hsla?)\(\s*[0-9.,%\/\s\-]+\s*\)$/i', $value ) ) {
		return true;
	}
	return false;
};

$safe_color = static function ( $value ) use ( $is_safe_css_color ) {
	return $is_safe_css_color( $value ) ? $value : 'transparent';
};

$build_gradient = static function ( $g ) use ( $safe_color ) {
	$angle = isset( $g['angle'] ) ? (float) $g['angle'] : 180;
	// Clamp angle to CSS's accepted range; values outside [0, 360] are
	// permitted by the spec but admin input can drift well past that.
	$angle = max( -360.0, min( 720.0, $angle ) );
	$stops = isset( $g['stops'] ) && is_array( $g['stops'] ) ? $g['stops'] : array();
	if ( empty( $stops ) ) {
		return 'transparent';
	}
	usort( $stops, static function ( $a, $b ) {
		$ap = isset( $a['position'] ) ? (float) $a['position'] : 0;
		$bp = isset( $b['position'] ) ? (float) $b['position'] : 0;
		return $ap <=> $bp;
	} );
	$parts = array();
	foreach ( $stops as $stop ) {
		$color = $safe_color( $stop['color'] ?? '' );
		$pos   = isset( $stop['position'] ) ? (float) $stop['position'] : 0;
		// Clamp stop positions to the [0, 100] CSS percentage range so
		// out-of-range admin input can't yield a gradient string the
		// browser silently ignores.
		$pos   = max( 0.0, min( 100.0, $pos ) );
		$parts[] = $color . ' ' . $pos . '%';
	}
	return 'linear-gradient(' . $angle . 'deg, ' . implode( ', ', $parts ) . ')';
};

$overlay_css = ( 'gradient' === $overlay_type )
	? $build_gradient( $gradient )
	: $safe_color( $overlay_color );

$focal_x = isset( $focal_point['x'] ) ? (float) $focal_point['x'] : 0.5;
$focal_y = isset( $focal_point['y'] ) ? (float) $focal_point['y'] : 0.5;

$byline_name      = isset( $attributes['bylineAuthorName'] ) ? trim( (string) $attributes['bylineAuthorName'] ) : '';
$byline_image_url = isset( $attributes['bylineAuthorImageUrl'] ) ? (string) $attributes['bylineAuthorImageUrl'] : '';
$byline_image_alt = isset( $attributes['bylineAuthorImageAlt'] ) ? (string) $attributes['bylineAuthorImageAlt'] : '';
$byline_use_post  = isset( $attributes['bylineUsePostDate'] ) ? (bool) $attributes['bylineUsePostDate'] : true;
$byline_date_raw  = isset( $attributes['bylineDate'] ) ? trim( (string) $attributes['bylineDate'] ) : '';
// get_the_date() returns false outside the loop (e.g. in template editor
// previews). Cast to string so the equality check below is well-defined.
$byline_date      = $byline_use_post ? (string) get_the_date() : $byline_date_raw;
$has_byline       = $byline_name !== '' || $byline_date !== '' || $byline_image_url !== '';

$image_credit = isset( $attributes['imageCredit'] ) ? trim( (string) $attributes['imageCredit'] ) : '';

// Always emit `alignfull` so the block breaks out of any constrained layout
// (e.g. when the template's content width has been narrowed in Site Editor).
// supports.align in block.json keeps "full" / "wide" available in the toolbar
// for editors who want to override, but the default render is full-bleed.
$wrapper_attributes = get_block_wrapper_attributes( array(
	'class' => 'hero-block alignfull',
	'style' => 'min-height:' . $min_height . 'vh;',
) );
?>
<div <?php echo $wrapper_attributes; ?>>
	<?php if ( $image_url ) : ?>
		<?php
		// When alt text is empty the image is decorative; emitting role="img"
		// with an empty aria-label is an a11y anti-pattern (announces "graphic"
		// with no name). Drop the role in that case.
		$image_attrs = sprintf(
			'class="hero-block__image" style="background-image:url(%s);background-position:%s;"',
			esc_url( $image_url ),
			esc_attr( ( $focal_x * 100 ) . '% ' . ( $focal_y * 100 ) . '%' )
		);
		if ( '' !== $image_alt ) {
			$image_attrs .= sprintf(
				' role="img" aria-label="%s"',
				esc_attr( $image_alt )
			);
		}
		?>
		<div <?php echo $image_attrs; ?>></div>
	<?php endif; ?>
	<div
		class="hero-block__overlay"
		aria-hidden="true"
		style="background:<?php echo esc_attr( $overlay_css ); ?>;opacity:<?php echo esc_attr( $overlay_opacity ); ?>;"
	></div>
	<div class="hero-block__content">
		<?php echo $content; ?>

		<?php if ( $has_byline ) : ?>
			<div class="hero-block__byline">
				<?php if ( $byline_image_url ) : ?>
					<img
						class="hero-block__byline-avatar"
						src="<?php echo esc_url( $byline_image_url ); ?>"
						alt="<?php echo esc_attr( $byline_image_alt ); ?>"
					/>
				<?php endif; ?>
				<div class="hero-block__byline-text">
					<?php if ( $byline_name ) : ?>
						<div class="hero-block__byline-author">
							<span class="hero-block__byline-by"><?php esc_html_e( 'by', 'ngn-demo' ); ?></span>
							<span class="hero-block__byline-name"><?php echo esc_html( $byline_name ); ?></span>
						</div>
					<?php endif; ?>
					<?php if ( $byline_date ) : ?>
						<div class="hero-block__byline-date"><?php echo esc_html( $byline_date ); ?></div>
					<?php endif; ?>
				</div>
			</div>
		<?php endif; ?>
	</div>

	<?php if ( $image_credit ) : ?>
		<div class="hero-block__credit"><?php echo esc_html( $image_credit ); ?></div>
	<?php endif; ?>
</div>
