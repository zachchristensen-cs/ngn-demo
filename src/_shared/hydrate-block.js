/**
 * Shared frontend hydration entry point for ngn/* blocks.
 *
 * Each block's render.php emits a wrapper element with `data-config` (a
 * JSON-encoded payload) and a known class name. This helper finds every
 * such wrapper, parses the config, blanks the static SSR markup, and
 * mounts a React tree provided by the caller — consolidating the boilerplate
 * (mounted-once guard, JSON parse error handling, DOMContentLoaded gating)
 * that used to live in every block's view.js.
 *
 * Note: we intentionally use `createRoot` + `innerHTML = ''` rather than
 * `hydrateRoot`. The SSR markup and the React tree are not byte-identical
 * (the React version uses different DOM shapes for interactive affordances),
 * so attempting hydration would log mismatch warnings. Replacing the SSR
 * costs one extra paint but keeps the rendering paths independent.
 */

import { createRoot } from 'react-dom/client';

/**
 * @param {Object}   options
 * @param {string}   options.selector  CSS selector for the wrappers to mount.
 * @param {string}   options.blockName Short name used in error logs.
 * @param {Function} options.render    (config) => ReactNode; called per wrapper.
 */
export function hydrateBlock( { selector, blockName, render } ) {
	const mount = () => {
		const containers = document.querySelectorAll( selector );
		containers.forEach( ( container ) => {
			if ( container.dataset.mounted === 'true' ) {
				return;
			}
			let config;
			try {
				config = JSON.parse( container.dataset.config );
			} catch ( e ) {
				// eslint-disable-next-line no-console
				console.warn(
					`${ blockName }: failed to parse data-config`,
					e
				);
				return;
			}
			container.innerHTML = '';
			container.dataset.mounted = 'true';
			const root = createRoot( container );
			root.render( render( config ) );
		} );
	};

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', mount );
	} else {
		mount();
	}
}
