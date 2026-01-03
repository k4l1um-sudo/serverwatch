<?php get_header(); ?>

<!-- Hero Section -->
<section class="hero-section">
    <div class="hero-content">
        <h1 class="hero-title">WILLKOMMEN IN SANKTUARIO</h1>
        <p class="hero-subtitle">Builds, Guides und News zu Diablo 4</p>
        <a href="#content" class="hero-cta">Entdecke die Builds</a>
    </div>
</section>

<main class="site-content" id="content">
    <div class="container">
        <!-- Welcome Section -->
        <div class="welcome-section">
            <h1>DIABLO IV BUILDS & GUIDES</h1>
            <p>Hier findest du die besten Builds, umfassende Guides und aktuelle News zu Diablo 4. Entdecke mächtige Build-Kombinationen für alle Klassen und meistere die Herausforderungen von Sanktuario.</p>
        </div>

        <?php if (have_posts()) : ?>
            <div class="posts-grid">
                <?php 
                $post_count = 0;
                while (have_posts()) : the_post(); 
                    $post_count++;
                    $is_featured = ($post_count === 1);
                    
                    // Get categories for build type
                    $categories = get_the_category();
                    $cat_name = !empty($categories) ? esc_html($categories[0]->name) : 'BUILD';
                ?>
                    <article id="post-<?php the_ID(); ?>" <?php post_class($is_featured ? 'featured-post' : 'post'); ?>>
                        <?php if (has_post_thumbnail()) : ?>
                            <div class="post-thumbnail">
                                <a href="<?php the_permalink(); ?>">
                                    <?php the_post_thumbnail($is_featured ? 'full' : 'custom-featured'); ?>
                                </a>
                            </div>
                        <?php endif; ?>
                        
                        <div class="<?php echo $is_featured ? 'featured-post-content' : 'post-content-wrapper'; ?>">
                            <header class="post-header">
                                <span class="post-category"><?php echo $cat_name; ?></span>
                                <h2 class="post-title">
                                    <a href="<?php the_permalink(); ?>">
                                        <?php the_title(); ?>
                                    </a>
                                </h2>
                                <div class="post-meta">
                                    <span class="post-date">
                                        <?php echo get_the_date('d.m.Y'); ?>
                                    </span>
                                    <span class="post-author">
                                        von <?php echo get_the_author(); ?>
                                    </span>
                                </div>
                            </header>
                            
                            <?php if ($is_featured) : ?>
                                <div class="post-content">
                                    <?php the_excerpt(); ?>
                                </div>
                            <?php endif; ?>
                            
                            <a href="<?php the_permalink(); ?>" class="read-more">
                                Mehr erfahren →
                            </a>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>
            
            <div class="pagination">
                <?php
                the_posts_pagination(array(
                    'mid_size' => 2,
                    'prev_text' => __('« Zurück', 'diablo-theme'),
                    'next_text' => __('Weiter »', 'diablo-theme'),
                ));
                ?>
            </div>
        <?php else : ?>
            <article class="post no-results">
                <h2><?php echo __('Keine Beiträge gefunden', 'diablo-theme'); ?></h2>
                <p><?php echo __('Es tut uns leid, aber es wurden keine Beiträge gefunden.', 'diablo-theme'); ?></p>
            </article>
        <?php endif; ?>
    </div>
</main>

<?php get_footer(); ?>
