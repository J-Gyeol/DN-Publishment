document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
    });

    const cards = gsap.utils.toArray(".card");

    // 초기 상태 세팅
    gsap.set(".img-wrapper img", {
        // [수정] 좌표에 %를 붙이고, 면적이 0인 상태에서 시작
        clipPath: "inset(0% 100% 0% 0%)", 
        autoAlpha: 0
    });

    gsap.set(".card-content .process-title, .card-content .process-text", {
        y: 30,
        autoAlpha: 0
    });

    cards.forEach((card, i) => {
        // 1. 카드 쌓임 순서
        gsap.set(card, { zIndex: i + 1 });

        // 2. 계단식 스택 애니메이션 (영상 09:18 설정)
        gsap.to(card, {
            // 위로 갈수록 작아지는 깊이감
            scale: 0.8 + 0.2 * (i / (cards.length - 1 || 1)),
            scrollTrigger: {
                trigger: card,
                // [수정] 영상처럼 계단식으로 남으려면 start 위치를 i에 따라 벌려줍니다.
                start: `top ${15 + (i * 40)}px`, 
                endTrigger: ".process-container",
                end: "bottom bottom",
                pin: true,
                pinSpacing: false,
                scrub: true,
                invalidateOnRefresh: true,
            },
        });

        // 3. 이미지 & 텍스트 리빌 (영상 07:39 ~ 08:14 설정)
        const img = card.querySelector("img");
        const textEls = card.querySelectorAll(".process-title, .process-text");

        ScrollTrigger.create({
            trigger: card,
            start: `top ${20 + (i * 40)}px`,
            once: true,
            onEnter: () => {
                const tl = gsap.timeline();
                tl.to(img, {
                    // [수정] 이미지를 완전히 보여주는 좌표
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
                }, "-=1.0"); // 이미지 애니메이션 끝나기 전에 시작
            }
        });
    });
});

