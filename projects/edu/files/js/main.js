// --- CONTENT FOR LEARNING OUTCOMES PAGE ---
const learningOutcomesContent = {
    listening: {
        student_html: `<h3><i class="fas fa-headphones-alt"></i> <span data-key="listening_title_s">Listening & Watching</span>:</h3><ul><li><span data-key="listening_s1">You will get ready to listen and watch</span>.</li><li><span data-key="listening_s2">You will guess what will happen</span>.</li><li><span data-key="listening_s3">You will understand the main idea</span>.</li><li><span data-key="listening_s4">You will check your guesses</span>.</li><li><span data-key="listening_s5">You will share your feelings about what you watched</span>.</li></ul>`
    },
    reading: {
        student_html: `<h3><i class="fas fa-book-open"></i> <span data-key="reading_title_s">Reading</span>:</h3><ul><li><span data-key="reading_s1">You will get ready to read</span>.</li><li><span data-key="reading_s2">You will use what you already know</span>.</li><li><span data-key="reading_s3">You will look quickly to get the main idea</span>.</li><li><span data-key="reading_s4">You will find small details</span>.</li><li><span data-key="reading_s5">You will make good guesses about the story</span>.</li><li><span data-key="reading_s6">You will share how you feel about the reading</span>.</li></ul>`
    },
    speaking: {
        student_html: `<h3><i class="fas fa-comments"></i> <span data-key="speaking_title_s">Speaking</span>:</h3><ul><li><span data-key="speaking_s1">You will get ready to speak</span>.</li><li><span data-key="speaking_s2">You will repeat and copy what you hear</span>.</li><li><span data-key="speaking_s3">You will make your own short talks</span>.</li><li><span data-key="speaking_s4">You will use the right words and sounds</span>.</li><li><span data-key="speaking_s5">You will talk with your friends</span>.</li></ul>`
    },
    writing: {
        student_html: `<h3><i class="fas fa-pencil-alt"></i> <span data-key="writing_title_s">Writing</span>:</h3><ul><li><span data-key="writing_s1">You will get ready to write</span>.</li><li><span data-key="writing_s2">You will copy examples to learn</span>.</li><li><span data-key="writing_s3">You will write your own short and simple sentences</span>.</li><li><span data-key="writing_s4">You will use new words to write messages</span>.</li><li><span data-key="writing_s5">You will share your writing with others</span>.</li></ul>`
    },
    supportive: {
        student_html: `<h3><i class="fas fa-puzzle-piece"></i> <span data-key="supportive_title_s">Extra Skills</span>:</h3><ul><li><strong><span data-key="vocab_s_title">Words</span>:</strong> <span data-key="vocab_s_text">You will learn and use new words about the classroom</span>.</li><li><strong><span data-key="grammar_s_title">Sentences</span>:</strong> <span data-key="grammar_s_text">You will use simple sentences like "What's it? It's a chair." without thinking about rules</span>.</li><li><strong><span data-key="pronunciation_s_title">Sounds</span>:</strong> <span data-key="pronunciation_s_text">You will learn and use the right sounds and tones when you speak</span>.</li></ul>`
    }
};

