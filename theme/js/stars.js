document.addEventListener('DOMContentLoaded', function() {
    // Create stars container
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    document.body.insertBefore(starsContainer, document.body.firstChild);
    
    // Create multiple layers of stars for parallax effect
    const layers = [
        { count: 100, speed: 0.5, size: 1, driftSpeed: 0.02 },
        { count: 75, speed: 0.3, size: 2, driftSpeed: 0.015 },
        { count: 50, speed: 0.15, size: 1.5, driftSpeed: 0.01 }
    ];
    
    const stars = [];
    
    layers.forEach((layer, layerIndex) => {
        const layerDiv = document.createElement('div');
        layerDiv.className = `stars-layer stars-layer-${layerIndex + 1}`;
        layerDiv.style.zIndex = -10 + layerIndex;
        
        for (let i = 0; i < layer.count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            star.style.left = `${x}%`;
            star.style.top = `${y}%`;
            star.style.width = `${layer.size}px`;
            star.style.height = `${layer.size}px`;
            
            // Random animation delay for twinkling
            star.style.animationDelay = `${Math.random() * 3}s`;
            star.style.animationDuration = `${2 + Math.random() * 2}s`;
            
            // Store data for animation
            star.dataset.speed = layer.speed;
            star.dataset.driftSpeed = layer.driftSpeed;
            star.dataset.driftX = (Math.random() - 0.5) * 2; // -1 to 1
            star.dataset.driftY = (Math.random() - 0.5) * 2; // -1 to 1
            star.dataset.baseX = x;
            star.dataset.baseY = y;
            
            stars.push(star);
            layerDiv.appendChild(star);
        }
        
        starsContainer.appendChild(layerDiv);
    });
    
    let scrollY = 0;
    let time = 0;
    
    // Animation loop for automatic movement
    function animateStars() {
        time += 0.01;
        
        stars.forEach(star => {
            const driftSpeed = parseFloat(star.dataset.driftSpeed);
            const driftX = parseFloat(star.dataset.driftX);
            const driftY = parseFloat(star.dataset.driftY);
            const speed = parseFloat(star.dataset.speed);
            const baseX = parseFloat(star.dataset.baseX);
            const baseY = parseFloat(star.dataset.baseY);
            
            // Automatic drift movement
            const autoX = Math.sin(time * driftSpeed + baseX) * driftX * 20;
            const autoY = Math.cos(time * driftSpeed + baseY) * driftY * 20;
            
            // Parallax scroll effect
            const scrollOffset = -(scrollY * speed);
            
            // Combine both movements
            star.style.transform = `translate(${autoX}px, ${autoY + scrollOffset}px)`;
        });
        
        requestAnimationFrame(animateStars);
    }
    
    // Start animation
    animateStars();
    
    // Parallax effect on scroll
    let ticking = false;
    
    function updateScroll() {
        scrollY = window.pageYOffset;
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateScroll);
            ticking = true;
        }
    });
});
