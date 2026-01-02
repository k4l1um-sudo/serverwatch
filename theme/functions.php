<?php
/**
 * Custom WordPress Theme Functions
 */

// Theme Setup
function custom_theme_setup() {
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
        'primary' => __('Primary Menu', 'custom-theme'),
        'footer' => __('Footer Menu', 'custom-theme'),
    ));
}
add_action('after_setup_theme', 'custom_theme_setup');

// Enqueue styles and scripts
function custom_theme_scripts() {
    wp_enqueue_style('custom-theme-style', get_stylesheet_uri(), array(), '1.0.1');
    wp_enqueue_script('custom-theme-stars', get_template_directory_uri() . '/js/stars.js', array(), '1.0.1', true);
    wp_enqueue_script('custom-theme-cookie-banner', get_template_directory_uri() . '/js/cookie-banner.js', array(), '1.0.1', true);
}
add_action('wp_enqueue_scripts', 'custom_theme_scripts');

// Register sidebar widgets
function custom_theme_widgets_init() {
    register_sidebar(array(
        'name'          => __('Sidebar', 'custom-theme'),
        'id'            => 'sidebar-1',
        'description'   => __('Add widgets here.', 'custom-theme'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ));
}
add_action('widgets_init', 'custom_theme_widgets_init');

// Custom excerpt length
function custom_excerpt_length($length) {
    return 30;
}
add_filter('excerpt_length', 'custom_excerpt_length');

// Custom excerpt more
function custom_excerpt_more($more) {
    return '...';
}
add_filter('excerpt_more', 'custom_excerpt_more');

// Add featured image sizes
add_image_size('custom-featured', 1200, 600, true);
add_image_size('custom-thumbnail', 400, 300, true);
