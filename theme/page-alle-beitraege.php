<?php
/*
Template Name: Alle Beiträge
*/
get_header(); ?>

<!-- Hero Section -->
<section class="hero-section">
    <div class="hero-content">
        <h1 class="hero-title">ALLE BEITRÄGE</h1>
        <p class="hero-subtitle">Sämtliche Builds, Guides und News zu Diablo 4</p>
    </div>
</section>

<main class="site-content" id="content">
    <div class="container">
        <!-- Welcome Section -->
        <div class="welcome-section">
            <h1>KOMPLETTE BEITRAGSÜBERSICHT</h1>
            <p>Hier findest du alle veröffentlichten Beiträge auf einen Blick. Entdecke Builds für alle Klassen, umfassende Guides und aktuelle News zu Diablo 4.</p>
        </div>

        <?php
        $args = array(
            'post_type' => 'post',
            'posts_per_page' => -1,
            'orderby' => 'date',
            'order' => 'DESC',
            'post_status' => 'publish'
        );
        $all_posts = new WP_Query($args);
        
        if ($all_posts->have_posts()) : ?>
            <div class="posts-grid">
                <?php 
                $post_count = 0;
                while ($all_posts->have_posts()) : $all_posts->the_post(); 
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
        <?php else : ?>
            <p class="no-posts">Keine Beiträge gefunden.</p>
        <?php endif; 
        wp_reset_postdata();
        ?>
    </div>
</main>

<?php get_footer(); ?>
