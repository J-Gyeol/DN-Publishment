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
    slidesPerView: 1.5,
    spaceBetween: 45,
    keyboard: {
        enabled: true,
    },
    breakpoints: {
        768: {
            slidesPerView: 2.5,
        }
    }
});


function createPageScroller() {
    const pageContainer = document.querySelector('#smooth-content[data-scroll-container]');
    if (!pageContainer || typeof LocomotiveScroll === 'undefined') {
        return null;
    }

    return new LocomotiveScroll({
        el: pageContainer,
        smooth: false,
        tablet: { smooth: false },
        smartphone: { smooth: false },
        resetNativeScroll: false,
    });
}

function getPageScrollY(pageScroller) {
    // smooth:false에서는 네이티브 스크롤 값을 기준으로 계산하는 편이 안정적이다.
    return window.scrollY;
}

function scrollPageTo(pageScroller, targetY) {
    if (pageScroller && typeof pageScroller.scrollTo === 'function') {
        pageScroller.scrollTo(targetY, { duration: 700, disableLerp: false });
        return;
    }
    window.scrollTo({ top: targetY, behavior: 'smooth' });
}

function initSpineModule(pageScroller) {
    const moduleRoot = document.querySelector('.spine-module');
    const moduleShell = document.querySelector('.spine-module-shell');
    if (!moduleRoot || !moduleShell) return;

    const spines = Array.from(moduleRoot.querySelectorAll('.spine[data-spine-section]'));
    const sections = Array.from(moduleRoot.querySelectorAll('section[data-spine-section]'));
    const mqMobile = window.matchMedia('(max-width: 1024px)');
    const scrollContainer = moduleRoot.querySelector('.spine-main');
    const scrollTrack = scrollContainer ? scrollContainer.querySelector('.wrap') : null;
    let syncTicking = false;
    const SYNC_EPSILON = 0.75;
    const TAIL_HOLD_RATIO = 0.5;
    let stageStartY = 0;
    let stageRange = 1;

    function getVerticalScroll() {
        return getPageScrollY(pageScroller);
    }

    function getMaxX() {
        if (!scrollContainer || !scrollTrack) return 0;
        return Math.max(0, scrollTrack.scrollWidth - scrollContainer.clientWidth);
    }

    function getEffectiveMaxX() {
        if (!sections.length || !scrollContainer) return getMaxX();
        const lastSection = sections[sections.length - 1];
        const maxX = getMaxX();
        const lastStartX = Math.max(0, lastSection.offsetLeft);
        return Math.min(maxX, lastStartX);
    }

    function getStageStartY() {
        if (!moduleShell) return 0;
        return getVerticalScroll() + moduleShell.getBoundingClientRect().top;
    }

    function updateShellHeight() {
        if (!moduleShell || !scrollContainer || mqMobile.matches) {
            if (moduleShell) moduleShell.style.height = '';
            return;
        }
        const maxX = getEffectiveMaxX();
        const tailHoldY = window.innerHeight * TAIL_HOLD_RATIO;
        moduleShell.style.height = `${window.innerHeight + maxX + tailHoldY}px`;
        moduleRoot.style.position = 'sticky';
        const rect = moduleShell.getBoundingClientRect();
        stageStartY = getVerticalScroll() + rect.top;
        stageRange = Math.max(1, moduleShell.offsetHeight - window.innerHeight);
    }

    function bindSpineClick() {
        spines.forEach((spine) => {
            spine.onclick = () => {
                const targetId = spine.getAttribute('data-href');
                const targetEl = moduleRoot.querySelector(`#${targetId}`);
                if (!targetEl || !scrollContainer) return;

                if (mqMobile.matches) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    const startY = getStageStartY();
                    const targetY = startY + targetEl.offsetLeft;
                    scrollPageTo(pageScroller, targetY);
                }
            };
        });
    }

    function updateDesktopSpines(scrollArgs) {
        if (!moduleRoot || !scrollContainer || !scrollTrack) return;
        const containerWidth = scrollContainer.clientWidth;
        const currentX = scrollArgs && scrollArgs.scroll && typeof scrollArgs.scroll.x === 'number'
            ? scrollArgs.scroll.x
            : parseFloat(scrollContainer.dataset.currentX || '0');

        spines.forEach((spine) => {
            const attr = Number(spine.getAttribute('data-spine-section'));
            const section = moduleRoot.querySelector(`section[data-spine-section='${attr}']`);
            if (!section) return;

            const sectionLeft = section.offsetLeft - currentX;

            if (sectionLeft <= spine.offsetWidth * attr) {
                spine.classList.add('fixed');
                spine.classList.remove('init');
                spine.classList.remove('active');
                spine.style.left = '';
            } else if (sectionLeft >= containerWidth - spine.offsetWidth * (spines.length - attr)) {
                spine.classList.add('init');
                spine.classList.remove('active');
                spine.classList.remove('fixed');
                spine.style.left = '';
            } else {
                spine.classList.add('active');
                spine.classList.remove('init');
                spine.classList.remove('fixed');
                spine.style.left = `${sectionLeft}px`;
            }
        });
    }

    function resetSpineStateForMobile() {
        spines.forEach((spine) => {
            spine.classList.remove('fixed', 'active');
            spine.classList.add('init');
            spine.style.left = '';
        });
    }

    function syncDesktopHorizontalByPageScroll() {
        if (mqMobile.matches || !moduleShell || !scrollTrack) return;
        const raw = (getVerticalScroll() - stageStartY) / stageRange;
        const progress = Math.min(1, Math.max(0, raw));
        const maxX = getEffectiveMaxX();
        const targetX = progress * maxX;
        const currentX = parseFloat(scrollContainer.dataset.currentX || '0');

        if (Math.abs(targetX - currentX) < SYNC_EPSILON) {
            return;
        }

        scrollTrack.style.transform = `translate3d(${-targetX}px, 0, 0)`;
        scrollContainer.dataset.currentX = String(targetX);
        updateDesktopSpines({
            scroll: { x: targetX }
        });
    }

    function initResponsiveScroll() {
        if (!scrollContainer || !moduleRoot || !moduleShell || !scrollTrack) {
            return;
        }

        if (mqMobile.matches) {
            moduleRoot.style.position = 'relative';
            moduleShell.style.height = '';
            scrollTrack.style.transform = '';
            scrollContainer.dataset.currentX = '0';
            resetSpineStateForMobile();
            bindSpineClick();
            return;
        }

        updateShellHeight();
        scrollTrack.style.willChange = 'transform';
        syncDesktopHorizontalByPageScroll();
        bindSpineClick();
    }

    function syncByFrame() {
        if (syncTicking) return;
        syncTicking = true;
        requestAnimationFrame(() => {
            syncDesktopHorizontalByPageScroll();
            syncTicking = false;
        });
    }

    initResponsiveScroll();

    function refresh() {
        initResponsiveScroll();
        syncByFrame();
    }

    window.addEventListener('resize', refresh);

    return {
        sync: syncByFrame,
        refresh,
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const pageScroller = createPageScroller();
    const spineModule = initSpineModule(pageScroller);

    const copySection = document.querySelector('.main-copy-wrap');
    const copyBox = document.querySelector('.main-copy-box');
    let copyTriggered = false;

    function syncCopyTrigger() {
        if (copyTriggered || !copySection || !copyBox) return;
        if (copySection.getBoundingClientRect().top <= window.innerHeight * 0.75) {
            copyBox.classList.add('is-active');
            copyTriggered = true;
        }
    }

    function syncAll() {
        spineModule?.sync();
        syncCopyTrigger();
    }

    if (pageScroller) {
        pageScroller.on('scroll', syncAll);
        pageScroller.update();
    } else {
        window.addEventListener('scroll', syncAll, { passive: true });
    }

    window.addEventListener('load', () => {
        pageScroller?.update();
        spineModule?.refresh();
        syncAll();
    });

    window.addEventListener('resize', () => {
        pageScroller?.update();
        spineModule?.refresh();
        syncAll();
    });

    const topBtn = document.querySelector('.top-button');
    if (topBtn) {
        topBtn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollPageTo(pageScroller, 0);
        });
    }

    syncAll();
});


$(function () {
    $('.contact-send').on('mouseenter', function () {
        $('.contact-send div:nth-of-type(1)').stop().fadeOut(400);
        $('.contact-send div:nth-of-type(2)').stop().fadeIn(400);
        $('.contact-send div:nth-of-type(2)').css('display', 'flex');
    });
    $('.contact-send').on('mouseleave', function () {
        $('.contact-send div:nth-of-type(1)').stop().fadeIn(400);
        $('.contact-send div:nth-of-type(2)').stop().fadeOut(400);
    });
});


$('.top-button').on('mouseover', function () {
    $('.top-hover').stop().fadeIn(300);
});
$('.top-button').on('mouseleave', function () {
    $('.top-button img').stop().fadeIn(300);
    $('.top-hover').stop().fadeOut(300);
});


$('.close-btn').on('click', function () {
    $('.modal').hide();
});