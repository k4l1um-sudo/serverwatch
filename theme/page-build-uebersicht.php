<?php
/*
Template Name: Build Übersicht
*/
get_header(); ?>

<!-- Hero Section -->
<section class="hero-section">
    <div class="hero-content">
        <h1 class="hero-title">BUILD ÜBERSICHT</h1>
        <p class="hero-subtitle">Alle Builds für Diablo 4 auf einen Blick</p>
    </div>
</section>

<main class="site-content" id="content">
    <div class="container">
        <div class="welcome-section">
            <h1>ALLE VERFÜGBAREN BUILDS</h1>
            <p>Hier findest du eine komplette Übersicht aller Build-Guides. Klicke auf einen Build, um alle Details, Items, Skills und den Paragon-Baum zu sehen.</p>
        </div>

        <!-- Build Filter -->
        <div class="build-filters">
            <form method="get" class="filter-form">
                <div class="filter-group">
                    <label for="filter-season">Season</label>
                    <select name="season" id="filter-season">
                        <option value="">Alle Seasons</option>
                        <option value="season_7" <?php selected(isset($_GET['season']) && $_GET['season'] == 'season_7'); ?>>Season 7</option>
                        <option value="season_8" <?php selected(isset($_GET['season']) && $_GET['season'] == 'season_8'); ?>>Season 8</option>
                        <option value="season_9" <?php selected(isset($_GET['season']) && $_GET['season'] == 'season_9'); ?>>Season 9</option>
                        <option value="season_10" <?php selected(isset($_GET['season']) && $_GET['season'] == 'season_10'); ?>>Season 10</option>
                        <option value="season_11" <?php selected(isset($_GET['season']) && $_GET['season'] == 'season_11'); ?>>Season 11</option>
                        <option value="season_12" <?php selected(isset($_GET['season']) && $_GET['season'] == 'season_12'); ?>>Season 12</option>
                        <option value="season_13" <?php selected(isset($_GET['season']) && $_GET['season'] == 'season_13'); ?>>Season 13</option>
                        <option value="eternal" <?php selected(isset($_GET['season']) && $_GET['season'] == 'eternal'); ?>>Eternal</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="filter-spielweise">Spielweise</label>
                    <select name="spielweise" id="filter-spielweise">
                        <option value="">Alle</option>
                        <option value="Sehr einfach" <?php selected(isset($_GET['spielweise']) && $_GET['spielweise'] == 'Sehr einfach'); ?>>Sehr einfach</option>
                        <option value="Einfach" <?php selected(isset($_GET['spielweise']) && $_GET['spielweise'] == 'Einfach'); ?>>Einfach</option>
                        <option value="Mittel" <?php selected(isset($_GET['spielweise']) && $_GET['spielweise'] == 'Mittel'); ?>>Mittel</option>
                        <option value="Schwer" <?php selected(isset($_GET['spielweise']) && $_GET['spielweise'] == 'Schwer'); ?>>Schwer</option>
                        <option value="Sehr schwer" <?php selected(isset($_GET['spielweise']) && $_GET['spielweise'] == 'Sehr schwer'); ?>>Sehr schwer</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="filter-budget">Budget</label>
                    <select name="budget" id="filter-budget">
                        <option value="">Alle</option>
                        <option value="Sehr günstig" <?php selected(isset($_GET['budget']) && $_GET['budget'] == 'Sehr günstig'); ?>>Sehr günstig</option>
                        <option value="Günstig" <?php selected(isset($_GET['budget']) && $_GET['budget'] == 'Günstig'); ?>>Günstig</option>
                        <option value="Mittel" <?php selected(isset($_GET['budget']) && $_GET['budget'] == 'Mittel'); ?>>Mittel</option>
                        <option value="Teuer" <?php selected(isset($_GET['budget']) && $_GET['budget'] == 'Teuer'); ?>>Teuer</option>
                        <option value="Sehr teuer" <?php selected(isset($_GET['budget']) && $_GET['budget'] == 'Sehr teuer'); ?>>Sehr teuer</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="filter-monster">VS Monster</label>
                    <select name="monster" id="filter-monster">
                        <option value="">Alle</option>
                        <option value="Sehr gut" <?php selected(isset($_GET['monster']) && $_GET['monster'] == 'Sehr gut'); ?>>Sehr gut</option>
                        <option value="Gut" <?php selected(isset($_GET['monster']) && $_GET['monster'] == 'Gut'); ?>>Gut</option>
                        <option value="Mittel" <?php selected(isset($_GET['monster']) && $_GET['monster'] == 'Mittel'); ?>>Mittel</option>
                        <option value="Schlecht" <?php selected(isset($_GET['monster']) && $_GET['monster'] == 'Schlecht'); ?>>Schlecht</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="filter-boss">VS Bosse</label>
                    <select name="boss" id="filter-boss">
                        <option value="">Alle</option>
                        <option value="Sehr gut" <?php selected(isset($_GET['boss']) && $_GET['boss'] == 'Sehr gut'); ?>>Sehr gut</option>
                        <option value="Gut" <?php selected(isset($_GET['boss']) && $_GET['boss'] == 'Gut'); ?>>Gut</option>
                        <option value="Mittel" <?php selected(isset($_GET['boss']) && $_GET['boss'] == 'Mittel'); ?>>Mittel</option>
                        <option value="Schlecht" <?php selected(isset($_GET['boss']) && $_GET['boss'] == 'Schlecht'); ?>>Schlecht</option>
                    </select>
                </div>

                <div class="filter-actions">
                    <button type="submit" class="filter-button">Filtern</button>
                    <a href="<?php echo esc_url(get_permalink()); ?>" class="filter-reset">Zurücksetzen</a>
                </div>
            </form>
        </div>

        <?php
        // Hole alle Seiten mit dem Build Guide Template
        $meta_query = array(
            array(
                'key' => '_wp_page_template',
                'value' => 'page-build-guide.php',
                'compare' => '='
            )
        );

        // Filter hinzufügen
        if (!empty($_GET['season'])) {
            $meta_query[] = array(
                'key' => 'build_season',
                'value' => sanitize_text_field($_GET['season']),
                'compare' => '='
            );
        }

        if (!empty($_GET['spielweise'])) {
            $meta_query[] = array(
                'key' => 'rating_spielweise',
                'value' => sanitize_text_field($_GET['spielweise']),
                'compare' => '='
            );
        }

        if (!empty($_GET['budget'])) {
            $meta_query[] = array(
                'key' => 'rating_budget',
                'value' => sanitize_text_field($_GET['budget']),
                'compare' => '='
            );
        }

        if (!empty($_GET['monster'])) {
            $meta_query[] = array(
                'key' => 'rating_monster',
                'value' => sanitize_text_field($_GET['monster']),
                'compare' => '='
            );
        }

        if (!empty($_GET['boss'])) {
            $meta_query[] = array(
                'key' => 'rating_boss',
                'value' => sanitize_text_field($_GET['boss']),
                'compare' => '='
            );
        }

        $args = array(
            'post_type' => 'page',
            'posts_per_page' => -1,
            'meta_query' => $meta_query,
            'orderby' => 'date',
            'order' => 'DESC',
            'post_status' => 'publish'
        );
        
        $build_query = new WP_Query($args);
        
        if ($build_query->have_posts()) : ?>
            <div class="builds-overview-grid">
                <?php while ($build_query->have_posts()) : $build_query->the_post(); 
                    // Hole ACF Felder
                    $rating_tier = 'S-TIER'; // Könnte auch ein ACF-Feld sein
                    $rating_monster = get_post_meta(get_the_ID(), 'rating_monster', true);
                    $rating_boss = get_post_meta(get_the_ID(), 'rating_boss', true);
                ?>
                    <article class="build-overview-card">
                        <?php if (has_post_thumbnail()) : ?>
                            <div class="build-card-thumbnail">
                                <a href="<?php the_permalink(); ?>">
                                    <?php the_post_thumbnail('diablo-featured'); ?>
                                    <div class="build-card-overlay">
                                        <span class="build-tier-badge"><?php echo esc_html($rating_tier); ?></span>
                                    </div>
                                </a>
                            </div>
                        <?php else : ?>
                            <div class="build-card-thumbnail build-card-no-image">
                                <a href="<?php the_permalink(); ?>">
                                    <div class="build-card-overlay">
                                        <span class="build-tier-badge"><?php echo esc_html($rating_tier); ?></span>
                                    </div>
                                </a>
                            </div>
                        <?php endif; ?>
                        
                        <div class="build-card-content">
                            <h2 class="build-card-title">
                                <a href="<?php the_permalink(); ?>">
                                    <?php the_title(); ?>
                                </a>
                            </h2>
                            
                            <div class="build-card-meta">
                                <span class="build-card-date">
                                    <?php echo get_the_date('d.m.Y'); ?>
                                </span>
                            </div>
                            
                            <?php if ($rating_monster || $rating_boss) : ?>
                                <div class="build-card-ratings">
                                    <?php if ($rating_monster) : ?>
                                        <div class="build-card-rating-item">
                                            <span class="rating-label">Monster:</span>
                                            <span class="rating-value"><?php echo esc_html($rating_monster); ?></span>
                                        </div>
                                    <?php endif; ?>
                                    <?php if ($rating_boss) : ?>
                                        <div class="build-card-rating-item">
                                            <span class="rating-label">Bosse:</span>
                                            <span class="rating-value"><?php echo esc_html($rating_boss); ?></span>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                            
                            <?php if (has_excerpt()) : ?>
                                <div class="build-card-excerpt">
                                    <?php the_excerpt(); ?>
                                </div>
                            <?php endif; ?>
                            
                            <a href="<?php the_permalink(); ?>" class="build-card-link">
                                Zum Build →
                            </a>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>
        <?php else : ?>
            <div class="no-builds-message">
                <p>Aktuell sind noch keine Builds verfügbar. Schau bald wieder vorbei!</p>
            </div>
        <?php endif; 
        wp_reset_postdata();
        ?>
    </div>
</main>

<?php get_footer(); ?>
