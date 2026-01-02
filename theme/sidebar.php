<?php if (is_active_sidebar('sidebar-1')) : ?>
    <aside class="sidebar">
        <?php dynamic_sidebar('sidebar-1'); ?>
    </aside>
<?php else : ?>
    <aside class="sidebar">
        <div class="widget">
            <h2 class="widget-title"><?php echo __('Über dieses Theme', 'custom-theme'); ?></h2>
            <p><?php echo __('Dies ist ein benutzerdefiniertes WordPress-Theme. Fügen Sie Widgets über das Dashboard hinzu.', 'custom-theme'); ?></p>
        </div>
        
        <div class="widget">
            <h2 class="widget-title"><?php echo __('Neueste Beiträge', 'custom-theme'); ?></h2>
            <ul>
                <?php
                $recent_posts = wp_get_recent_posts(array(
                    'numberposts' => 5,
                    'post_status' => 'publish'
                ));
                foreach ($recent_posts as $post) :
                ?>
                    <li>
                        <a href="<?php echo get_permalink($post['ID']); ?>">
                            <?php echo esc_html($post['post_title']); ?>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </aside>
<?php endif; ?>
