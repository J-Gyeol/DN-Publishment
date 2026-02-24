const AUTOPLAY_DELAY = 3500;

const $buttons = $('.pagenation_wrap > li button');
const totalSlides = $buttons.length;

let isPlaying = true;
let progressTimer = null;
let pausedTimeLeft = null;


/* ================================
   Swiper 생성 (init 수동)
================================ */

const mainSlider = new Swiper('.mySwiper-hero', {
    init: false,
    slidesPerView: 1,
    effect: 'fade',
    loop: true,
    autoplay: {
        delay: AUTOPLAY_DELAY,
        disableOnInteraction: false,
    }
});


/* ================================
   Progress 제어
================================ */

// 전체 초기화
function resetAllProgress() {
    $buttons
        .removeClass('on done')
        .find('.fill')
        .css('transform', 'scaleX(0)');
}

// 현재 슬라이드 progress 업데이트
function updateProgress() {
    if (!isPlaying) return;

    const timeLeft = mainSlider.autoplay.timeLeft;
    if (timeLeft == null) return;

    const progress = 1 - timeLeft / AUTOPLAY_DELAY;
    const index = mainSlider.realIndex;

    $buttons.eq(index)
        .find('.fill')
        .css('transform', `scaleX(${progress})`);
}

// progress 동기화 시작
function startProgressSync() {
    stopProgressSync();
    progressTimer = setInterval(updateProgress, 16); // 약 60fps
}

// progress 동기화 중지
function stopProgressSync() {
    if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
    }
}


/* ================================
   Swiper 이벤트
================================ */

// 초기 진입
mainSlider.on('init', () => {
    resetAllProgress();
    $buttons.eq(0).addClass('on');
    startProgressSync();
});

// 슬라이드 변경
mainSlider.on('slideChange', () => {
    const current = mainSlider.realIndex;
    const prev = (current - 1 + totalSlides) % totalSlides;

    // 이전 슬라이드 완료 처리
    $buttons.eq(prev)
        .removeClass('on')
        .addClass('done')
        .find('.fill')
        .css('transform', 'scaleX(1)');

    // 마지막 → 첫 슬라이드면 전체 reset
    if (prev === totalSlides - 1 && current === 0) {
        resetAllProgress();
    }

    $buttons.eq(current).addClass('on');
});


/* ================================
   Pagination 클릭
================================ */

$buttons.on('click', function () {
    const index = $(this).closest('li').index();
    mainSlider.slideToLoop(index);
});


/* ================================
   재생 / 정지 (이어 재생 B안)
================================ */

$('.autoplay-toggle').on('click', function () {

    if (isPlaying) {
        // ▶️ 정지
        pausedTimeLeft = mainSlider.autoplay.timeLeft;

        mainSlider.autoplay.stop();
        stopProgressSync();

        $('.icon-pause').hide();
        $('.icon-play').show();

    } else {
        // ▶️ 재생 (이어 진행)
        if (pausedTimeLeft != null) {
            mainSlider.params.autoplay.delay = pausedTimeLeft;
            pausedTimeLeft = null;
        }

        mainSlider.autoplay.start();
        startProgressSync();

        // 다음 슬라이드부터는 원래 delay 복구
        setTimeout(() => {
            mainSlider.params.autoplay.delay = AUTOPLAY_DELAY;
        }, 0);

        $('.icon-play').hide();
        $('.icon-pause').show();
    }

    isPlaying = !isPlaying;
});


/* ================================
   Swiper 시작
================================ */

mainSlider.init();


var swiper = new Swiper(".mySwiper-about", {
    slidesPerView: 2.5,
    spaceBetween: 45,
    // loop: true,
    // mousewheel: true,
    keyboard: {
        enabled: true,
    },
    // pagination: {
    //     el: ".swiper-pagination",
    //     clickable: true,
    // },
});