const translations = {
    // Adult Titles
	ceviri_tavsiyesi: "Hover over the text on this page to see its translation (or description).",
	learning_outcomes: "2. Tema: Classroom Life Outcomes - Bu Temada Çocuklar Neler Öğrenecek / Yapacak ?",
    listening_title_a: "Dinleme/İzleme-Anlama",
    reading_title_a: "Okuma-Anlama",
    speaking_title_a: "Konuşma-İfade",
    writing_title_a: "Yazma-İfade",
    supportive_title_a: "Destekleyici Beceriler (Kelime Bilgisi, Dil Bilgisi, Telaffuz)",
    vocab_a_title: "Kelime Bilgisi",
    grammar_a_title: "Dil Bilgisi",
    pronunciation_a_title: "Telaffuz",
    // Adult Content
    listening_a1: "Öğrenciler, ön bilgilerini harekete geçirerek ve basit tahminlerde bulunarak dinlemeye/izlemeye hazırlanabilecekler.",
    listening_a2: "İçeriği bir bütün olarak dinlerken veya izlerken ana konusunu anlayabilecekler.",
    listening_a3: "Tahminlerini kontrol ederek, bileşenleri sınıflandırarak (kelimeleri görsellerle gruplamak gibi) ve içeriği içselleştirerek anlam çıkarmayı öğrenecekler.",
    listening_a4: "Son olarak, dinleme/izleme süreciyle ilgili kişisel düşüncelerini ve duygularını çok basit bir şekilde aktarabilecekler.",
    reading_a1: "Öğrenciler, geçmiş deneyimlerini harekete geçirerek ve basit tahminlerde bulunarak okumaya hazırlanabilecekler.",
    reading_a2: "Göz gezdirerek (hızlıca bakarak) içeriğin genel konusunu kavrayabilecek ve tarayarak temel ayrıntıları tanıyabilecekler.",
    reading_a3: "Tahminleri kontrol ederek, temel unsurları karşılaştırarak ve metinden basit, anlamlı çıkarımlar yaparak anlam çıkarmayı öğrenecekler.",
    reading_a4: "Ayrıca okuma süreciyle ilgili bilgilerini ve duygularını da aktarabilecekler.",
    speaking_a1: "Öğrenciler, tekrar ve taklit yoluyla model içeriğe aşina olarak konuşmaya hazırlanabilecekler.",
    speaking_a2: "Modelleri taklit ederek basit yeni sözlü içerikler (kısa monologlar, diyaloglar veya göster-anlat gibi) düzenleyip oluşturabilecekler.",
    speaking_a3: "Hem hazırlıklı hem de hazırlıksız konuşma durumlarında uygun telaffuzu, hedef kelimeleri ve dil kalıplarını seçip kullanabilecekler.",
    speaking_a4: "Ayrıca bu bilgileri yeniden düzenleyerek başkalarıyla sözlü iletişime geçecek ve konuşma sürecini yansıtacaklar.",
    writing_a1: "Öğrenciler, ön bilgilerini harekete geçirerek ve verilen görevi anlayarak yazmaya hazırlanabilecekler.",
    writing_a2: "Aşinalık kazanmak ve el becerilerini geliştirmek için model/örnek içeriği kopyalayabilecekler.",
    writing_a3: "Sağlanan bir modele dayalı olarak çok basit, kısa ve anlamlı bir içerik düzenlemeyi ve oluşturmayı öğrenecekler.",
    writing_a4: "Basit mesajları net bir şekilde ifade etmek için hedef kelimeleri ve dil kalıplarını kullanarak içerik oluşturma pratiği yapacaklar.",
    writing_a5: "Ayrıca yeniden yapılandırılmış bilgileri başkalarıyla paylaşarak basit yazılı iletişime geçecek ve yazma sürecini yansıtacaklar.",
    vocab_a_text: "Öğrenciler, iletişim kurarken hedef kelime dağarcığını (sınıf mobilyaları, nesneler, cihazlar ve renkler) doğru, anlık ve uygun bir şekilde seçip kullanabilecekler.",
    grammar_a_text: "Öğrenciler, hedef 'dil kalıplarını' (örneğin, 'What's it? It's a chair.') doğru ve anlık olarak seçip kullanabilecekler. Bu, gramer kurallarını bilmeden, analiz etmeden veya düşünmeden, tekrar ve canlandırma yoluyla otomatik olarak başarılır.",
    pronunciation_a_text: "Öğrenciler, iletişim kurarken hedef fonolojik unsurları (sesler, telaffuz ve tonlama) doğru, otantik ve doğal bir şekilde seçip kullanabilecekler. Bu, farklı bağlamlardaki sesleri tanımayı ve tekrar yoluyla pekiştirmeyi içerir.",

    // Student Titles
    listening_title_s: "Dinleme & İzleme",
    reading_title_s: "Okuma",
    speaking_title_s: "Konuşma",
    writing_title_s: "Yazma",
    supportive_title_s: "Ek Beceriler",
    vocab_s_title: "Kelimeler",
    grammar_s_title: "Cümleler",
    pronunciation_s_title: "Sesler",
    // Student Content
    listening_s1: "Dinlemeye ve izlemeye hazırlanacaksın.",
    listening_s2: "Ne olacağını tahmin edeceksin.",
    listening_s3: "Ana fikri anlayacaksın.",
    listening_s4: "Tahminlerini kontrol edeceksin.",
    listening_s5: "İzlediklerinle ilgili hislerini paylaşacaksın.",
    reading_s1: "Okumaya hazırlanacaksın.",
    reading_s2: "Zaten bildiklerini kullanacaksın.",
    reading_s3: "Ana fikri almak için hızlıca bakacaksın.",
    reading_s4: "Küçük detayları bulacaksın.",
    reading_s5: "Hikaye hakkında iyi tahminlerde bulunacaksın.",
    reading_s6: "Okuduklarınla ilgili nasıl hissettiğini paylaşacaksın.",
    speaking_s1: "Konuşmaya hazırlanacaksın.",
    speaking_s2: "Duyduklarını tekrar edip kopyalayacaksın.",
    speaking_s3: "Kendi kısa konuşmalarını yapacaksın.",
    speaking_s4: "Doğru kelimeleri ve sesleri kullanacaksın.",
    speaking_s5: "Arkadaşlarınla konuşacaksın.",
    writing_s1: "Yazmaya hazırlanacaksın.",
    writing_s2: "Öğrenmek için örnekleri kopyalayacaksın.",
    writing_s3: "Kendi kısa ve basit cümlelerini yazacaksın.",
    writing_s4: "Mesaj yazmak için yeni kelimeler kullanacaksın.",
    writing_s5: "Yazdıklarını başkalarıyla paylaşacaksın.",
    vocab_s_text: "Sınıfla ilgili yeni kelimeler öğrenip kullanacaksın.",
    grammar_s_text: "Kuralları düşünmeden 'What's it? It's a chair.' gibi basit cümleler kullanacaksın.",
    pronunciation_s_text: "Konuşurken doğru sesleri ve tonları öğrenip kullanacaksın."
};


