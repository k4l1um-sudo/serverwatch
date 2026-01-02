<?php get_header(); ?>

<main class="site-content">
    <div class="container">
        <?php while (have_posts()) : the_post(); ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class('single-post'); ?>>
                <?php if (has_post_thumbnail()) : ?>
                    <div class="hero-section" style="background-image: linear-gradient(rgba(10, 20, 40, 0.7), rgba(10, 20, 40, 0.9)), url('<?php echo get_the_post_thumbnail_url(get_the_ID(), 'full'); ?>');
                         background-size: cover;
                         background-position: center;">
                        <div class="hero-content">
                            <h1 class="hero-title"><?php the_title(); ?></h1>
                            <div class="post-meta" style="justify-content: center;">
                                <span class="post-date">
                                    <?php echo get_the_date(); ?>
                                </span>
                                <span class="post-author">
                                    <?php echo __('von', 'custom-theme') . ' ' . get_the_author(); ?>
                                </span>
                                <span class="post-category">
                                    <?php the_category(', '); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                <?php else : ?>
                    <header class="post-header" style="text-align: center; padding: 60px 0;">
                        <h1 class="hero-title"><?php the_title(); ?></h1>
                        <div class="post-meta" style="justify-content: center;">
                            <span class="post-date">
                                <?php echo get_the_date(); ?>
                            </span>
                            <span class="post-author">
                                <?php echo __('von', 'custom-theme') . ' ' . get_the_author(); ?>
                            </span>
                            <span class="post-category">
                                <?php the_category(', '); ?>
                            </span>
                        </div>
                    </header>
                <?php endif; ?>
                
                <div class="post-content" style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-size: 18px; line-height: 1.8;">
                    <?php the_content(); ?>
                </div>
                
                <footer class="post-footer" style="max-width: 900px; margin: 0 auto; padding: 20px;">
                    <?php
                    the_tags(
                        '<div class="post-tags"><strong>' . __('Tags: ', 'custom-theme') . '</strong>',
                        ', ',
                        '</div>'
                    );
                    ?>
                </footer>
            </article>
            
            <?php
            if (comments_open() || get_comments_number()) :
                comments_template();
            endif;
            ?>
        <?php endwhile; ?>
    </div>
</main>

<?php get_footer(); ?>
