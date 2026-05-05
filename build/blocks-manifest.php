<?php
// This file is generated. Do not modify it manually.
return array(
	'donation-map' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'ngn/donation-map',
		'version' => '0.1.0',
		'title' => 'Donation Map',
		'category' => 'widgets',
		'icon' => 'smiley',
		'description' => 'Editorial map showing the East Coast lobster range with pinned donation origins on the Massachusetts North Shore.',
		'example' => array(
			'attributes' => array(
				'defaultViewBox' => '0 0 800 988',
				'pins' => array(
					array(
						'id' => 'ex-1',
						'lobsterName' => 'Neptune',
						'lobsterType' => 'Electric Blue',
						'locationName' => 'Salem, MA',
						'svgX' => 214,
						'svgY' => 660,
						'donor' => '',
						'donorBusiness' => '',
						'donationDate' => '',
						'rarity' => '1 in 2 million',
						'imageUrl' => '',
						'imageAlt' => '',
						'isPlaceholder' => false
					)
				)
			)
		),
		'attributes' => array(
			'pins' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 'pin-1',
						'lobsterName' => 'Neptune',
						'lobsterType' => 'Electric Blue',
						'locationName' => 'Salem, MA',
						'svgX' => 214,
						'svgY' => 660,
						'donor' => 'Brad Myslinski',
						'donorBusiness' => 'Sophia & Emma',
						'donationDate' => 'July 2025',
						'rarity' => '1 in 2 million',
						'imageUrl' => '',
						'imageAlt' => '',
						'isPlaceholder' => false
					),
					array(
						'id' => 'pin-2',
						'lobsterName' => 'Jackie',
						'lobsterType' => 'Calico',
						'locationName' => 'Nahant, MA',
						'svgX' => 214,
						'svgY' => 664,
						'donor' => 'Mike \'Tuffy\' Tufts',
						'donorBusiness' => 'Veteran lobster captain',
						'donationDate' => 'October 2025',
						'rarity' => '1 in 30 million',
						'imageUrl' => '',
						'imageAlt' => '',
						'isPlaceholder' => false
					),
					array(
						'id' => 'pin-3',
						'lobsterName' => 'Joseph',
						'lobsterType' => 'Cotton Candy Claws',
						'locationName' => 'Marblehead, MA',
						'svgX' => 215,
						'svgY' => 660,
						'donor' => 'Kevin Wolff',
						'donorBusiness' => 'Little Harbor Lobster Co.',
						'donationDate' => 'November 2025',
						'rarity' => '1 in 100 million',
						'imageUrl' => '',
						'imageAlt' => '',
						'isPlaceholder' => false
					),
					array(
						'id' => 'pin-4',
						'lobsterName' => 'Awaiting fourth lobster',
						'lobsterType' => '',
						'locationName' => 'Nahant, MA — Marine Science Center',
						'svgX' => 213,
						'svgY' => 664,
						'donor' => '',
						'donorBusiness' => '',
						'donationDate' => '',
						'rarity' => 'Awaiting fourth lobster',
						'imageUrl' => '',
						'imageAlt' => '',
						'isPlaceholder' => true
					)
				)
			),
			'rangeNote' => array(
				'type' => 'string',
				'default' => 'American lobsters range from Cape Hatteras, North Carolina to Labrador, Canada — with New England having the highest concentration. (Source: NOAA)'
			),
			'defaultViewBox' => array(
				'type' => 'string',
				'default' => '200 645 90 25'
			),
			'mapImageId' => array(
				'type' => 'number'
			),
			'mapImageUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'mapImageAlt' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'supports' => array(
			'html' => false
		),
		'textdomain' => 'ngn-demo',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js'
	),
	'hero' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'ngn/hero',
		'version' => '0.1.0',
		'title' => 'Hero',
		'category' => 'design',
		'icon' => 'cover-image',
		'description' => 'Full-bleed hero with background image and customizable color or gradient overlay.',
		'example' => array(
			'attributes' => array(
				'minHeight' => 50,
				'overlayType' => 'gradient',
				'overlayOpacity' => 1,
				'overlayGradient' => array(
					'angle' => 180,
					'stops' => array(
						array(
							'id' => 's1',
							'color' => 'rgba(0, 0, 0, 0)',
							'position' => 0
						),
						array(
							'id' => 's2',
							'color' => 'rgba(0, 0, 0, 0.7)',
							'position' => 100
						)
					)
				),
				'bylineAuthorName' => 'Jane Doe',
				'bylineUsePostDate' => false,
				'bylineDate' => 'May 2026'
			),
			'innerBlocks' => array(
				array(
					'name' => 'core/heading',
					'attributes' => array(
						'level' => 1,
						'content' => 'Hero headline',
						'align' => 'center',
						'style' => array(
							'color' => array(
								'text' => '#ffffff'
							)
						)
					)
				),
				array(
					'name' => 'core/paragraph',
					'attributes' => array(
						'content' => 'Subheading or supporting copy.',
						'align' => 'center',
						'style' => array(
							'color' => array(
								'text' => '#ffffff'
							)
						)
					)
				)
			)
		),
		'attributes' => array(
			'imageId' => array(
				'type' => 'number'
			),
			'imageUrl' => array(
				'type' => 'string'
			),
			'imageAlt' => array(
				'type' => 'string',
				'default' => ''
			),
			'focalPoint' => array(
				'type' => 'object',
				'default' => array(
					'x' => 0.5,
					'y' => 0.5
				)
			),
			'minHeight' => array(
				'type' => 'number',
				'default' => 70
			),
			'overlayType' => array(
				'type' => 'string',
				'default' => 'color'
			),
			'overlayColor' => array(
				'type' => 'string',
				'default' => 'rgba(0, 0, 0, 0.5)'
			),
			'overlayGradient' => array(
				'type' => 'object',
				'default' => array(
					'angle' => 180,
					'stops' => array(
						array(
							'id' => 's1',
							'color' => 'rgba(0, 0, 0, 0)',
							'position' => 0
						),
						array(
							'id' => 's2',
							'color' => 'rgba(0, 0, 0, 0.7)',
							'position' => 100
						)
					)
				)
			),
			'overlayOpacity' => array(
				'type' => 'number',
				'default' => 1
			),
			'bylineAuthorName' => array(
				'type' => 'string',
				'default' => ''
			),
			'bylineAuthorImageId' => array(
				'type' => 'number'
			),
			'bylineAuthorImageUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'bylineAuthorImageAlt' => array(
				'type' => 'string',
				'default' => ''
			),
			'bylineDate' => array(
				'type' => 'string',
				'default' => ''
			),
			'bylineUsePostDate' => array(
				'type' => 'boolean',
				'default' => true
			),
			'imageCredit' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'supports' => array(
			'html' => false,
			'align' => array(
				'full',
				'wide'
			),
			'anchor' => true
		),
		'textdomain' => 'ngn-demo',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php'
	),
	'rarity-ranking' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'ngn/rarity-ranking',
		'version' => '0.1.0',
		'title' => 'Rarity Ranking',
		'category' => 'widgets',
		'icon' => 'smiley',
		'description' => 'Ranked list with accent colors, images, and click-to-expand details.',
		'example' => array(
			'attributes' => array(
				'headline' => 'Ranked by rarity',
				'subheadline' => 'From the merely uncommon to the genuinely once-in-a-lifetime.',
				'items' => array(
					array(
						'id' => 'ex-1',
						'name' => 'Joseph',
						'typeLabel' => 'Cotton Candy Claws',
						'rarityStat' => '1 in 100 million',
						'imageUrl' => '',
						'imageAlt' => '',
						'donor' => '',
						'donorContext' => '',
						'donationDate' => '',
						'expandedNote' => ''
					),
					array(
						'id' => 'ex-2',
						'name' => 'Jackie',
						'typeLabel' => 'Calico',
						'rarityStat' => '1 in 30 million',
						'imageUrl' => '',
						'imageAlt' => '',
						'donor' => '',
						'donorContext' => '',
						'donationDate' => '',
						'expandedNote' => ''
					)
				)
			)
		),
		'attributes' => array(
			'headline' => array(
				'type' => 'string',
				'default' => 'Ranked by rarity'
			),
			'subheadline' => array(
				'type' => 'string',
				'default' => 'From the merely uncommon to the genuinely once-in-a-lifetime.'
			),
			'items' => array(
				'type' => 'array',
				'default' => array(
					array(
						'id' => 'item-1',
						'name' => 'Joseph',
						'typeLabel' => 'Cotton Candy Claws',
						'rarityStat' => '1 in 100 million',
						'imageUrl' => '',
						'imageAlt' => 'Joseph the cotton candy clawed lobster',
						'donor' => 'Kevin Wolff',
						'donorContext' => 'Little Harbor Lobster Co., Marblehead',
						'donationDate' => 'November 2025',
						'expandedNote' => 'Named after the biblical figure with a \'coat of many colors,\' Joseph waves orange, blue, purple, green, and pink claws when he emerges from his rock cave.'
					),
					array(
						'id' => 'item-2',
						'name' => 'Jackie',
						'typeLabel' => 'Calico',
						'rarityStat' => '1 in 30 million',
						'imageUrl' => '',
						'imageAlt' => 'Jackie the calico lobster',
						'donor' => 'Mike \'Tuffy\' Tufts',
						'donorContext' => 'Lobster boat captain, Nahant',
						'donationDate' => 'October 2025',
						'expandedNote' => 'Short for Jack O\'Lantern, named for her orange and black coloration and her arrival near Halloween. The veteran lobster captain typically brings rare catches home in his lunchbox.'
					),
					array(
						'id' => 'item-3',
						'name' => 'Neptune',
						'typeLabel' => 'Electric Blue',
						'rarityStat' => '1 in 2 million',
						'imageUrl' => '',
						'imageAlt' => 'Neptune the blue lobster',
						'donor' => 'Brad Myslinski',
						'donorContext' => 'Sophia & Emma, Salem',
						'donationDate' => 'July 2025',
						'expandedNote' => 'The first rare lobster to arrive at the Marine Science Center, Neptune\'s brilliant cobalt color comes from a disrupted binding process between the blue pigment crustacyanin and the red pigment astaxanthin.'
					),
					array(
						'id' => 'item-4',
						'name' => 'Common Brown',
						'typeLabel' => 'Standard American Lobster',
						'rarityStat' => 'The other 99.9999%',
						'imageUrl' => '',
						'imageAlt' => 'Standard greenish-brown lobster',
						'donor' => '',
						'donorContext' => '',
						'donationDate' => '',
						'expandedNote' => 'The greenish-brown coloring of typical American lobsters serves as camouflage on the ocean floor. Their range extends from Cape Hatteras, North Carolina to Labrador, Canada — with New England having the highest concentration.'
					)
				)
			)
		),
		'supports' => array(
			'html' => false
		),
		'textdomain' => 'ngn-demo',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js'
	)
);
