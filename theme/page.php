<?php get_header(); ?>

<main class="site-content">
    <div class="container">
        <?php while (have_posts()) : the_post(); ?>
            <article id="page-<?php the_ID(); ?>" <?php post_class('single-page'); ?>>
                <?php if (has_post_thumbnail()) : ?>
                    <div class="hero-section" style="background-image: linear-gradient(rgba(10, 20, 40, 0.7), rgba(10, 20, 40, 0.9)), url('<?php echo get_the_post_thumbnail_url(get_the_ID(), 'full'); ?>');
                         background-size: cover;
                         background-position: center;">
                        <div class="hero-content">
                            <h1 class="hero-title"><?php the_title(); ?></h1>
                        </div>
                    </div>
                <?php else : ?>
                    <header class="post-header" style="text-align: center; padding: 60px 0;">
                        <h1 class="hero-title"><?php the_title(); ?></h1>
                    </header>
                <?php endif; ?>
                
                <div class="post-content" style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-size: 18px; line-height: 1.8;">
                    <?php the_content(); ?>
                </div>
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
