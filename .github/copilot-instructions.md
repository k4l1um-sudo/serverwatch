# WordPress Theme Development Project

## Project Overview
A custom WordPress theme template with local Docker development environment.

## Tech Stack
- PHP (WordPress theme development)
- CSS3 (responsive design)
- Docker & Docker Compose
- WordPress 6.x
- MySQL 8.0
- phpMyAdmin

## Development Setup
1. Install Docker Desktop
2. Run `docker-compose up -d`
3. Access WordPress at http://localhost:8080
4. Access phpMyAdmin at http://localhost:8081

## Theme Structure
- `/theme/` - Custom WordPress theme files
- `style.css` - Theme stylesheet and metadata
- `functions.php` - Theme functionality
- Template files: index.php, header.php, footer.php, single.php, page.php

## Coding Standards
- Follow WordPress Coding Standards
- Use WordPress functions for security (esc_html, esc_url, etc.)
- Proper sanitization and validation
- Responsive design with mobile-first approach
