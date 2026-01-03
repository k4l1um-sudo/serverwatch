<?php
/**
 * Comments Template
 * Diablo IV Style
 */

if (post_password_required()) {
    return;
}
?>

<div id="comments" class="comments-area">
    <?php if (have_comments()) : ?>
        <h2 class="comments-title">
            <?php
            $comment_count = get_comments_number();
            if ($comment_count === 1) {
                echo '1 Kommentar';
            } else {
                echo $comment_count . ' Kommentare';
            }
            ?>
        </h2>

        <ol class="comment-list">
            <?php
            wp_list_comments(array(
                'style'       => 'ol',
                'short_ping'  => true,
                'avatar_size' => 60,
            ));
            ?>
        </ol>

        <?php if (get_comment_pages_count() > 1 && get_option('page_comments')) : ?>
            <nav class="comment-navigation">
                <div class="nav-previous"><?php previous_comments_link('&larr; Ältere Kommentare'); ?></div>
                <div class="nav-next"><?php next_comments_link('Neuere Kommentare &rarr;'); ?></div>
            </nav>
        <?php endif; ?>

    <?php endif; ?>

    <?php if (!comments_open() && get_comments_number() && post_type_supports(get_post_type(), 'comments')) : ?>
        <p class="no-comments">Kommentare sind geschlossen.</p>
    <?php endif; ?>

    <?php
    comment_form(array(
        'title_reply'          => 'Kommentar verfassen',
        'title_reply_to'       => 'Antworten auf %s',
        'cancel_reply_link'    => 'Abbrechen',
        'label_submit'         => 'Kommentar absenden',
        'comment_field'        => '<p class="comment-form-comment"><label for="comment">Kommentar</label><textarea id="comment" name="comment" cols="45" rows="8" required="required"></textarea></p>',
        'fields'               => array(
            'author' => '<p class="comment-form-author"><label for="author">Name *</label><input id="author" name="author" type="text" value="' . esc_attr($commenter['comment_author']) . '" size="30" required="required" /></p>',
            'email'  => '<p class="comment-form-email"><label for="email">E-Mail *</label><input id="email" name="email" type="email" value="' . esc_attr($commenter['comment_author_email']) . '" size="30" required="required" /></p>',
            'url'    => '<p class="comment-form-url"><label for="url">Website</label><input id="url" name="url" type="url" value="' . esc_attr($commenter['comment_author_url']) . '" size="30" /></p>',
        ),
    ));
    ?>
</div>
