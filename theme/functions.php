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
