<?php
/**
 * Template Name: Social Hub
 * Description: Zweispaltiges Layout mit Twitter-Feed und weiteren Infos
 */

get_header();
?>

<main class="social-hub-page">
    <div class="container">
        <div class="page-header">
            <h1 class="page-title">Neuigkeiten & Community</h1>
            <p class="page-subtitle">Bleibe auf dem Laufenden mit den neuesten Updates aus Sanktuario</p>
        </div>

        <div class="social-hub-grid">
            <!-- Linke Spalte: Twitter Feed -->
            <div class="social-column twitter-column">
                <div class="column-header">
                    <h2>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Offizieller Diablo Feed
                    </h2>
                    <a href="https://twitter.com/Diablo" target="_blank" rel="noopener noreferrer" class="view-on-twitter">
                        Auf X ansehen
                    </a>
                </div>
                
                <div class="twitter-feed-placeholder">
                    <div class="placeholder-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <h3>X/Twitter Plugin Installation</h3>
                        <p>Installiere das Plugin <strong>"Feeds for X (Formerly Twitter)"</strong> von Smash Balloon:</p>
                        <ol class="setup-steps">
                            <li>Dashboard → Plugins → Neu hinzufügen</li>
                            <li>Suche nach "Feeds for X"</li>
                            <li>Installieren & Aktivieren</li>
                            <li>X Account verbinden (@Diablo)</li>
                            <li>Shortcode hier einfügen: <code>[twitter-feed]</code></li>
                        </ol>
                        <p class="note">Danach wird hier der Live-Feed von @Diablo angezeigt.</p>
                    </div>
                </div>
            </div>

            <!-- Rechte Spalte: Zukünftige Inhalte -->
            <div class="social-column info-column">
                <div class="column-header">
                    <h2>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        Community Updates
                    </h2>
                </div>
                
                <div class="info-cards">
                    <div class="info-card placeholder-card">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                            </svg>
                        </div>
                        <h3>Discord Server</h3>
                        <p>Trete unserer Community bei und diskutiere mit anderen Nephalen über Builds, Strategien und mehr.</p>
                        <span class="placeholder-text">Bald verfügbar</span>
                    </div>

                    <div class="info-card placeholder-card">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                            </svg>
                        </div>
                        <h3>YouTube Guides</h3>
                        <p>Video-Tutorials zu den besten Builds und Endgame-Content für jede Saison.</p>
                        <span class="placeholder-text">In Planung</span>
                    </div>

                    <div class="info-card placeholder-card">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                <line x1="7" y1="7" x2="7.01" y2="7"/>
                            </svg>
                        </div>
                        <h3>Patch Notes</h3>
                        <p>Aktuelle Änderungen, Buffs, Nerfs und Balance-Updates im Überblick.</p>
                        <span class="placeholder-text">Kommt bald</span>
                    </div>

                    <div class="info-card placeholder-card">
                        <div class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="8" r="7"/>
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                            </svg>
                        </div>
                        <h3>Tier Lists</h3>
                        <p>Die stärksten Builds und Klassen für verschiedene Spielmodi und Schwierigkeitsgrade.</p>
                        <span class="placeholder-text">In Arbeit</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<?php get_footer(); ?>
