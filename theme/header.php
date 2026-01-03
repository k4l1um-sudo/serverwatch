<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- Background Effects -->
<div class="diablo-background">
    <div class="ember-particles"></div>
    <div class="dark-vignette"></div>
</div>

<header class="site-header">
    <div class="container">
        <div class="site-branding">
            <?php if (has_custom_logo()) : ?>
                <?php the_custom_logo(); ?>
            <?php else : ?>
                <h1 class="site-title">
                    <a href="<?php echo esc_url(home_url('/')); ?>">
                        <span class="diablo-logo">DIABLO IV</span>
                        <span class="site-tagline">Builds & Guides</span>
                    </a>
                </h1>
            <?php endif; ?>
        </div>
        
        <nav class="site-nav">
            <?php
            wp_nav_menu(array(
                'theme_location' => 'primary',
                'container' => false,
                'fallback_cb' => function() {
                    echo '<ul>';
                    echo '<li><a href="' . esc_url(home_url('/')) . '">Home</a></li>';
                    echo '<li><a href="' . esc_url(home_url('/builds')) . '">Builds</a></li>';
                    echo '<li><a href="' . esc_url(home_url('/guides')) . '">Guides</a></li>';
                    echo '<li><a href="' . esc_url(home_url('/news')) . '">News</a></li>';
                    echo '</ul>';
                }
            ));
            ?>
        </nav>
    </div>
</header>
