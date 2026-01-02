<footer class="site-footer">
    <div class="container">
        <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. <?php echo __('Alle Rechte vorbehalten.', 'custom-theme'); ?></p>
        <?php
        wp_nav_menu(array(
            'theme_location' => 'footer',
            'container' => 'nav',
            'container_class' => 'footer-navigation',
            'fallback_cb' => false,
        ));
        ?>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
