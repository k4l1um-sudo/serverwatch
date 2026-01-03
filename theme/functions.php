<?php
/**
 * Diablo IV Theme Functions
 */

// Theme Setup
function diablo_theme_setup() {
    // Add theme support for various features
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    add_theme_support('custom-logo');
    
    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'diablo-theme'),
        'footer' => __('Footer Menu', 'diablo-theme'),
    ));
}
add_action('after_setup_theme', 'diablo_theme_setup');

// Enqueue styles and scripts
function diablo_theme_scripts() {
    wp_enqueue_style('diablo-theme-style', get_stylesheet_uri(), array(), '2.0.0');
    wp_enqueue_script('diablo-theme-cookie-banner', get_template_directory_uri() . '/js/cookie-banner.js', array(), '2.0.0', true);
}
add_action('wp_enqueue_scripts', 'diablo_theme_scripts');

// Register sidebar widgets
function diablo_theme_widgets_init() {
    register_sidebar(array(
        'name'          => __('Sidebar', 'diablo-theme'),
        'id'            => 'sidebar-1',
        'description'   => __('Add widgets here.', 'diablo-theme'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ));
}
add_action('widgets_init', 'diablo_theme_widgets_init');

// Custom excerpt length
function diablo_excerpt_length($length) {
    return 35;
}
add_filter('excerpt_length', 'diablo_excerpt_length');

// Custom excerpt more
function diablo_excerpt_more($more) {
    return '...';
}
add_filter('excerpt_more', 'diablo_excerpt_more');

// Add featured image sizes
add_image_size('diablo-featured', 1200, 600, true);
add_image_size('diablo-thumbnail', 400, 300, true);

// Add custom body classes for Diablo theme
function diablo_body_classes($classes) {
    $classes[] = 'diablo-theme';
    return $classes;
}
add_filter('body_class', 'diablo_body_classes');

// ACF Fields for Build Guide Template
if( function_exists('acf_add_local_field_group') ):

acf_add_local_field_group(array(
    'key' => 'group_build_guide',
    'title' => 'Build Guide Felder',
    'fields' => array(
        // Allgemeine Felder
        array(
            'key' => 'field_build_season',
            'label' => 'Season',
            'name' => 'build_season',
            'type' => 'select',
            'choices' => array(
                'season_7' => 'Season 7',
                'season_8' => 'Season 8',
                'season_9' => 'Season 9',
                'season_10' => 'Season 10',
                'season_11' => 'Season 11',
                'season_12' => 'Season 12',
                'season_13' => 'Season 13',
                'eternal' => 'Eternal',
            ),
            'default_value' => 'season_11',
            'allow_null' => 0,
            'required' => 1,
        ),
        array(
            'key' => 'field_build_allgemeines',
            'label' => 'Allgemeines',
            'name' => 'build_allgemeines',
            'type' => 'textarea',
            'rows' => 8,
        ),
        array(
            'key' => 'field_build_spielweise',
            'label' => 'Spielweise',
            'name' => 'build_spielweise',
            'type' => 'textarea',
            'rows' => 8,
        ),
        // Build Bewertung
        array(
            'key' => 'field_rating_monster',
            'label' => 'VS Monster',
            'name' => 'rating_monster',
            'type' => 'text',
            'default_value' => 'Sehr gut',
        ),
        array(
            'key' => 'field_rating_boss',
            'label' => 'VS Bosse',
            'name' => 'rating_boss',
            'type' => 'text',
            'default_value' => 'Sehr gut',
        ),
        array(
            'key' => 'field_rating_robustheit',
            'label' => 'Robustheit',
            'name' => 'rating_robustheit',
            'type' => 'text',
            'default_value' => 'Gut',
        ),
        array(
            'key' => 'field_rating_mobilitaet',
            'label' => 'Mobilität',
            'name' => 'rating_mobilitaet',
            'type' => 'text',
            'default_value' => 'Gut',
        ),
        array(
            'key' => 'field_rating_spielweise',
            'label' => 'Spielweise',
            'name' => 'rating_spielweise',
            'type' => 'text',
            'default_value' => 'Einfach',
        ),
        array(
            'key' => 'field_rating_budget',
            'label' => 'Budget',
            'name' => 'rating_budget',
            'type' => 'text',
            'default_value' => 'Günstig',
        ),
        // D4Builds Integration
        array(
            'key' => 'field_d4builds_url',
            'label' => 'D4Builds.gg Build URL',
            'name' => 'd4builds_url',
            'type' => 'url',
            'instructions' => 'Füge hier die URL deines D4Builds.gg-Builds ein (z.B. https://d4builds.gg/builds/...)',
        ),
    ),
    'location' => array(
        array(
            array(
                'param' => 'page_template',
                'operator' => '==',
                'value' => 'page-build-guide.php',
            ),
        ),
    ),
));

endif;
