/**
 * Frontend hydration entry point for the Rarity Ranking block.
 *
 * Replaces the static server-rendered markup with an interactive
 * React component supporting click-to-expand rows.
 */

import { useEffect, useRef, useState } from 'react';

import { hydrateBlock } from '../_shared/hydrate-block';
import { splitDonorContext } from './utils';

function RarityRankingInteractive( { headline, subheadline, items } ) {
	const [ expandedId, setExpandedId ] = useState( null );
	// Track where each row's mousedown happened so click handlers can ignore
	// drags (text selection, scroll-with-trackpad, etc.) that happen to end
	// inside the same row.
	const mouseDownPosRef = useRef( null );

	const toggle = ( id ) => {
		setExpandedId( ( current ) => ( current === id ? null : id ) );
	};

	// Esc collapses any open row.
	useEffect( () => {
		const onKey = ( e ) => {
			if ( e.key === 'Escape' ) {
				setExpandedId( null );
			}
		};
		document.addEventListener( 'keydown', onKey );
		return () => document.removeEventListener( 'keydown', onKey );
	}, [] );

	return (
		<>
			<header className="rarity-ranking__header">
				<h2
					className="rarity-ranking__headline"
					dangerouslySetInnerHTML={ { __html: headline } }
				/>
				<p
					className="rarity-ranking__subheadline"
					dangerouslySetInnerHTML={ { __html: subheadline } }
				/>
			</header>

			<ol className="rarity-ranking__list">
				{ items.map( ( item ) => {
					const isExpanded = expandedId === item.id;
					const expandedRegionId = `rarity-expanded-${ item.id }`;
					const hasExpandable = Boolean(
						item.donor ||
							item.donorContext ||
							item.donationDate ||
							item.expandedNote
					);

					const handleKey = ( e ) => {
						if ( ! hasExpandable ) return;
						if ( e.key === 'Enter' || e.key === ' ' ) {
							e.preventDefault();
							toggle( item.id );
						}
					};
					const handleMouseDown = ( e ) => {
						mouseDownPosRef.current = {
							x: e.clientX,
							y: e.clientY,
						};
					};
					const handleClick = ( e ) => {
						if ( ! hasExpandable ) return;
						// Don't toggle if the click landed on something
						// independently interactive (links, buttons, form
						// controls inside the expanded panel).
						if (
							e.target.closest(
								'a, button, input, textarea, select, [contenteditable="true"]'
							)
						) {
							return;
						}
						// Don't toggle if the user was dragging (text
						// selection, accidental drag) — measured as a
						// movement of >4px between mousedown and mouseup.
						const start = mouseDownPosRef.current;
						if ( start ) {
							const dx = Math.abs( e.clientX - start.x );
							const dy = Math.abs( e.clientY - start.y );
							if ( dx > 4 || dy > 4 ) {
								mouseDownPosRef.current = null;
								return;
							}
						}
						mouseDownPosRef.current = null;
						toggle( item.id );
					};
					return (
						<li
							key={ item.id }
							className="rarity-ranking__row"
							data-expanded={
								isExpanded ? 'true' : 'false'
							}
							onMouseDown={
								hasExpandable ? handleMouseDown : undefined
							}
							onClick={ handleClick }
							onKeyDown={ handleKey }
							role={ hasExpandable ? 'button' : undefined }
							tabIndex={ hasExpandable ? 0 : undefined }
							aria-expanded={
								hasExpandable ? isExpanded : undefined
							}
							aria-controls={
								hasExpandable ? expandedRegionId : undefined
							}
						>
							<span className="rarity-ranking__image">
								{ item.imageUrl && (
									<img
										src={ item.imageUrl }
										alt={ item.imageAlt || '' }
									/>
								) }
							</span>
							<span className="rarity-ranking__content">
								<span
									className="rarity-ranking__type"
									dangerouslySetInnerHTML={ {
										__html: item.typeLabel || '',
									} }
								/>
								<span
									className="rarity-ranking__stat"
									dangerouslySetInnerHTML={ {
										__html:
											item.rarityStat || '',
									} }
								/>
							</span>

							{ hasExpandable && (
								<div
									id={ expandedRegionId }
									className="rarity-ranking__expanded"
									data-open={
										isExpanded ? 'true' : 'false'
									}
								>
									<div className="rarity-ranking__expanded-inner">
										<div className="rarity-ranking__expanded-content">
										{ ( () => {
											const { context, location } =
												splitDonorContext(
													item.donorContext
												);
											return (
												<>
													{ item.donor && (
														<div className="rarity-ranking__donor-row">
															<span className="rarity-ranking__field-label">
																Donated by
															</span>
															<span
																className="rarity-ranking__donor"
																dangerouslySetInnerHTML={ {
																	__html:
																		item.donor,
																} }
															/>
															{ context && (
																<span
																	className="rarity-ranking__donor-context"
																	dangerouslySetInnerHTML={ {
																		__html: context,
																	} }
																/>
															) }
														</div>
													) }
													{ ( item.donationDate ||
														location ) && (
														<div className="rarity-ranking__donation-date">
															{ item.donationDate && (
																<span
																	dangerouslySetInnerHTML={ {
																		__html:
																			item.donationDate,
																	} }
																/>
															) }
															{ item.donationDate &&
																location && (
																	<span className="rarity-ranking__date-sep">
																		·
																	</span>
																) }
															{ location && (
																<span
																	className="rarity-ranking__location"
																	dangerouslySetInnerHTML={ {
																		__html: location,
																	} }
																/>
															) }
														</div>
													) }
												</>
											);
										} )() }
										{ item.expandedNote && (
											<div
												className="rarity-ranking__expanded-note"
												dangerouslySetInnerHTML={ {
													__html:
														item.expandedNote,
												} }
											/>
										) }
										</div>
									</div>
								</div>
							) }
						</li>
					);
				} ) }
			</ol>
		</>
	);
}

hydrateBlock( {
	selector: '.rarity-ranking[data-config]',
	blockName: 'rarity-ranking',
	render: ( config ) => <RarityRankingInteractive { ...config } />,
} );
