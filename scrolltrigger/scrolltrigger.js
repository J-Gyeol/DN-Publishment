document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);


  ScrollSmoother.create({
    content: "#content",
    wrapper: "#wrapper",
    smooth: 1.2,
    effects: true,
    smoothTouch: 0.1,
  });

  const cards = gsap.utils.toArray(".card");

  gsap.set(".img-wrapper img", {
    clipPath: "polygon(0 0, 0 100%, 0 100%, 0 0)",
    autoAlpha: 0,
  });

  gsap.set(".process-title, .process-desc-wrap", {
    y: 0,
    autoAlpha: 0,
  });

  cards.forEach((card, i) => {
    const img = card.querySelector("img");
    const textEls = card.querySelectorAll(".process-title, .process-desc-wrap");

    gsap.to(card, {
      scale: 0.8 + 0.2 * (i / (cards.length - 1)),
      ease: "none",
      ScrollTrigger: {
        trigger: card,
        start: "top " + (15 + 35 * i),
        end: "bottom bottom",
        endTrigger: ".process-container",
        scrub: true,
        pin: card,
        pinSpacing: false,
        invalidateOnRefresh: true,
        markers: {
          indent: 100 * i,
          fontSize: "20px",
        },
        id: i + 1,
      },
    });

    ScrollTrigger.create({
      trigger: card,
      start: "bottom bottom",
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();

        tl.to(img, {
          clipPath: "polygon(0 0, 0 100%, 0 100%, 0 0)",
          autoAlpha: 1,
          duration: 2,
          delay: 0.2,
          ease: "power2.out",
        });

        tl.to(textEls, {
          y: -10,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.in",
          stagger: 0.4,
        }, "-=1.5");
      },
    });

  });

});