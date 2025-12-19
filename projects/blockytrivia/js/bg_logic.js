
function updateBackground(screenName) {
    const bgContainer = document.getElementById('bg-container');
    const phases123 = ['menu', 'quest', 'difficulty'];
    const phases45 = ['game', 'gameOver'];

    if (phases123.includes(screenName)) {
        bgContainer.style.backgroundImage = "url('images/backgrounds/menubackground.png')";
        bgContainer.classList.remove('hidden');
    } else if (phases45.includes(screenName)) {
        bgContainer.style.backgroundImage = "url('images/backgrounds/bossbackground.png')";
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
