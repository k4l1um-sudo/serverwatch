<?php
/**
 * Template for displaying News posts
 * Category: news
 */

get_header();
?>

<main class="single-post news-post">
    <?php while (have_posts()) : the_post(); ?>
        
        <!-- News Hero -->
        <article id="post-<?php the_ID(); ?>" <?php post_class('news-article'); ?>>
            <div class="container">
                
                <!-- News Header -->
                <header class="news-header">
                    <div class="news-meta">
                        <span class="news-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                            </svg>
                            News
                        </span>
                        <time datetime="<?php echo get_the_date('c'); ?>" class="news-date">
                            <?php echo get_the_date('d. F Y'); ?>
                        </time>
                    </div>
                    
                    <h1 class="news-title"><?php the_title(); ?></h1>
                    
                    <?php if (get_field('news_kurzbeschreibung')) : ?>
                        <div class="news-excerpt">
                            <?php echo esc_html(get_field('news_kurzbeschreibung')); ?>
                        </div>
                    <?php endif; ?>
                </header>

                <?php if (has_post_thumbnail()) : ?>
                    <div class="news-featured-image">
                        <?php the_post_thumbnail('diablo-featured'); ?>
                    </div>
                <?php endif; ?>

                <!-- News Content -->
                <div class="news-content">
                    <?php the_content(); ?>
                </div>

                <!-- Weiterführende Links -->
                <?php 
                $link1_url = get_field('news_link_1_url');
                $link1_text = get_field('news_link_1_text');
                $link2_url = get_field('news_link_2_url');
                $link2_text = get_field('news_link_2_text');
                $link3_url = get_field('news_link_3_url');
                $link3_text = get_field('news_link_3_text');
                
                if ($link1_url || $link2_url || $link3_url) :
                ?>
                    <div class="news-links-section">
                        <h2 class="links-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                            Weiterführende Links
                        </h2>
                        
                        <div class="news-links-grid">
                            <?php if ($link1_url && $link1_text) : ?>
                                <a href="<?php echo esc_url($link1_url); ?>" target="_blank" rel="noopener noreferrer" class="news-link-card">
                                    <div class="link-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                            <polyline points="15 3 21 3 21 9"/>
                                            <line x1="10" y1="14" x2="21" y2="3"/>
                                        </svg>
                                    </div>
                                    <span class="link-text"><?php echo esc_html($link1_text); ?></span>
                                </a>
                            <?php endif; ?>

                            <?php if ($link2_url && $link2_text) : ?>
                                <a href="<?php echo esc_url($link2_url); ?>" target="_blank" rel="noopener noreferrer" class="news-link-card">
                                    <div class="link-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                            <polyline points="15 3 21 3 21 9"/>
                                            <line x1="10" y1="14" x2="21" y2="3"/>
                                        </svg>
                                    </div>
                                    <span class="link-text"><?php echo esc_html($link2_text); ?></span>
                                </a>
                            <?php endif; ?>

                            <?php if ($link3_url && $link3_text) : ?>
                                <a href="<?php echo esc_url($link3_url); ?>" target="_blank" rel="noopener noreferrer" class="news-link-card">
                                    <div class="link-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                            <polyline points="15 3 21 3 21 9"/>
                                            <line x1="10" y1="14" x2="21" y2="3"/>
                                        </svg>
                                    </div>
                                    <span class="link-text"><?php echo esc_html($link3_text); ?></span>
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endif; ?>

                <!-- Post Footer -->
                <footer class="news-footer">
                    <div class="news-tags">
                        <?php the_tags('<span class="tags-label">Tags:</span> ', ', ', ''); ?>
                    </div>
                    
                    <a href="<?php echo esc_url(get_category_link(get_cat_ID('news'))); ?>" class="back-to-news">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                        Zurück zu allen News
                    </a>
                </footer>

            </div>
        </article>

    <?php endwhile; ?>
</main>

<?php get_footer(); ?>
