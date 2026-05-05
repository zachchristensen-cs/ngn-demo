<?php
/**
 * Server-side render for the Rarity Ranking block.
 *
 * Outputs a fully-static, readable version of the ranking. view.js
 * progressively enhances this into an interactive expand/collapse component.
 *
 * Every text field is run through wp_kses_post() before being emitted as
 * HTML *or* embedded in the data-config JSON. The JSON values are rendered
 * by view.js via dangerouslySetInnerHTML, so sanitizing here is what makes
 * that safe — without it, a contributor without `unfiltered_html` could
 * smuggle <script> through a RichText field.
 *
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

$kses_text_fields = array(
	'typeLabel',
	'rarityStat',
	'donor',
	'donorContext',
	'donationDate',
	'expandedNote',
);

$raw_items = ( isset( $attributes['items'] ) && is_array( $attributes['items'] ) )
	? array_values( $attributes['items'] )
	: array();

$items = array_map(
	static function ( $item ) use ( $kses_text_fields ) {
		if ( ! is_array( $item ) ) {
			return array();
		}
		foreach ( $kses_text_fields as $field ) {
			$item[ $field ] = isset( $item[ $field ] ) ? wp_kses_post( (string) $item[ $field ] ) : '';
		}
		// imageAlt is a plain attribute — strip all tags, don't allow HTML.
		$item['imageAlt'] = isset( $item['imageAlt'] ) ? wp_strip_all_tags( (string) $item['imageAlt'] ) : '';
		// imageUrl is escaped at output sites; leave raw here so esc_url runs once.
		$item['imageUrl'] = isset( $item['imageUrl'] ) ? (string) $item['imageUrl'] : '';
		$item['id']       = isset( $item['id'] ) ? (string) $item['id'] : '';
		$item['name']     = isset( $item['name'] ) ? wp_kses_post( (string) $item['name'] ) : '';
		return $item;
	},
	$raw_items
);

$config = array(
	'headline'    => isset( $attributes['headline'] ) ? wp_kses_post( (string) $attributes['headline'] ) : '',
	'subheadline' => isset( $attributes['subheadline'] ) ? wp_kses_post( (string) $attributes['subheadline'] ) : '',
	'items'       => $items,
);

$wrapper_attributes = get_block_wrapper_attributes( array(
	'class'       => 'rarity-ranking',
	'data-config' => wp_json_encode( $config ),
) );

/**
 * Splits "Lobster boat captain, Nahant" into ["Lobster boat captain", "Nahant"].
 * Matches the splitDonorContext() helper in view.js so the SSR markup and the
 * hydrated React markup display the same shape.
 */
$split_donor_context = static function ( $raw ) {
	$value = trim( (string) $raw );
	if ( '' === $value ) {
		return array( 'context' => '', 'location' => '' );
	}
	$idx = strrpos( $value, ',' );
	if ( false === $idx ) {
		return array( 'context' => $value, 'location' => '' );
	}
	return array(
		'context'  => trim( substr( $value, 0, $idx ) ),
		'location' => trim( substr( $value, $idx + 1 ) ),
	);
};
?>
<section <?php echo $wrapper_attributes; ?>>
	<header class="rarity-ranking__header">
		<h2 class="rarity-ranking__headline"><?php echo $config['headline']; // already kses'd ?></h2>
		<p class="rarity-ranking__subheadline"><?php echo $config['subheadline']; // already kses'd ?></p>
	</header>

	<ol class="rarity-ranking__list">
		<?php foreach ( $config['items'] as $item ) :
			$has_expandable = ! empty( $item['donor'] )
				|| ! empty( $item['donorContext'] )
				|| ! empty( $item['donationDate'] )
				|| ! empty( $item['expandedNote'] );
			$donor_split = $split_donor_context( $item['donorContext'] ?? '' );
		?>
			<li class="rarity-ranking__row" data-expanded="false">
				<span class="rarity-ranking__image">
					<?php if ( ! empty( $item['imageUrl'] ) ) : ?>
						<img
							src="<?php echo esc_url( $item['imageUrl'] ); ?>"
							alt="<?php echo esc_attr( $item['imageAlt'] ); ?>"
						/>
					<?php endif; ?>
				</span>
				<span class="rarity-ranking__content">
					<span class="rarity-ranking__type"><?php echo $item['typeLabel']; // already kses'd ?></span>
					<span class="rarity-ranking__stat"><?php echo $item['rarityStat']; // already kses'd ?></span>
				</span>

				<?php if ( $has_expandable ) : ?>
					<div class="rarity-ranking__expanded" data-open="true">
						<div class="rarity-ranking__expanded-inner">
							<div class="rarity-ranking__expanded-content">
								<?php if ( ! empty( $item['donor'] ) ) : ?>
									<div class="rarity-ranking__donor-row">
										<span class="rarity-ranking__field-label"><?php esc_html_e( 'Donated by', 'ngn-demo' ); ?></span>
										<span class="rarity-ranking__donor"><?php echo $item['donor']; // already kses'd ?></span>
										<?php if ( ! empty( $donor_split['context'] ) ) : ?>
											<span class="rarity-ranking__donor-context"><?php echo wp_kses_post( $donor_split['context'] ); ?></span>
										<?php endif; ?>
									</div>
								<?php endif; ?>
								<?php if ( ! empty( $item['donationDate'] ) || ! empty( $donor_split['location'] ) ) : ?>
									<div class="rarity-ranking__donation-date">
										<?php if ( ! empty( $item['donationDate'] ) ) : ?>
											<span><?php echo $item['donationDate']; // already kses'd ?></span>
										<?php endif; ?>
										<?php if ( ! empty( $item['donationDate'] ) && ! empty( $donor_split['location'] ) ) : ?>
											<span class="rarity-ranking__date-sep">·</span>
										<?php endif; ?>
										<?php if ( ! empty( $donor_split['location'] ) ) : ?>
											<span class="rarity-ranking__location"><?php echo wp_kses_post( $donor_split['location'] ); ?></span>
										<?php endif; ?>
									</div>
								<?php endif; ?>
								<?php if ( ! empty( $item['expandedNote'] ) ) : ?>
									<div class="rarity-ranking__expanded-note"><?php echo $item['expandedNote']; // already kses'd ?></div>
								<?php endif; ?>
							</div>
						</div>
					</div>
				<?php endif; ?>
			</li>
		<?php endforeach; ?>
	</ol>
</section>
