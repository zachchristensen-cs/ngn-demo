import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextareaControl,
	TextControl,
	ToggleControl,
	Button,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { useState } from 'react';

import {
	MapMarkup,
	RANGE_VIEWBOX,
	DONATIONS_VIEWBOX,
	COORDINATE_HELP,
} from './map-svg';

import './editor.scss';

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

function PinDot( { pin, isSelected, pinR, onClick } ) {
	return (
		<g
			className={ `donation-map__pin${
				pin.isPlaceholder ? ' is-placeholder' : ''
			}${ isSelected ? ' is-selected' : '' }` }
			transform={ `translate(${ pin.svgX } ${ pin.svgY })` }
			onClick={ onClick }
		>
			<circle className="donation-map__pin-halo" r={ pinR * 3.5 } />
			<circle className="donation-map__pin-dot" r={ pinR } />
		</g>
	);
}

function parseVB( s ) {
	const parts = String( s || '' ).trim().split( /\s+/ ).map( Number );
	if ( parts.length === 4 && parts.every( ( n ) => Number.isFinite( n ) ) ) {
		return parts;
	}
	return parseVB( '0 0 800 992' );
}

function formatVB( arr ) {
	return arr.map( ( n ) => Math.round( n * 100 ) / 100 ).join( ' ' );
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		pins,
		rangeNote,
		defaultViewBox,
		mapImageId,
		mapImageUrl,
		mapImageAlt,
	} = attributes;

	const [ openPinId, setOpenPinId ] = useState( null );
	const [ expandedRowId, setExpandedRowId ] = useState( null );

	const vb = parseVB( defaultViewBox );

	const updateVbPart = ( index, value ) => {
		const next = [ ...vb ];
		next[ index ] = parseFloat( value ) || 0;
		setAttributes( { defaultViewBox: formatVB( next ) } );
	};

	const setVbPreset = ( str ) => {
		setAttributes( { defaultViewBox: str } );
	};

	const updatePin = ( index, key, value ) => {
		const next = pins.map( ( pin, i ) =>
			i === index ? { ...pin, [ key ]: value } : pin
		);
		setAttributes( { pins: next } );
	};

	const addPin = () => {
		const maxId = pins.reduce( ( max, pin ) => {
			const n = parseInt(
				String( pin.id ).replace( /\D/g, '' ),
				10
			);
			return Number.isFinite( n ) && n > max ? n : max;
		}, 0 );

		setAttributes( {
			pins: [
				...pins,
				{
					id: `pin-${ maxId + 1 }`,
					lobsterName: '',
					lobsterType: '',
					locationName: '',
					svgX: 290,
					svgY: 390,
					donor: '',
					donorBusiness: '',
					donationDate: '',
					rarity: '',
					imageUrl: '',
					imageAlt: '',
					isPlaceholder: false,
				},
			],
		} );
	};

	const removePin = ( index ) => {
		setAttributes( { pins: pins.filter( ( _, i ) => i !== index ) } );
	};

	const blockProps = useBlockProps( {
		className: 'donation-map',
		'data-static-preview': 'true',
	} );

	const previewViewBox = formatVB( vb );
	const [ vbX, vbY, vbW, vbH ] = vb;
	const isDonationsView = vbW < 200;

	const selectedPin = pins.find( ( p ) => p.id === openPinId );
	const cardLeftPct = selectedPin
		? ( ( selectedPin.svgX - vbX ) / vbW ) * 100
		: 0;
	const cardTopPct = selectedPin
		? ( ( selectedPin.svgY - vbY ) / vbH ) * 100
		: 0;
	const flip = cardLeftPct > 50;

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Default view', 'ngn-demo' ) }
					initialOpen={ true }
				>
					<p className="donation-map-hint">
						{ __(
							'Sets the viewBox readers see when the block first loads. They can still zoom/pan from there. Edit the four numbers directly, or use a preset.',
							'ngn-demo'
						) }
					</p>

					<div className="donation-map-vb-presets">
						<Button
							variant="secondary"
							onClick={ () =>
								setVbPreset( RANGE_VIEWBOX )
							}
						>
							{ __( 'Full range', 'ngn-demo' ) }
						</Button>
						<Button
							variant="secondary"
							onClick={ () =>
								setVbPreset( DONATIONS_VIEWBOX )
							}
						>
							{ __( 'Donations', 'ngn-demo' ) }
						</Button>
					</div>

					<div className="donation-map-vb-grid">
						<NumberControl
							label="X"
							value={ vbX }
							min={ 0 }
							max={ 800 }
							onChange={ ( v ) => updateVbPart( 0, v ) }
						/>
						<NumberControl
							label="Y"
							value={ vbY }
							min={ 0 }
							max={ 992 }
							onChange={ ( v ) => updateVbPart( 1, v ) }
						/>
						<NumberControl
							label="Width"
							value={ vbW }
							min={ 8 }
							max={ 1100 }
							onChange={ ( v ) => updateVbPart( 2, v ) }
						/>
						<NumberControl
							label="Height"
							value={ vbH }
							min={ 10 }
							max={ 1400 }
							onChange={ ( v ) => updateVbPart( 3, v ) }
						/>
					</div>

					<p className="donation-map-hint">
						{ __(
							'Tip: width/height set zoom level (smaller = more zoomed in). X/Y pan the view (X 0–800, Y 0–992 across the East Coast).',
							'ngn-demo'
						) }
					</p>
				</PanelBody>

				<PanelBody
					title={ __( 'Range note', 'ngn-demo' ) }
					initialOpen={ false }
				>
					<TextareaControl
						label={ __(
							'Caption shown below the map',
							'ngn-demo'
						) }
						value={ rangeNote }
						onChange={ ( value ) =>
							setAttributes( { rangeNote: value } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Map background', 'ngn-demo' ) }
					initialOpen={ false }
				>
					<p className="donation-map-hint">
						{ __(
							'Replaces the default East Coast coastline with an uploaded image. The image is fit to an 800 × 992 SVG canvas — match that aspect ratio (or accept letterboxing) and re-pick pin coordinates against the new background.',
							'ngn-demo'
						) }
					</p>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) =>
								setAttributes( {
									mapImageId: media.id,
									mapImageUrl: media.url,
									mapImageAlt: media.alt || '',
								} )
							}
							allowedTypes={ [ 'image' ] }
							value={ mapImageId }
							render={ ( { open } ) => (
								<div className="donation-map-bg__controls">
									<Button
										variant="secondary"
										onClick={ open }
									>
										{ mapImageUrl
											? __(
													'Replace background',
													'ngn-demo'
											  )
											: __(
													'Upload background',
													'ngn-demo'
											  ) }
									</Button>
									{ mapImageUrl && (
										<Button
											variant="link"
											isDestructive
											onClick={ () =>
												setAttributes( {
													mapImageId: undefined,
													mapImageUrl: '',
													mapImageAlt: '',
												} )
											}
										>
											{ __(
												'Reset to default',
												'ngn-demo'
											) }
										</Button>
									) }
								</div>
							) }
						/>
					</MediaUploadCheck>
					{ mapImageUrl && (
						<TextControl
							label={ __(
								'Background alt text',
								'ngn-demo'
							) }
							help={ __(
								'Describes the map for screen readers. Leave blank to use the default lobster-range description.',
								'ngn-demo'
							) }
							value={ mapImageAlt || '' }
							onChange={ ( v ) =>
								setAttributes( { mapImageAlt: v } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Pins', 'ngn-demo' ) }
					initialOpen={ true }
				>
					<p className="donation-map-hint">
						{ COORDINATE_HELP }
					</p>
					{ pins.map( ( pin, index ) => {
						const isOpen = expandedRowId === pin.id;
						return (
							<div
								key={ pin.id }
								className="donation-map-pin-row"
							>
								<div className="donation-map-pin-row__head">
									<button
										type="button"
										className="donation-map-pin-row__toggle"
										onClick={ () =>
											setExpandedRowId(
												isOpen ? null : pin.id
											)
										}
										aria-expanded={ isOpen }
									>
										{ pin.lobsterName ||
											__(
												'(unnamed pin)',
												'ngn-demo'
											) }
									</button>
									<Button
										icon={ iconRemove }
										isDestructive
										label={ __(
											'Remove pin',
											'ngn-demo'
										) }
										onClick={ () => removePin( index ) }
									/>
								</div>

								{ isOpen && (
									<div className="donation-map-pin-row__body">
										<TextControl
											label={ __(
												'Lobster name',
												'ngn-demo'
											) }
											value={ pin.lobsterName }
											onChange={ ( v ) =>
												updatePin(
													index,
													'lobsterName',
													v
												)
											}
										/>
										<TextControl
											label={ __(
												'Lobster type',
												'ngn-demo'
											) }
											value={ pin.lobsterType }
											onChange={ ( v ) =>
												updatePin(
													index,
													'lobsterType',
													v
												)
											}
										/>
										<TextControl
											label={ __(
												'Location name',
												'ngn-demo'
											) }
											value={ pin.locationName }
											onChange={ ( v ) =>
												updatePin(
													index,
													'locationName',
													v
												)
											}
										/>
										<div className="donation-map-pin-row__coords">
											<NumberControl
												label="X"
												value={ pin.svgX }
												min={ 0 }
												max={ 800 }
												onChange={ ( v ) =>
													updatePin(
														index,
														'svgX',
														parseFloat( v ) ||
															0
													)
												}
											/>
											<NumberControl
												label="Y"
												value={ pin.svgY }
												min={ 0 }
												max={ 992 }
												onChange={ ( v ) =>
													updatePin(
														index,
														'svgY',
														parseFloat( v ) ||
															0
													)
												}
											/>
										</div>
										<TextControl
											label={ __(
												'Donor',
												'ngn-demo'
											) }
											value={ pin.donor }
											onChange={ ( v ) =>
												updatePin(
													index,
													'donor',
													v
												)
											}
										/>
										<TextControl
											label={ __(
												'Donor business',
												'ngn-demo'
											) }
											value={ pin.donorBusiness }
											onChange={ ( v ) =>
												updatePin(
													index,
													'donorBusiness',
													v
												)
											}
										/>
										<TextControl
											label={ __(
												'Donation date',
												'ngn-demo'
											) }
											value={ pin.donationDate }
											onChange={ ( v ) =>
												updatePin(
													index,
													'donationDate',
													v
												)
											}
										/>
										<TextControl
											label={ __(
												'Rarity',
												'ngn-demo'
											) }
											value={ pin.rarity || '' }
											onChange={ ( v ) =>
												updatePin(
													index,
													'rarity',
													v
												)
											}
										/>
										<div className="donation-map-pin-row__image">
											<MediaUploadCheck>
												<MediaUpload
													onSelect={ ( media ) => {
														const next = pins.map(
															( p, i ) =>
																i === index
																	? {
																			...p,
																			imageUrl:
																				media.url,
																			imageAlt:
																				media.alt ||
																				p.imageAlt ||
																				'',
																	  }
																	: p
														);
														setAttributes( {
															pins: next,
														} );
													} }
													allowedTypes={ [
														'image',
													] }
													value={ pin.imageUrl }
													render={ ( { open } ) =>
														pin.imageUrl ? (
															<button
																type="button"
																className="donation-map-pin-row__image-button"
																onClick={ open }
																aria-label={ __(
																	'Replace image',
																	'ngn-demo'
																) }
															>
																<img
																	src={
																		pin.imageUrl
																	}
																	alt={
																		pin.imageAlt ||
																		''
																	}
																/>
																<span className="donation-map-pin-row__image-replace">
																	{ __(
																		'Replace',
																		'ngn-demo'
																	) }
																</span>
															</button>
														) : (
															<button
																type="button"
																className="donation-map-pin-row__image-placeholder"
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
											{ pin.imageUrl && (
												<TextControl
													label={ __(
														'Image alt text',
														'ngn-demo'
													) }
													value={
														pin.imageAlt || ''
													}
													onChange={ ( v ) =>
														updatePin(
															index,
															'imageAlt',
															v
														)
													}
												/>
											) }
										</div>
										<ToggleControl
											label={ __(
												'Placeholder pin',
												'ngn-demo'
											) }
											help={ __(
												'Render as a dashed empty pin (e.g. for an awaited future donation).',
												'ngn-demo'
											) }
											checked={ pin.isPlaceholder }
											onChange={ ( v ) =>
												updatePin(
													index,
													'isPlaceholder',
													v
												)
											}
										/>
									</div>
								) }
							</div>
						);
					} ) }
					<Button
						variant="secondary"
						className="donation-map-pin-row__add"
						onClick={ addPin }
					>
						{ __( '+ Add pin', 'ngn-demo' ) }
					</Button>
				</PanelBody>
			</InspectorControls>

			<figure { ...blockProps }>
				<div className="donation-map__svg-container">
					<MapMarkup
						viewBox={ previewViewBox }
						landmarksFaded={ isDonationsView }
						mapImageUrl={ mapImageUrl }
						mapImageAlt={ mapImageAlt }
					>
						{ pins.map( ( pin ) => (
							<PinDot
								key={ pin.id }
								pin={ pin }
								isSelected={ openPinId === pin.id }
								pinR={ vbW / 100 }
								onClick={ () =>
									setOpenPinId(
										openPinId === pin.id
											? null
											: pin.id
									)
								}
							/>
						) ) }
					</MapMarkup>

					{ selectedPin && (
						<div
							className="donation-map__card"
							style={ {
								left: `${ cardLeftPct }%`,
								top: `${ cardTopPct }%`,
								transform: flip
									? 'translate(calc(-100% - 12px), -50%)'
									: 'translate(12px, -50%)',
							} }
						>
							<button
								type="button"
								className="donation-map__card-close"
								onClick={ () => setOpenPinId( null ) }
								aria-label={ __(
									'Close',
									'ngn-demo'
								) }
							>
								×
							</button>
							<div className="donation-map__card-name">
								{ selectedPin.lobsterName }
							</div>
							{ selectedPin.lobsterType && (
								<div className="donation-map__card-type">
									{ selectedPin.lobsterType }
								</div>
							) }
							{ selectedPin.imageUrl && (
								<div className="donation-map__card-image">
									<img
										src={ selectedPin.imageUrl }
										alt={
											selectedPin.imageAlt || ''
										}
									/>
								</div>
							) }
							<dl className="donation-map__card-meta">
								{ selectedPin.donor && (
									<>
										<dt>
											{ __(
												'Donor',
												'ngn-demo'
											) }
										</dt>
										<dd>{ selectedPin.donor }</dd>
									</>
								) }
								{ selectedPin.donorBusiness && (
									<>
										<dt>
											{ __(
												'Business',
												'ngn-demo'
											) }
										</dt>
										<dd>
											{ selectedPin.donorBusiness }
										</dd>
									</>
								) }
								{ selectedPin.locationName && (
									<>
										<dt>
											{ __(
												'Location',
												'ngn-demo'
											) }
										</dt>
										<dd>
											{ selectedPin.locationName }
										</dd>
									</>
								) }
								{ selectedPin.donationDate && (
									<>
										<dt>
											{ __(
												'Donated',
												'ngn-demo'
											) }
										</dt>
										<dd>
											{ selectedPin.donationDate }
										</dd>
									</>
								) }
								{ selectedPin.rarity && (
									<>
										<dt>
											{ __(
												'Rarity',
												'ngn-demo'
											) }
										</dt>
										<dd>
											{ selectedPin.rarity }
										</dd>
									</>
								) }
							</dl>
						</div>
					) }
				</div>
				<figcaption className="donation-map__note">
					{ rangeNote }
				</figcaption>
			</figure>
		</>
	);
}
