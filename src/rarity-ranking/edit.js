import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	Button,
	TextControl,
} from '@wordpress/components';
import { useState } from 'react';

import './editor.scss';

const iconUp = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
	>
		<path
			d="M6 15l6-6 6 6"
			stroke="currentColor"
			strokeWidth="2"
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const iconDown = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
	>
		<path
			d="M6 9l6 6 6-6"
			stroke="currentColor"
			strokeWidth="2"
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const iconRemove = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
	>
		<path
			d="M6 6l12 12M18 6L6 18"
			stroke="currentColor"
			strokeWidth="2"
			fill="none"
			strokeLinecap="round"
		/>
	</svg>
);

export default function Edit( { attributes, setAttributes } ) {
	const { headline, subheadline, items } = attributes;

	const [ previewExpanded, setPreviewExpanded ] = useState( false );

	const updateItem = ( index, key, value ) => {
		const next = items.map( ( item, i ) =>
			i === index ? { ...item, [ key ]: value } : item
		);
		setAttributes( { items: next } );
	};

	const moveItem = ( from, to ) => {
		if ( to < 0 || to >= items.length ) {
			return;
		}
		const next = [ ...items ];
		const [ moved ] = next.splice( from, 1 );
		next.splice( to, 0, moved );
		setAttributes( { items: next } );
	};

	const addItem = () => {
		const maxId = items.reduce( ( max, item ) => {
			const n = parseInt(
				String( item.id ).replace( /\D/g, '' ),
				10
			);
			return Number.isFinite( n ) && n > max ? n : max;
		}, 0 );
		setAttributes( {
			items: [
				...items,
				{
					id: `item-${ maxId + 1 }`,
					name: '',
					typeLabel: '',
					rarityStat: '',
					imageUrl: '',
					imageAlt: '',
					donor: '',
					donorContext: '',
					donationDate: '',
					expandedNote: '',
				},
			],
		} );
	};

	const removeItem = ( index ) => {
		setAttributes( { items: items.filter( ( _, i ) => i !== index ) } );
	};

	const blockProps = useBlockProps( {
		className: 'rarity-ranking',
		'data-static-preview': 'true',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __(
						'Display options',
						'ngn-demo'
					) }
					initialOpen={ true }
				>
					<ToggleControl
						label={ __(
							'Preview expanded state',
							'ngn-demo'
						) }
						help={ __(
							'Show all rows expanded so you can edit the donor and expanded note fields.',
							'ngn-demo'
						) }
						checked={ previewExpanded }
						onChange={ setPreviewExpanded }
					/>
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<header className="rarity-ranking__header">
					<RichText
						tagName="h2"
						className="rarity-ranking__headline"
						value={ headline }
						onChange={ ( v ) =>
							setAttributes( { headline: v } )
						}
						placeholder={ __(
							'Headline…',
							'ngn-demo'
						) }
					/>
					<RichText
						tagName="p"
						className="rarity-ranking__subheadline"
						value={ subheadline }
						onChange={ ( v ) =>
							setAttributes( { subheadline: v } )
						}
						placeholder={ __(
							'Subheadline…',
							'ngn-demo'
						) }
					/>
				</header>

				<ol className="rarity-ranking__list">
					{ items.map( ( item, index ) => (
						<li
							key={ item.id }
							className="rarity-ranking__row"
							data-expanded={
								previewExpanded ? 'true' : 'false'
							}
						>
							<div className="rarity-ranking__row-controls">
								<Button
									icon={ iconUp }
									label={ __(
										'Move up',
										'ngn-demo'
									) }
									onClick={ () =>
										moveItem( index, index - 1 )
									}
									disabled={ index === 0 }
								/>
								<Button
									icon={ iconDown }
									label={ __(
										'Move down',
										'ngn-demo'
									) }
									onClick={ () =>
										moveItem( index, index + 1 )
									}
									disabled={
										index === items.length - 1
									}
								/>
								<Button
									icon={ iconRemove }
									isDestructive
									label={ __(
										'Remove ranking item',
										'ngn-demo'
									) }
									className="rarity-ranking__remove"
									onClick={ () => removeItem( index ) }
								/>
							</div>

							<div className="rarity-ranking__image">
								<MediaUploadCheck>
									<MediaUpload
										onSelect={ ( media ) => {
											// Always take the new media's alt
											// (or empty if missing) — never
											// carry forward the previous
											// image's alt, which would be
											// silently wrong for the new image.
											const next = items.map(
												( it, i ) =>
													i === index
														? {
																...it,
																imageUrl:
																	media.url,
																imageAlt:
																	media.alt ||
																	'',
														  }
														: it
											);
											setAttributes( {
												items: next,
											} );
										} }
										allowedTypes={ [ 'image' ] }
										value={ item.imageUrl }
										render={ ( { open } ) =>
											item.imageUrl ? (
												<button
													type="button"
													className="rarity-ranking__image-button"
													onClick={ open }
													aria-label={ __(
														'Replace image',
														'ngn-demo'
													) }
												>
													<img
														src={
															item.imageUrl
														}
														alt={
															item.imageAlt
														}
													/>
													<span className="rarity-ranking__image-replace">
														{ __(
															'Replace',
															'ngn-demo'
														) }
													</span>
												</button>
											) : (
												<button
													type="button"
													className="rarity-ranking__image-placeholder"
													onClick={ open }
												>
													{ __(
														'+ Add image',
														'ngn-demo'
													) }
												</button>
											)
										}
									/>
								</MediaUploadCheck>
								{ item.imageUrl && (
									<TextControl
										__nextHasNoMarginBottom
										className="rarity-ranking__image-alt"
										label={ __(
											'Image alt text',
											'ngn-demo'
										) }
										value={ item.imageAlt || '' }
										onChange={ ( v ) =>
											updateItem(
												index,
												'imageAlt',
												v
											)
										}
									/>
								) }
							</div>

							<div className="rarity-ranking__content">
								<RichText
									tagName="div"
									className="rarity-ranking__type"
									value={ item.typeLabel }
									onChange={ ( v ) =>
										updateItem(
											index,
											'typeLabel',
											v
										)
									}
									placeholder={ __(
										'Type',
										'ngn-demo'
									) }
								/>
								<RichText
									tagName="div"
									className="rarity-ranking__stat"
									value={ item.rarityStat }
									onChange={ ( v ) =>
										updateItem(
											index,
											'rarityStat',
											v
										)
									}
									placeholder={ __(
										'Rarity stat',
										'ngn-demo'
									) }
								/>
							</div>

							{ previewExpanded && (
								<div
									className="rarity-ranking__expanded"
									data-open="true"
								>
									<div className="rarity-ranking__expanded-inner">
										<div className="rarity-ranking__expanded-content">
									<div className="rarity-ranking__donor-row">
										<span className="rarity-ranking__field-label">
											{ __(
												'Donated by',
												'ngn-demo'
											) }
										</span>
										<RichText
											tagName="span"
											className="rarity-ranking__donor"
											value={ item.donor }
											onChange={ ( v ) =>
												updateItem(
													index,
													'donor',
													v
												)
											}
											placeholder={ __(
												'Donor name',
												'ngn-demo'
											) }
										/>
										<RichText
											tagName="span"
											className="rarity-ranking__donor-context"
											value={ item.donorContext }
											onChange={ ( v ) =>
												updateItem(
													index,
													'donorContext',
													v
												)
											}
											placeholder={ __(
												'Donor context',
												'ngn-demo'
											) }
										/>
									</div>
									<RichText
										tagName="div"
										className="rarity-ranking__donation-date"
										value={ item.donationDate }
										onChange={ ( v ) =>
											updateItem(
												index,
												'donationDate',
												v
											)
										}
										placeholder={ __(
											'Donation date',
											'ngn-demo'
										) }
									/>
									<RichText
										tagName="div"
										className="rarity-ranking__expanded-note"
										value={ item.expandedNote }
										onChange={ ( v ) =>
											updateItem(
												index,
												'expandedNote',
												v
											)
										}
										placeholder={ __(
											'Expanded note…',
											'ngn-demo'
										) }
									/>
										</div>
									</div>
								</div>
							) }
						</li>
					) ) }
				</ol>

				<Button
					variant="secondary"
					className="rarity-ranking__add"
					onClick={ addItem }
				>
					{ __( '+ Add ranking item', 'ngn-demo' ) }
				</Button>
			</section>
		</>
	);
}
