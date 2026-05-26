
function updateBackground(screenName) {
    const bgContainer = document.getElementById('bg-container');
    const phases123 = ['menu', 'quest', 'difficulty'];
    const phases45 = ['game', 'gameOver'];

    const bgVideo = document.getElementById('bg-video');



    if (phases123.includes(screenName)) {
        // Show video, hide static bg container or make it transparent
        if (bgVideo) {
            bgVideo.classList.remove('hidden');
            if (bgVideo.paused) {
                bgVideo.play().catch(e => console.log("Video play failed", e));
            }
        }
        bgContainer.style.backgroundImage = 'none';
        // We can keep bgContainer transparent or hidden if we want the video to show
        // If bgContainer is z-[-1] and video is z-[-2], bgContainer needs to be transparent or hidden.
        // Let's just transparent it or remove the image.
    } else if (phases45.includes(screenName)) {
        // Hide video, show static bg
        if (bgVideo) {
            bgVideo.classList.add('hidden');
            bgVideo.pause();
        }
        bgContainer.style.backgroundImage = "url('images/backgrounds/test_background.png')";
        bgContainer.classList.remove('hidden');
    } else if (screenName === 'credits') {

        // Keep existing background logic for credits (which currently relies on body color or no specific overlay)
        // If we want to hide the dynamic background:
        // bgContainer.classList.add('hidden');
        // But the requirement says "Keep its existing background unchanged."
        // The Credits screen is an overlay div with bg-zinc-900.
        // If we leave the background image visible, it might show through if the credits screen has transparency?
        // Credits screen has 'bg-zinc-900', so it is opaque.
        // So we can leave the background as is (likely menubackground if coming from menu).
        // Or we can explicitly set it to menubackground if that's preferred.
        // Since credits is accessed from Menu or Game Over, let's just not change the background
        // when switching to credits, so it stays whatever it was (Menu or Game Over).
    }
}
