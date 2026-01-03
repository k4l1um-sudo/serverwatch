<?php
/*
Template Name: Kontakt
*/
get_header(); 

// Handle form submission
$success = false;
$error = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['contact_form_submit'])) {
    // Verify nonce for security
    if (!isset($_POST['contact_nonce']) || !wp_verify_nonce($_POST['contact_nonce'], 'contact_form')) {
        $error = 'Sicherheitsüberprüfung fehlgeschlagen.';
    } else {
        // Sanitize input
        $name = sanitize_text_field($_POST['contact_name']);
        $email = sanitize_email($_POST['contact_email']);
        $subject = sanitize_text_field($_POST['contact_subject']);
        $message = sanitize_textarea_field($_POST['contact_message']);
        
        // Validate
        if (empty($name) || empty($email) || empty($subject) || empty($message)) {
            $error = 'Bitte füllen Sie alle Felder aus.';
        } elseif (!is_email($email)) {
            $error = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        } else {
            // Send email
            $to = 'info@stolberg.de';
            $email_subject = 'Kontaktanfrage: ' . $subject;
            $email_body = "Name: $name\n";
            $email_body .= "E-Mail: $email\n\n";
            $email_body .= "Betreff: $subject\n\n";
            $email_body .= "Nachricht:\n$message\n";
            
            $headers = array(
                'Content-Type: text/plain; charset=UTF-8',
                'From: ' . get_bloginfo('name') . ' <noreply@' . $_SERVER['HTTP_HOST'] . '>',
                'Reply-To: ' . $name . ' <' . $email . '>'
            );
            
            if (wp_mail($to, $email_subject, $email_body, $headers)) {
                $success = true;
            } else {
                $error = 'Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.';
            }
        }
    }
}
?>

<main class="site-content" id="content">
    <div class="container">
        <article class="single-post">
            <header class="post-header">
                <h1 class="post-title">Kontakt</h1>
            </header>
            
            <div class="post-content">
                <?php if ($success): ?>
                    <div class="contact-message success">
                        <strong>Vielen Dank!</strong> Ihre Nachricht wurde erfolgreich versendet. Wir werden uns schnellstmöglich bei Ihnen melden.
                    </div>
                <?php elseif ($error): ?>
                    <div class="contact-message error">
                        <strong>Fehler:</strong> <?php echo esc_html($error); ?>
                    </div>
                <?php endif; ?>
                
                <div class="contact-intro">
                    <p>Haben Sie Fragen oder möchten Sie mit uns in Kontakt treten? Füllen Sie einfach das untenstehende Formular aus und wir werden uns schnellstmöglich bei Ihnen melden.</p>
                </div>
                
                <form method="post" action="" class="contact-form" id="contact-form">
                    <?php wp_nonce_field('contact_form', 'contact_nonce'); ?>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="contact_name">Name *</label>
                            <input 
                                type="text" 
                                id="contact_name" 
                                name="contact_name" 
                                required
                                value="<?php echo isset($_POST['contact_name']) ? esc_attr($_POST['contact_name']) : ''; ?>"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="contact_email">E-Mail *</label>
                            <input 
                                type="email" 
                                id="contact_email" 
                                name="contact_email" 
                                required
                                value="<?php echo isset($_POST['contact_email']) ? esc_attr($_POST['contact_email']) : ''; ?>"
                            >
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="contact_subject">Betreff *</label>
                        <input 
                            type="text" 
                            id="contact_subject" 
                            name="contact_subject" 
                            required
                            value="<?php echo isset($_POST['contact_subject']) ? esc_attr($_POST['contact_subject']) : ''; ?>"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="contact_message">Nachricht *</label>
                        <textarea 
                            id="contact_message" 
                            name="contact_message" 
                            rows="8" 
                            required
                        ><?php echo isset($_POST['contact_message']) ? esc_textarea($_POST['contact_message']) : ''; ?></textarea>
                    </div>
                    
                    <div class="form-privacy">
                        <label>
                            <input type="checkbox" name="contact_privacy" required>
                            Ich habe die <a href="<?php echo esc_url(home_url('/datenschutz')); ?>" target="_blank">Datenschutzerklärung</a> zur Kenntnis genommen. Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und für Rückfragen gespeichert werden.
                        </label>
                    </div>
                    
                    <button type="submit" name="contact_form_submit" class="btn contact-submit">
                        Nachricht senden
                    </button>
                </form>
                
                <div class="contact-info">
                    <h2>Kontaktinformationen</h2>
                    <div class="contact-details">
                        <div class="contact-detail">
                            <strong>Telefon:</strong><br>
                            <a href="tel:+491711859808">+49 171 1859808</a>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    </div>
</main>

<?php get_footer(); ?>
