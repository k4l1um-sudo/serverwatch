<footer class="site-footer">
    <div class="container">
        <div class="footer-content">
            <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. <?php echo __('Alle Rechte vorbehalten.', 'custom-theme'); ?></p>
            
            <nav class="footer-navigation">
                <?php
                // Finde Kontakt-Seite
                $kontakt = get_page_by_path('kontakt');
                if ($kontakt) {
                    echo '<a href="' . esc_url(get_permalink($kontakt->ID)) . '">Kontakt</a>';
                } else {
                    echo '<a href="' . esc_url(home_url('/kontakt')) . '">Kontakt</a>';
                }
                ?>
                <span class="separator">|</span>
                <?php
                // Finde Impressum-Seite
                $impressum = get_page_by_path('impressum');
                if ($impressum) {
                    echo '<a href="' . esc_url(get_permalink($impressum->ID)) . '">Impressum</a>';
                } else {
                    echo '<a href="' . esc_url(home_url('/impressum')) . '">Impressum</a>';
                }
                ?>
                <span class="separator">|</span>
                <?php
                // Finde Datenschutz-Seite
                $datenschutz = get_page_by_path('datenschutz');
                if (!$datenschutz) {
                    $datenschutz = get_page_by_path('datenschutzerklaerung');
                }
                if ($datenschutz) {
                    echo '<a href="' . esc_url(get_permalink($datenschutz->ID)) . '">Datenschutz</a>';
                } else {
                    echo '<a href="' . esc_url(home_url('/datenschutz')) . '">Datenschutz</a>';
                }
                ?>
            </nav>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
