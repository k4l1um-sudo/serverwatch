<?php
/**
 * Template Name: News Übersicht
 * Description: Übersichtsseite für alle News-Beiträge
 */

get_header();
?>

<main class="news-overview-page">
    <div class="container">
        <div class="page-header">
            <h1 class="page-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                Sanktuario News
            </h1>
            <p class="page-subtitle">Die neuesten Nachrichten aus der Welt von Diablo IV</p>
        </div>

        <div class="news-grid">
            <?php
            $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
            
            $news_query = new WP_Query(array(
                'category_name' => 'news',
                'posts_per_page' => 9,
                'paged' => $paged,
                'orderby' => 'date',
                'order' => 'DESC'
            ));

            if ($news_query->have_posts()) :
                while ($news_query->have_posts()) : $news_query->the_post();
            ?>
                    <article class="news-card">
                        <?php if (has_post_thumbnail()) : ?>
                            <div class="news-card-image">
                                <a href="<?php the_permalink(); ?>">
                                    <?php the_post_thumbnail('diablo-thumbnail'); ?>
                                </a>
                                <div class="news-card-badge">News</div>
                            </div>
                        <?php endif; ?>

                        <div class="news-card-content">
                            <div class="news-card-meta">
                                <time datetime="<?php echo get_the_date('c'); ?>">
                                    <?php echo get_the_date('d.m.Y'); ?>
                                </time>
                            </div>

                            <h2 class="news-card-title">
                                <a href="<?php the_permalink(); ?>">
                                    <?php the_title(); ?>
                                </a>
                            </h2>

                            <?php if (get_field('news_kurzbeschreibung')) : ?>
                                <p class="news-card-excerpt">
                                    <?php echo esc_html(get_field('news_kurzbeschreibung')); ?>
                                </p>
                            <?php else : ?>
                                <p class="news-card-excerpt">
                                    <?php echo wp_trim_words(get_the_excerpt(), 20); ?>
                                </p>
                            <?php endif; ?>

                            <a href="<?php the_permalink(); ?>" class="news-card-link">
                                Weiterlesen
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                </svg>
                            </a>
                        </div>
                    </article>

            <?php
                endwhile;
                
                // Pagination
                if ($news_query->max_num_pages > 1) :
            ?>
                    <div class="news-pagination">
                        <?php
                        echo paginate_links(array(
                            'total' => $news_query->max_num_pages,
                            'current' => $paged,
                            'prev_text' => '← Vorherige',
                            'next_text' => 'Nächste →',
                        ));
                        ?>
                    </div>
            <?php
                endif;
                
                wp_reset_postdata();
            else :
            ?>
                <div class="no-news">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>Keine News vorhanden</h3>
                    <p>Erstelle deinen ersten News-Beitrag mit der Kategorie "News".</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</main>

<?php get_footer(); ?>
