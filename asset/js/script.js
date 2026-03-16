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


document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // 1. Smoother 설정 (이미 다른 곳에서 선언되었다면 이 부분은 무시됨)
    const smoother = ScrollSmoother.get() || ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
    });

    // 2. 범위를 .process-container 내부로 한정하여 다른 페이지 요소 간섭 차단
    const container = document.querySelector(".process-container");
    if (!container) return; // 섹션이 없는 페이지에서는 실행 안 함

    const cards = container.querySelectorAll(".card");

    // 초기 상태 강제 세팅 (JS가 실행되기 전 튀어나오는 현상 방지)
    gsap.set(cards, { 
        position: "relative", 
        top: 0, 
        zIndex: (i) => i + 1 
    });

    cards.forEach((card, i) => {
        const img = card.querySelector("img");
        const textEls = card.querySelectorAll(".process-title, .process-text");

        // 초기 리빌 상태 세팅
        gsap.set(img, { clipPath: "inset(0% 100% 0% 0%)", autoAlpha: 0 });
        gsap.set(textEls, { y: 30, autoAlpha: 0 });

        // [핵심] 카드 스택 애니메이션
        gsap.to(card, {
            scale: 0.8 + 0.2 * (i / (cards.length - 1 || 1)),
            scrollTrigger: {
                trigger: card,
                // 'top top'이 아닌 부모 컨테이너가 화면에 들어온 이후부터 계산
                start: () => `top ${15 + (i * 40)}px`,
                endTrigger: container,
                end: "bottom bottom",
                pin: true,
                pinSpacing: false,
                scrub: true,
                // 페이지 전체 높이에 영향을 주지 않도록 설정
                invalidateOnRefresh: true,
                refreshPriority: -1 
            },
        });

        // 리빌 애니메이션
        ScrollTrigger.create({
            trigger: card,
            start: "top 80%",
            once: true,
            onEnter: () => {
                const tl = gsap.timeline();
                tl.to(img, {
                    clipPath: "inset(0% 0% 0% 0%)",
                    autoAlpha: 1,
                    duration: 1.2,
                    ease: "power2.inOut",
                })
                .to(textEls, {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: "power3.out",
                }, "-=1.0");
            }
        });
    });

    // [중요] 모든 요소가 배치된 후 딱 한 번만 좌표 갱신
    ScrollTrigger.refresh();
});


$(function() {
    $('.contact-send').on('mouseenter', function() {
        $('.contact-send div:nth-of-type(1)').stop().fadeOut(400);
        $('.contact-send div:nth-of-type(2)').stop().fadeIn(400);
        $('.contact-send div:nth-of-type(2)').css('display', 'flex');
    });
    $('.contact-send').on('mouseleave', function() {
        $('.contact-send div:nth-of-type(1)').stop().fadeIn(400);
        $('.contact-send div:nth-of-type(2)').stop().fadeOut(400);
    });
});