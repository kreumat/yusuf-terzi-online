/**
 * BUUELTS - İngilizce Öğretmenliği Topluluğu Websitesi
 * Popup yönetimi ve mobil navigasyon geliştirme komut dosyası
 */

// Sponsor resmiyle tekrarlanan bir popup oluştur ve göster
function tekrarlayanPopupGoster() {
    // Popup overlay oluştur
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    // Popup container oluştur
    const container = document.createElement('div');
    container.className = 'popup-container';
    container.style.width = 'auto';
    container.style.maxWidth = '90%';
    container.style.maxHeight = '90%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.overflow = 'hidden'; // Taşmayı engelle
    
    // İçerik sarmalayıcısı oluştur
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'popup-content-wrapper';
    contentWrapper.style.padding = '20px';
    contentWrapper.style.textAlign = 'center';
    contentWrapper.style.width = '100%';
    contentWrapper.style.maxWidth = '500px'; // Maksimum genişliği sınırla
    
    // Resim link sarmalayıcısı oluştur
    const imageLink = document.createElement('a');
    imageLink.href = 'hakkinda.html';
    imageLink.style.display = 'block';
    imageLink.style.width = '100%';
    imageLink.style.cursor = 'pointer';
    imageLink.style.transition = 'all 0.3s ease';
    
    // Sponsor resmi oluştur
    const sponsorImg = document.createElement('img');
    sponsorImg.src = 'gorseller/sponsorphoto.png';
    sponsorImg.alt = 'Sponsor';
    sponsorImg.style.width = '100%';
    sponsorImg.style.height = 'auto';
    sponsorImg.style.maxWidth = '100%';
    sponsorImg.style.maxHeight = '60vh'; // Yüksekliği görüntü alanının %60'ı ile sınırla
    sponsorImg.style.objectFit = 'contain';
    sponsorImg.style.borderRadius = '8px';
    sponsorImg.style.transition = 'all 0.3s ease';
    
    // JavaScript kullanarak hover efekti ekle
    imageLink.addEventListener('mouseenter', function() {
        sponsorImg.style.transform = 'scale(1.03)'; // Hafifçe azaltılmış ölçek
        sponsorImg.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    });
    
    imageLink.addEventListener('mouseleave', function() {
        sponsorImg.style.transform = 'scale(1)';
        sponsorImg.style.boxShadow = 'none';
    });
    
    // Buton konteyneri oluştur
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'popup-button-container';
    buttonContainer.style.marginTop = '0px';
    buttonContainer.style.width = '100%';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    
    // Kapat butonu oluştur
    const closeButton = document.createElement('button');
    closeButton.className = 'popup-button-close';
    closeButton.textContent = 'Kapat';
    
    // Elementleri ekle
    imageLink.appendChild(sponsorImg);
    contentWrapper.appendChild(imageLink);
    buttonContainer.appendChild(closeButton);
    container.appendChild(contentWrapper);
    container.appendChild(buttonContainer);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // Kapat butonuna tıklandığında
    closeButton.addEventListener('click', function() {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    });
    
    // Overlay'a tıklandığında kapat (ama resme veya butona tıklandığında değil)
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }
    });
    
    // Bu popup'ın gösterildiği zamanı kaydet
    localStorage.setItem('lastPopupTime_tr', Date.now());
}

// Resim Popup İşlevselliği
document.addEventListener('DOMContentLoaded', function() {
    // Popup resimlerini yönet
    const popupImages = document.querySelectorAll('.popup-trigger');
    
    if (popupImages.length > 0) {
        popupImages.forEach(image => {
            image.addEventListener('click', function(e) {
                e.preventDefault();
                
                const imgSrc = this.getAttribute('data-img') || this.src;
                
                // Popup overlay oluştur
                const overlay = document.createElement('div');
                overlay.className = 'popup-overlay';
                
                // Popup container oluştur
                const container = document.createElement('div');
                container.className = 'popup-container';
                
                // Resim sarmalayıcısı oluştur
                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'popup-image-wrapper';
                
                // Popup resmi oluştur
                const popupImg = document.createElement('img');
                popupImg.className = 'popup-image';
                popupImg.src = imgSrc;
                popupImg.alt = this.alt || 'Popup Resmi';
                
                // Buton konteyneri oluştur
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'popup-button-container';
                
                // Kapat butonu oluştur
                const closeButton = document.createElement('button');
                closeButton.className = 'popup-button-close';
                closeButton.textContent = 'Kapat';
                
                // Elementleri ekle
                imageWrapper.appendChild(popupImg);
                buttonContainer.appendChild(closeButton);
                container.appendChild(imageWrapper);
                container.appendChild(buttonContainer);
                overlay.appendChild(container);
                document.body.appendChild(overlay);
                
                // Kapat butonuna tıklandığında
                closeButton.addEventListener('click', function() {
                    overlay.classList.add('fade-out');
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                    }, 300);
                });
                
                // Overlay'a tıklandığında kapat
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) {
                        overlay.classList.add('fade-out');
                        setTimeout(() => {
                            document.body.removeChild(overlay);
                        }, 300);
                    }
                });
            });
        });
    }
    
    // Gelişmiş Mobil Navigasyon - çakışmaları önlemek için satır içi komut dosyalarından ÖNCE çalışmalıdır
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        // Çakışmaları önlemek için mevcut olay dinleyicilerini kaldır
        const navToggleClone = navToggle.cloneNode(true);
        navToggle.parentNode.replaceChild(navToggleClone, navToggle);
        
        // Klonlanmış elemana gelişmiş olay dinleyicisi ekle
        navToggleClone.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Erişilebilirlik
            const expanded = navMenu.classList.contains('active');
            this.setAttribute('aria-expanded', expanded);
            
            // Açıkken simgeyi X'e değiştir
            const icon = this.querySelector('i');
            if (icon) {
                if (expanded) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Dışarıya tıklandığında menüyü kapat
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && 
                !navToggleClone.contains(e.target) && 
                !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggleClone.setAttribute('aria-expanded', false);
                
                // Simgeyi sıfırla
                const icon = navToggleClone.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Nav bağlantısına tıklandığında menüyü kapat
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggleClone.setAttribute('aria-expanded', false);
                
                // Simgeyi sıfırla
                const icon = navToggleClone.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
    
    // Tekrarlayan popup kurulumu (her 10 dakikada bir)
    const tekrarlayanPopupKontrol = () => {
        // Önce bir popup'ın zaten görünür olup olmadığını kontrol et
        const existingPopup = document.querySelector('.popup-overlay');
        if (existingPopup) {
            return; // Zaten bir popup görünürse yeni bir tane gösterme
        }
        
        const lastPopupTime = localStorage.getItem('lastPopupTime_tr');
        const currentTime = Date.now();
        
        // Son popup kaydı yoksa veya 10 dakikadan fazla zaman geçtiyse
        if (!lastPopupTime || (currentTime - lastPopupTime > 10 * 60 * 1000)) {
            tekrarlayanPopupGoster();
        }
    };
    
    // Sayfa yüklendiğinde kontrol et
    tekrarlayanPopupKontrol();
    
    // Her dakika kontrol etmek için aralık ayarla
    setInterval(tekrarlayanPopupKontrol, 60 * 1000);
});