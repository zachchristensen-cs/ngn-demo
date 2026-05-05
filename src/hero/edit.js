import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	InnerBlocks,
	MediaUpload,
	MediaUploadCheck,
	MediaPlaceholder,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	ColorPicker,
	RangeControl,
	TextControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Dropdown,
	FocalPointPicker,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { dateI18n, getSettings as getDateSettings } from '@wordpress/date';

import { buildOverlayCss, buildGradientCss, newStopId } from './utils';

import './editor.scss';

const ALLOWED_MEDIA_TYPES = [ 'image' ];

// Use a literal hex via the `style` attribute rather than a `textColor` slug
// (e.g. 'white') — slugs only resolve if the active theme's theme.json defines
// them, and not every host theme does. Hex always works.
const WHITE_TEXT_STYLE = { color: { text: '#ffffff' } };

const TEMPLATE = [
	[
		'core/heading',
		{
			level: 1,
			placeholder: 'Hero headline…',
			style: WHITE_TEXT_STYLE,
			align: 'center',
		},
	],
	[
		'core/paragraph',
		{
			placeholder: 'Subheading or supporting copy.',
			style: WHITE_TEXT_STYLE,
			align: 'center',
		},
	],
];

function ColorSwatchDropdown( { color, onChange, label } ) {
	return (
		<Dropdown
			className="hero-overlay__swatch-wrap"
			contentClassName="hero-overlay__swatch-popover"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<button
					type="button"
					className="hero-overlay__swatch"
					aria-expanded={ isOpen }
					aria-label={ label }
					onClick={ onToggle }
					style={ { background: color } }
				/>
			) }
			renderContent={ () => (
				<ColorPicker
					color={ color }
					onChange={ onChange }
					enableAlpha
					defaultValue={ color }
				/>
			) }
		/>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		imageId,
		imageUrl,
		imageAlt,
		focalPoint,
		minHeight,
		overlayType,
		overlayColor,
		overlayGradient,
		overlayOpacity,
		bylineAuthorName,
		bylineAuthorImageId,
		bylineAuthorImageUrl,
		bylineAuthorImageAlt,
		bylineDate,
		bylineUsePostDate,
		imageCredit,
	} = attributes;

	const postDate = useSelect(
		( select ) => select( 'core/editor' )?.getEditedPostAttribute( 'date' ),
		[]
	);
	const formattedPostDate = postDate
		? dateI18n( getDateSettings().formats.date, postDate )
		: '';
	const previewDate = bylineUsePostDate ? formattedPostDate : bylineDate;
	const hasByline =
		!! bylineAuthorName || !! previewDate || !! bylineAuthorImageUrl;

	const overlayCss = buildOverlayCss( {
		overlayType,
		overlayColor,
		overlayGradient,
	} );

	const updateGradient = ( patch ) =>
		setAttributes( {
			overlayGradient: { ...overlayGradient, ...patch },
		} );

	const updateStop = ( id, patch ) => {
		updateGradient( {
			stops: overlayGradient.stops.map( ( s ) =>
				s.id === id ? { ...s, ...patch } : s
			),
		} );
	};

	const addStop = () => {
		const stops = overlayGradient.stops;
		const last = stops[ stops.length - 1 ];
		const prev = stops[ stops.length - 2 ];
		const nextPos = last && prev
			? Math.min( 100, Math.round( ( last.position + prev.position ) / 2 ) )
			: 50;
		updateGradient( {
			stops: [
				...stops,
				{
					id: newStopId(),
					color: last ? last.color : 'rgba(0,0,0,0.5)',
					position: nextPos,
				},
			],
		} );
	};

	const removeStop = ( id ) => {
		if ( overlayGradient.stops.length <= 2 ) {
			return;
		}
		updateGradient( {
			stops: overlayGradient.stops.filter( ( s ) => s.id !== id ),
		} );
	};

	const onSelectMedia = ( media ) => {
		if ( ! media || ! media.url ) {
			return;
		}
		setAttributes( {
			imageId: media.id,
			imageUrl: media.url,
			imageAlt: media.alt || '',
		} );
	};

	const blockProps = useBlockProps( {
		className: 'hero-block',
		style: { minHeight: `${ minHeight }vh` },
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Background image', 'ngn-demo' ) }
					initialOpen
				>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ onSelectMedia }
							allowedTypes={ ALLOWED_MEDIA_TYPES }
							value={ imageId }
							render={ ( { open } ) => (
								<div className="hero-inspector__media">
									<Button
										variant="secondary"
										onClick={ open }
									>
										{ imageUrl
											? __( 'Replace image', 'ngn-demo' )
											: __( 'Select image', 'ngn-demo' ) }
									</Button>
									{ imageUrl && (
										<Button
											variant="link"
											isDestructive
											onClick={ () =>
												setAttributes( {
													imageId: undefined,
													imageUrl: undefined,
													imageAlt: '',
												} )
											}
										>
											{ __( 'Remove', 'ngn-demo' ) }
										</Button>
									) }
								</div>
							) }
						/>
					</MediaUploadCheck>
					{ imageUrl && (
						<FocalPointPicker
							__nextHasNoMarginBottom
							label={ __( 'Focal point', 'ngn-demo' ) }
							url={ imageUrl }
							value={ focalPoint }
							onChange={ ( value ) =>
								setAttributes( { focalPoint: value } )
							}
						/>
					) }
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Minimum height (vh)', 'ngn-demo' ) }
						value={ minHeight }
						onChange={ ( value ) =>
							setAttributes( { minHeight: value } )
						}
						min={ 20 }
						max={ 100 }
						step={ 1 }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Overlay', 'ngn-demo' ) }
					initialOpen
				>
					<ToggleGroupControl
						__nextHasNoMarginBottom
						isBlock
						label={ __( 'Type', 'ngn-demo' ) }
						value={ overlayType }
						onChange={ ( value ) =>
							setAttributes( { overlayType: value } )
						}
					>
						<ToggleGroupControlOption
							value="color"
							label={ __( 'Color', 'ngn-demo' ) }
						/>
						<ToggleGroupControlOption
							value="gradient"
							label={ __( 'Gradient', 'ngn-demo' ) }
						/>
					</ToggleGroupControl>

					{ overlayType === 'color' && (
						<div className="hero-overlay__field">
							<ColorPicker
								color={ overlayColor }
								onChange={ ( value ) =>
									setAttributes( { overlayColor: value } )
								}
								enableAlpha
								defaultValue={ overlayColor }
							/>
						</div>
					) }

					{ overlayType === 'gradient' && (
						<div className="hero-overlay__gradient">
							<div
								className="hero-overlay__preview"
								style={ {
									background: buildGradientCss( overlayGradient ),
								} }
							/>
							<RangeControl
								__nextHasNoMarginBottom
								label={ __( 'Angle', 'ngn-demo' ) }
								value={ overlayGradient.angle }
								onChange={ ( value ) =>
									updateGradient( { angle: value } )
								}
								min={ 0 }
								max={ 360 }
								step={ 1 }
							/>
							<div className="hero-overlay__stops">
								{ overlayGradient.stops.map( ( stop ) => (
									<div
										className="hero-overlay__stop"
										key={ stop.id }
									>
										<ColorSwatchDropdown
											color={ stop.color }
											label={ __(
												'Stop color',
												'ngn-demo'
											) }
											onChange={ ( value ) =>
												updateStop( stop.id, {
													color: value,
												} )
											}
										/>
										<RangeControl
											__nextHasNoMarginBottom
											className="hero-overlay__stop-pos"
											label={ __(
												'Position',
												'ngn-demo'
											) }
											hideLabelFromVision
											value={ stop.position }
											onChange={ ( value ) =>
												updateStop( stop.id, {
													position: value,
												} )
											}
											min={ 0 }
											max={ 100 }
											step={ 1 }
										/>
										<Button
											icon="trash"
											size="small"
											label={ __(
												'Remove stop',
												'ngn-demo'
											) }
											onClick={ () => removeStop( stop.id ) }
											disabled={
												overlayGradient.stops.length <= 2
											}
										/>
									</div>
								) ) }
							</div>
							<Button
								variant="secondary"
								onClick={ addStop }
								className="hero-overlay__add-stop"
							>
								{ __( '+ Add stop', 'ngn-demo' ) }
							</Button>
						</div>
					) }

					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Overlay opacity', 'ngn-demo' ) }
						value={ overlayOpacity }
						onChange={ ( value ) =>
							setAttributes( { overlayOpacity: value } )
						}
						min={ 0 }
						max={ 1 }
						step={ 0.01 }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Byline', 'ngn-demo' ) }
					initialOpen={ false }
				>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Author name', 'ngn-demo' ) }
						value={ bylineAuthorName }
						onChange={ ( value ) =>
							setAttributes( { bylineAuthorName: value } )
						}
					/>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) =>
								setAttributes( {
									bylineAuthorImageId: media.id,
									bylineAuthorImageUrl: media.url,
									bylineAuthorImageAlt: media.alt || '',
								} )
							}
							allowedTypes={ ALLOWED_MEDIA_TYPES }
							value={ bylineAuthorImageId }
							render={ ( { open } ) => (
								<div className="hero-inspector__media">
									<Button
										variant="secondary"
										onClick={ open }
									>
										{ bylineAuthorImageUrl
											? __(
													'Replace headshot',
													'ngn-demo'
											  )
											: __(
													'Select headshot',
													'ngn-demo'
											  ) }
									</Button>
									{ bylineAuthorImageUrl && (
										<Button
											variant="link"
											isDestructive
											onClick={ () =>
												setAttributes( {
													bylineAuthorImageId: undefined,
													bylineAuthorImageUrl: '',
													bylineAuthorImageAlt: '',
												} )
											}
										>
											{ __(
												'Remove',
												'ngn-demo'
											) }
										</Button>
									) }
								</div>
							) }
						/>
					</MediaUploadCheck>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Use post publish date',
							'ngn-demo'
						) }
						checked={ bylineUsePostDate }
						onChange={ ( value ) =>
							setAttributes( { bylineUsePostDate: value } )
						}
					/>
					{ ! bylineUsePostDate && (
						<TextControl
							__nextHasNoMarginBottom
							label={ __( 'Date label', 'ngn-demo' ) }
							help={ __(
								'Free-form date text shown under the author name.',
								'ngn-demo'
							) }
							value={ bylineDate }
							onChange={ ( value ) =>
								setAttributes( { bylineDate: value } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Image credit', 'ngn-demo' ) }
					initialOpen={ false }
				>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Caption', 'ngn-demo' ) }
						help={ __(
							'Photo credit shown at the bottom of the hero.',
							'ngn-demo'
						) }
						value={ imageCredit }
						onChange={ ( value ) =>
							setAttributes( { imageCredit: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ imageUrl ? (
					<div
						className="hero-block__image"
						style={ {
							backgroundImage: `url(${ imageUrl })`,
							backgroundPosition: `${ ( focalPoint?.x ?? 0.5 ) * 100 }% ${ ( focalPoint?.y ?? 0.5 ) * 100 }%`,
						} }
						{ ...( imageAlt
							? { role: 'img', 'aria-label': imageAlt }
							: {} ) }
					/>
				) : (
					<MediaPlaceholder
						className="hero-block__placeholder"
						icon="format-image"
						labels={ {
							title: __( 'Hero background', 'ngn-demo' ),
							instructions: __(
								'Upload or select an image for the hero background.',
								'ngn-demo'
							),
						} }
						onSelect={ onSelectMedia }
						accept="image/*"
						allowedTypes={ ALLOWED_MEDIA_TYPES }
					/>
				) }
				<div
					className="hero-block__overlay"
					style={ {
						background: overlayCss,
						opacity: overlayOpacity,
					} }
					aria-hidden="true"
				/>
				<div className="hero-block__content">
					<InnerBlocks template={ TEMPLATE } />

					{ hasByline && (
						<div className="hero-block__byline">
							{ bylineAuthorImageUrl && (
								<img
									className="hero-block__byline-avatar"
									src={ bylineAuthorImageUrl }
									alt={ bylineAuthorImageAlt }
								/>
							) }
							<div className="hero-block__byline-text">
								{ bylineAuthorName && (
									<div className="hero-block__byline-author">
										<span className="hero-block__byline-by">
											{ __( 'by', 'ngn-demo' ) }
										</span>
										<span className="hero-block__byline-name">
											{ bylineAuthorName }
										</span>
									</div>
								) }
								{ previewDate && (
									<div className="hero-block__byline-date">
										{ previewDate }
									</div>
								) }
							</div>
						</div>
					) }
				</div>

				{ imageCredit && (
					<div className="hero-block__credit">{ imageCredit }</div>
				) }
			</div>
		</>
	);
}
