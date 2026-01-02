<?php get_header(); ?>

<!-- Hero Section -->
<section class="hero-section">
    <div class="hero-content">
        <h1 class="hero-title"><?php bloginfo('name'); ?></h1>
        <p class="hero-subtitle"><?php bloginfo('description'); ?></p>
    </div>
</section>

<main class="site-content">
    <div class="container">
        <?php if (have_posts()) : ?>
            <div class="posts-grid">
                <?php 
                $post_count = 0;
                while (have_posts()) : the_post(); 
                    $post_count++;
                    // First post is featured
                    $is_featured = ($post_count === 1);
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
                                <h2 class="post-title">
                                    <a href="<?php the_permalink(); ?>">
                                        <?php the_title(); ?>
                                    </a>
                                </h2>
                                <div class="post-meta">
                                    <span class="post-date">
                                        <?php echo get_the_date(); ?>
                                    </span>
                                    <span class="post-author">
                                        <?php echo __('von', 'custom-theme') . ' ' . get_the_author(); ?>
                                    </span>
                                </div>
                            </header>
                            
                            <?php if (!$is_featured) : ?>
                                <div class="post-content">
                                    <?php the_excerpt(); ?>
                                </div>
                            <?php endif; ?>
                            
                            <a href="<?php the_permalink(); ?>" class="read-more">
                                <?php echo __('Mehr erfahren', 'custom-theme'); ?>
                            </a>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>
            
            <div class="pagination">
                <?php
                the_posts_pagination(array(
                    'mid_size' => 2,
                    'prev_text' => __('&laquo; Zurück', 'custom-theme'),
                    'next_text' => __('Weiter &raquo;', 'custom-theme'),
                ));
                ?>
            </div>
        <?php else : ?>
            <article class="post no-results">
                <h2><?php echo __('Keine Beiträge gefunden', 'custom-theme'); ?></h2>
                <p><?php echo __('Es tut uns leid, aber es wurden keine Beiträge gefunden.', 'custom-theme'); ?></p>
            </article>
        <?php endif; ?>
    </div>
</main>

<?php get_footer(); ?>
