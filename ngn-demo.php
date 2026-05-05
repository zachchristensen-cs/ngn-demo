<?php
/**
 * Plugin Name:       NGN Demo
 * Description:       Example block scaffolded with Create Block tool.
 * Version:           0.1.0
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ngn-demo
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function ngn_register_blocks() {
	$build_dir = __DIR__ . '/build';

	if ( ! is_dir( $build_dir ) ) {
		return;
	}

	foreach ( scandir( $build_dir ) as $entry ) {
		if ( '.' === $entry || '..' === $entry ) {
			continue;
		}

		$block_dir = $build_dir . '/' . $entry;

		if ( is_dir( $block_dir ) && file_exists( $block_dir . '/block.json' ) ) {
			register_block_type( $block_dir );
		}
	}
}
add_action( 'init', 'ngn_register_blocks' );

/**
 * Returns true if the given post should have its built-in title suppressed
 * because it contains a block that already renders its own headline.
 *
 * Add more block names to the list (or filter via `ngn_title_suppressing_blocks`)
 * if you build other hero-style blocks later.
 */
function ngn_post_has_hero_block( $post_id ) {
	if ( ! $post_id ) {
		return false;
	}
	$blocks = apply_filters(
		'ngn_title_suppressing_blocks',
		array( 'ngn/hero' )
	);
	foreach ( $blocks as $block_name ) {
		if ( has_block( $block_name, $post_id ) ) {
			return true;
		}
	}
	return false;
}

/**
 * Block-theme path: empty out the `core/post-title` block when the post
 * uses a hero. Runs at render time so other consumers of post_title
 * (RSS, browser tab, breadcrumbs, post lists, SEO) keep the real title.
 */
add_filter( 'render_block', function( $block_content, $block ) {
	if ( empty( $block['blockName'] ) || 'core/post-title' !== $block['blockName'] ) {
		return $block_content;
	}
	if ( ! is_singular() ) {
		return $block_content;
	}
	if ( ngn_post_has_hero_block( get_the_ID() ) ) {
		return '';
	}
	return $block_content;
}, 10, 2 );

/**
 * Classic-template path: blank the title only when it's being rendered as
 * the main article heading on the single-post page. The triple guard
 * (is_singular + in_the_loop + is_main_query) is what prevents the filter
 * from blanking titles in nav menus, related posts, browser tab, etc.
 */
add_filter( 'the_title', function( $title, $id = null ) {
	if ( is_admin() ) {
		return $title;
	}
	if ( ! is_singular() || ! in_the_loop() || ! is_main_query() ) {
		return $title;
	}
	if ( ngn_post_has_hero_block( $id ) ) {
		return '';
	}
	return $title;
}, 10, 2 );

/**
 * Add a `has-hero-block` body class on single posts that contain a hero.
 * The hero block's stylesheet uses this to suppress empty wrappers and
 * spacing left behind by the template's now-suppressed post title.
 */
add_filter( 'body_class', function( $classes ) {
	if ( ! is_admin() && is_singular() && ngn_post_has_hero_block( get_the_ID() ) ) {
		$classes[] = 'has-hero-block';
	}
	return $classes;
} );
