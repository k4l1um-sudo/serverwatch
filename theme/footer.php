<footer class="site-footer">
    <div class="container">
        <div class="footer-content">
            <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. <?php echo __('Alle Rechte vorbehalten.', 'diablo-theme'); ?></p>
            
            <nav class="footer-navigation">
                <?php
                $kontakt = get_page_by_path('kontakt');
                if ($kontakt) {
                    echo '<a href="' . esc_url(get_permalink($kontakt->ID)) . '">Kontakt</a>';
                } else {
                    echo '<a href="' . esc_url(home_url('/kontakt')) . '">Kontakt</a>';
                }
                ?>
                <span class="separator">|</span>
                <?php
                $impressum = get_page_by_path('impressum');
                if ($impressum) {
                    echo '<a href="' . esc_url(get_permalink($impressum->ID)) . '">Impressum</a>';
                } else {
                    echo '<a href="' . esc_url(home_url('/impressum')) . '">Impressum</a>';
                }
                ?>
                <span class="separator">|</span>
                <?php
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
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(42, 37, 32, 0.5);">
            <p style="color: var(--text-dark); font-size: 12px; font-family: 'Marcellus', serif;">
                Diablo IV und alle zugehörigen Logos sind Marken von Blizzard Entertainment, Inc.
            </p>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
