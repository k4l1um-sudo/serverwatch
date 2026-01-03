<?php get_header(); ?>

<main class="site-content">
    <div class="container">
        <?php while (have_posts()) : the_post(); 
            $categories = get_the_category();
            $cat_name = !empty($categories) ? esc_html($categories[0]->name) : 'BUILD';
        ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class('single-post'); ?>>
                <?php if (has_post_thumbnail()) : ?>
                    <div class="hero-section" style="background-image: linear-gradient(rgba(15, 13, 12, 0.85), rgba(10, 10, 10, 0.95)), url('<?php echo get_the_post_thumbnail_url(get_the_ID(), 'full'); ?>');
                         background-size: cover;
                         background-position: center;
                         min-height: 60vh;">
                        <div class="hero-content">
                            <span class="post-category" style="margin-bottom: 20px; display: inline-block;"><?php echo $cat_name; ?></span>
                            <h1 class="hero-title"><?php the_title(); ?></h1>
                            <div class="post-meta" style="justify-content: center;">
                                <span class="post-date">
                                    <?php echo get_the_date('d.m.Y'); ?>
                                </span>
                                <span class="post-author">
                                    von <?php echo get_the_author(); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                <?php else : ?>
                    <header class="post-header" style="text-align: center; padding: 80px 0 40px; border-bottom: 2px solid rgba(42, 37, 32, 0.5);">
                        <span class="post-category" style="margin-bottom: 20px; display: inline-block;"><?php echo $cat_name; ?></span>
                        <h1 class="hero-title" style="margin-bottom: 20px;"><?php the_title(); ?></h1>
                        <div class="post-meta" style="justify-content: center;">
                            <span class="post-date">
                                <?php echo get_the_date('d.m.Y'); ?>
                            </span>
                            <span class="post-author">
                                von <?php echo get_the_author(); ?>
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
