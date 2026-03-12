gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// 1. ScrollSmoother 설정
const smoter = ScrollSmoother.create({
    wrapper: '#wrapper',
    content: '#content',
    smooth: 1.5,
    effects: true,
    normalizeScroll: true
});

// 2. 아코디언 애니메이션 타임라인
// .accordions 영역에 진입하면 화면을 고정(pin)하고 애니메이션을 실행합니다.
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".accordions",
        start: "top 10%",     // 화면 상단 10% 지점에서 시작
        end: "+=400%",        // 스크롤 길이를 조절하여 속도 제어
        pin: true,            // 애니메이션 동안 리스트 고정
        scrub: 1,             // 스크롤과 움직임 동기화
        markers: false        // 테스트 완료 후 false
    }
});

// 3. 마지막 요소를 제외한 각 단계가 위로 접히는 효과
const steps = gsap.utils.toArray(".process");

steps.forEach((step, i) => {
    const content = step.querySelector(".process-cont");
    
    // 마지막 단계는 접히지 않고 화면에 유지함
    if (i < steps.length - 1) {
        tl.to(content, {
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            opacity: 0,
            duration: 1,
            ease: "none"
        })
        .to(step, {
            marginBottom: 0,
            duration: 1,
            ease: "none"
        }, "<"); // 앞선 애니메이션과 동시에 실행
    }
});