document.addEventListener('DOMContentLoaded', function() {
    // Check if cookie consent was already given
    const cookieConsent = getCookie('cookie_consent');
    
    if (!cookieConsent) {
        showCookieBanner();
    }
    
    function showCookieBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-text">
                    <h3>Cookie-Einstellungen</h3>
                    <p>Wir verwenden Cookies, um Ihnen die bestmögliche Nutzung unserer Website zu ermöglichen. 
                    Durch die Nutzung dieser Website stimmen Sie der Verwendung von Cookies zu.</p>
                </div>
                <div class="cookie-buttons">
                    <button id="cookie-accept" class="cookie-btn cookie-accept">Alle akzeptieren</button>
                    <button id="cookie-essential" class="cookie-btn cookie-essential">Nur notwendige</button>
                    <a href="/datenschutz" class="cookie-link">Mehr erfahren</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Animate banner in
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
        
        // Accept all cookies
        document.getElementById('cookie-accept').addEventListener('click', function() {
            setCookie('cookie_consent', 'all', 365);
            hideCookieBanner(banner);
        });
        
        // Accept only essential cookies
        document.getElementById('cookie-essential').addEventListener('click', function() {
            setCookie('cookie_consent', 'essential', 365);
            hideCookieBanner(banner);
        });
    }
    
    function hideCookieBanner(banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
    
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
    }
    
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
});