document.addEventListener('DOMContentLoaded', () => {
    // Setup navigation toggle for mobile
    const setupNavToggle = () => {
        const navToggle = document.querySelector('.nav-toggle');
        const navUl = document.querySelector('.main-nav ul');

        if (navToggle && navUl) {
            navToggle.addEventListener('click', () => {
                navUl.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    };

    // Initialize the navigation toggle
    setupNavToggle();

    // --- LOGIC FOR LEARNING OUTCOMES PAGE ---
    const outcomesPage = document.getElementById('outcomes-content-section');
    if (outcomesPage) {
        const modal = document.getElementById('role-selection-modal');
        const studentBtn = document.getElementById('select-student');
        const adultBtn = document.getElementById('select-adult');

        const setupTooltips = () => {
            const elementsWithKeys = document.querySelectorAll('[data-key]');
            elementsWithKeys.forEach(el => {
                const key = el.getAttribute('data-key');
                if (translations[key]) {
                    el.setAttribute('data-translation', translations[key]);
                }
            });
        };

        const chooseRole = (role) => {
            if (role === 'student') {
                // Replace content with student version
                document.getElementById('listening-content').innerHTML = learningOutcomesContent.listening.student_html;
                document.getElementById('reading-content').innerHTML = learningOutcomesContent.reading.student_html;
                document.getElementById('speaking-content').innerHTML = learningOutcomesContent.speaking.student_html;
                document.getElementById('writing-content').innerHTML = learningOutcomesContent.writing.student_html;
                document.getElementById('supportive-content').innerHTML = learningOutcomesContent.supportive.student_html;
            }
            // For both roles, set up the tooltips
            setupTooltips();
            // Hide the modal
            modal.style.opacity = '0';
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        };

        studentBtn.addEventListener('click', () => chooseRole('student'));
        adultBtn.addEventListener('click', () => chooseRole('adult'));

        // Show the modal on page load
        modal.style.display = 'flex';
    }
});
