document.addEventListener('DOMContentLoaded', () => {
    // State
    const TOTAL_PAGES = 8; // Based on the extraction
    let currentPage = 1;

    // Elements
    const mainImg = document.getElementById('main-page-img');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentPageNav = document.getElementById('current-page-nav');
    const totalPagesNav = document.getElementById('total-pages-nav');
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const thumbnailsContainer = document.getElementById('thumbnails-container');
    const loader = document.getElementById('loader');

    // Audio Elements
    const audio = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const seekBar = document.getElementById('seek-bar');
    const volumeBar = document.getElementById('volume-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const visualizer = document.getElementById('visualizer');
    const visualizerBars = visualizer ? visualizer.querySelectorAll('.bar') : [];

    // Initialize
    totalPagesNav.textContent = TOTAL_PAGES;
    loadThumbnails();
    updatePage(currentPage);

    // Sidebar Toggle
    toggleSidebarBtn.addEventListener('click', () => {
        const isClosed = sidebar.classList.contains('-translate-x-full');
        if (isClosed) {
            sidebar.classList.remove('-translate-x-full');
            toggleSidebarBtn.classList.add('bg-emerald-600', 'text-white');
        } else {
            sidebar.classList.add('-translate-x-full');
            toggleSidebarBtn.classList.remove('bg-emerald-600', 'text-white');
        }
    });

    function loadThumbnails() {
        thumbnailsContainer.innerHTML = '';
        for (let i = 1; i <= TOTAL_PAGES; i++) {
            const btn = document.createElement('button');
            btn.className = `w-full aspect-[3/4] rounded-md overflow-hidden shadow-md transition hover:scale-105 bg-slate-800 ${i === currentPage ? 'thumbnail-active' : 'border border-slate-700/50'}`;
            btn.innerHTML = `<img src="assets/pages/page_${i}.jpg" alt="Page ${i}" class="w-full h-full object-cover opacity-80 hover:opacity-100 transition">`;
            btn.onclick = () => {
                updatePage(i);
                if(window.innerWidth < 768) {
                    sidebar.classList.add('-translate-x-full');
                }
            };
            thumbnailsContainer.appendChild(btn);
        }
    }

    function updateThumbnailsActiveState() {
        const btns = thumbnailsContainer.querySelectorAll('button');
        btns.forEach((btn, index) => {
            if (index + 1 === currentPage) {
                btn.classList.add('thumbnail-active');
                btn.classList.remove('border', 'border-slate-700/50');
            } else {
                btn.classList.remove('thumbnail-active');
                btn.classList.add('border', 'border-slate-700/50');
            }
        });
    }

    function updatePage(pageNumber) {
        if (pageNumber < 1 || pageNumber > TOTAL_PAGES) return;
        
        loader.classList.remove('hidden');
        mainImg.style.opacity = '0.3';
        mainImg.style.transform = currentPage < pageNumber ? 'rotateY(10deg) scale(0.95)' : 'rotateY(-10deg) scale(0.95)';
        
        currentPage = pageNumber;
        
        // Simulating slight network/load delay for visual effect
        setTimeout(() => {
            mainImg.src = `assets/pages/page_${currentPage}.jpg`;
            mainImg.onload = () => {
                loader.classList.add('hidden');
                mainImg.style.opacity = '1';
                mainImg.style.transform = 'rotateY(0) scale(1)';
            };
        }, 300);

        currentPageNav.textContent = currentPage;
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === TOTAL_PAGES;
        
        updateThumbnailsActiveState();
    }

    prevBtn.addEventListener('click', () => updatePage(currentPage - 1));
    nextBtn.addEventListener('click', () => updatePage(currentPage + 1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') updatePage(currentPage - 1);
        if (e.key === 'ArrowRight') updatePage(currentPage + 1);
    });

    // --- Audio Player Logic ---

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    audio.addEventListener('loadedmetadata', () => {
        seekBar.max = audio.duration;
        durationEl.textContent = formatTime(audio.duration);
    });

    // Handle missing metadata for some browsers without pre-interaction
    audio.addEventListener('durationchange', () => {
        seekBar.max = audio.duration;
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        seekBar.value = audio.currentTime;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        
        // Update seek bar completely generic gradient fix
        const percentage = (seekBar.value / seekBar.max) * 100;
        seekBar.style.background = `linear-gradient(to right, #10b981 ${percentage}%, #475569 ${percentage}%)`;
    });

    seekBar.addEventListener('input', () => {
        audio.currentTime = seekBar.value;
    });

    volumeBar.addEventListener('input', () => {
        audio.volume = volumeBar.value;
        const percentage = (volumeBar.value) * 100;
        volumeBar.style.background = `linear-gradient(to right, #10b981 ${percentage}%, #475569 ${percentage}%)`;
    });

    function togglePlay() {
        if (audio.paused) {
            audio.play().catch(e => console.log('Audio error (may need user interaction first):', e));
        } else {
            audio.pause();
        }
    }

    playPauseBtn.addEventListener('click', togglePlay);

    audio.addEventListener('play', () => {
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        playIcon.classList.remove('ml-1'); // Un-center play icon visually since pause is symmetrical
        visualizerBars.forEach(bar => bar.classList.add('active'));
    });

    audio.addEventListener('pause', () => {
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        playIcon.classList.add('ml-1');
        visualizerBars.forEach(bar => bar.classList.remove('active'));
    });

    audio.addEventListener('ended', () => {
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        visualizerBars.forEach(bar => bar.classList.remove('active'));
        seekBar.value = 0;
        audio.currentTime = 0;
        seekBar.style.background = '#475569';
    });
});
