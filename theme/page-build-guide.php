<?php
/*
Template Name: Build Guide
*/
get_header(); ?>

<main class="site-content build-guide">
    <?php while (have_posts()) : the_post(); ?>
        
        <!-- Hero Section mit Build-Bild -->
        <?php if (has_post_thumbnail()) : ?>
            <div class="build-hero" style="background-image: linear-gradient(rgba(10, 8, 7, 0.7), rgba(15, 13, 12, 0.9)), url('<?php echo get_the_post_thumbnail_url(get_the_ID(), 'full'); ?>');">
                <div class="container">
                    <div class="build-hero-content">
                        <span class="build-class">PALADIN BUILD</span>
                        <h1 class="build-title"><?php the_title(); ?></h1>
                        <div class="build-meta">
                            <?php 
                            $season = get_post_meta(get_the_ID(), 'build_season', true);
                            $season_display = match($season) {
                                'season_7' => 'Season 7',
                                'season_8' => 'Season 8',
                                'season_9' => 'Season 9',
                                'season_10' => 'Season 10',
                                'season_11' => 'Season 11',
                                'season_12' => 'Season 12',
                                'season_13' => 'Season 13',
                                'eternal' => 'Eternal',
                                default => 'Season 11'
                            };
                            ?>
                            <span class="build-season"><?php echo esc_html($season_display); ?></span>
                            <span class="build-tier">S-TIER</span>
                            <span class="build-type">ENDGAME</span>
                        </div>
                    </div>
                </div>
            </div>
        <?php endif; ?>

        <div class="container">
            <div class="build-content-wrapper">
                
                <!-- Sidebar Navigation -->
                <aside class="build-sidebar">
                    <nav class="build-nav">
                        <h3>INHALT</h3>
                        <ul>
                            <li><a href="#allgemeines">Allgemeines</a></li>
                            <li><a href="#bewertung">Build Bewertung</a></li>
                            <li><a href="#spielweise">Spielweise</a></li>
                            <?php if (get_post_meta(get_the_ID(), 'd4builds_url', true)) : ?>
                            <li><a href="#d4builds">D4Builds Planner</a></li>
                            <?php endif; ?>
                        </ul>
                    </nav>
                </aside>

                <!-- Main Content -->
                <article class="build-main-content">
                    
                    <!-- ALLGEMEINES Section -->
                    <section id="allgemeines" class="build-section">
                        <h2 class="section-title">ALLGEMEINES</h2>
                        <div class="section-content">
                            <?php 
                            $allgemeines = get_post_meta(get_the_ID(), 'build_allgemeines', true);
                            echo wpautop($allgemeines ? $allgemeines : 'Beschreibung des Builds hier eingeben...');
                            ?>
                        </div>
                    </section>

                    <!-- BUILD BEWERTUNG -->
                    <section id="bewertung" class="build-section build-rating">
                        <h2 class="section-title">BUILD BEWERTUNG</h2>
                        <div class="rating-grid">
                            <div class="rating-item">
                                <span class="rating-label">VS. MONSTER</span>
                                <span class="rating-value"><?php echo get_post_meta(get_the_ID(), 'rating_monster', true) ?: 'Sehr gut'; ?></span>
                            </div>
                            <div class="rating-item">
                                <span class="rating-label">VS. BOSSE</span>
                                <span class="rating-value"><?php echo get_post_meta(get_the_ID(), 'rating_boss', true) ?: 'Sehr gut'; ?></span>
                            </div>
                            <div class="rating-item">
                                <span class="rating-label">ROBUSTHEIT</span>
                                <span class="rating-value"><?php echo get_post_meta(get_the_ID(), 'rating_robustheit', true) ?: 'Sehr gut'; ?></span>
                            </div>
                            <div class="rating-item">
                                <span class="rating-label">MOBILITÄT</span>
                                <span class="rating-value"><?php echo get_post_meta(get_the_ID(), 'rating_mobilitaet', true) ?: 'Sehr gut'; ?></span>
                            </div>
                            <div class="rating-item">
                                <span class="rating-label">SPIELWEISE</span>
                                <span class="rating-value"><?php echo get_post_meta(get_the_ID(), 'rating_spielweise', true) ?: 'Einfach'; ?></span>
                            </div>
                            <div class="rating-item">
                                <span class="rating-label">BUDGET</span>
                                <span class="rating-value"><?php echo get_post_meta(get_the_ID(), 'rating_budget', true) ?: 'Günstig'; ?></span>
                            </div>
                        </div>
                    </section>

                    <!-- SPIELWEISE Section -->
                    <section id="spielweise" class="build-section">
                        <h2 class="section-title">SPIELWEISE</h2>
                        <div class="section-content">
                            <?php 
                            $spielweise = get_post_meta(get_the_ID(), 'build_spielweise', true);
                            echo wpautop($spielweise ? $spielweise : 'Spielweise Beschreibung hier eingeben...');
                            ?>
                        </div>
                    </section>

                    <!-- D4BUILDS Section -->
                    <?php 
                    $d4builds_url = get_post_meta(get_the_ID(), 'd4builds_url', true);
                    
                    if ($d4builds_url) : ?>
                        <section id="d4builds" class="build-section d4builds-section">
                            <h2 class="section-title">BUILD PLANNER</h2>
                            <div class="d4builds-container">
                                <!-- D4Builds Build Card -->
                                <div class="d4builds-build-card">
                                    <div class="d4builds-icon">
                                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="10" y="10" width="60" height="60" rx="8" stroke="currentColor" stroke-width="3"/>
                                            <path d="M25 35L35 25L45 35M35 25V55" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                                            <path d="M55 45L45 55L35 45M45 55V25" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                                            <circle cx="25" cy="55" r="3" fill="currentColor"/>
                                            <circle cx="55" cy="25" r="3" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <div class="d4builds-content">
                                        <h3>Vollständiger Build Planner</h3>
                                        <p>Öffne den interaktiven Build Planner auf D4Builds.gg und sieh dir den kompletten Build mit allen Skills, Paragon-Boards, Items und Aspekten an.</p>
                                        <a href="<?php echo esc_url($d4builds_url); ?>" 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           class="d4builds-button">
                                            <span>Build auf D4Builds.gg öffnen</span>
                                            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                                                <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>
                    <?php endif; ?>

                    <!-- Hauptinhalt (für zusätzliche Infos) -->
                    <div class="additional-content">
                        <?php the_content(); ?>
                    </div>

                </article>
            </div>
        </div>

    <?php endwhile; ?>
</main>

<?php get_footer(); ?>
