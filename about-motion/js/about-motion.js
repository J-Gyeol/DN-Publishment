gsap.registerPlugin(SplitText, ScrollTrigger);

const locoScroll = new LocomotiveScroll({
	el: document.querySelector(".scrollContainer"),
	smooth: true,
	smoothMobile: false
});

locoScroll.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy(".scrollContainer", {
	scrollTop(value) {
		return arguments.length
			? locoScroll.scrollTo(value, 0, 0)
			: locoScroll.scroll.instance.scroll.y;
	},
	getBoundingClientRect() {
		return {
			top: 0,
			left: 0,
			width: window.innerWidth,
			height: window.innerHeight
		};
	},

	pinType: document.querySelector(".scrollContainer").style.transform
		? "transform"
		: "fixed"
});

ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

ScrollTrigger.refresh();

const select = (el) => document.querySelector(el);

const bookPage = select("[data-book-reveal]");
const bookProg = { v: 0 };
let bookTween = null;

const BOOK_ANIM_DURATION = 1;

function setBookProgress(n) {
	if (!bookPage) return;
	bookProg.v = n;
	bookPage.style.setProperty("--book-progress", String(n));
}

function resetBook() {
	if (bookTween) {
		bookTween.kill();
		bookTween = null;
	}
	setBookProgress(0);
}

function playBookOpen() {
	if (!bookPage) return;
	resetBook();
	bookTween = gsap.to(bookProg, {
		v: 1,
		duration: BOOK_ANIM_DURATION,
		ease: "power2.inOut",
		onUpdate: () => {
			bookPage.style.setProperty("--book-progress", String(bookProg.v));
		},
		onComplete: () => {
			bookTween = null;
		}
	});
}

if (bookPage) {
	ScrollTrigger.create({
		trigger: bookPage,
		scroller: ".scrollContainer",
		/* "top bottom"이면 히어로만 짧을 때 첫 화면에서 이미 통과한 것으로 잡히는 경우가 있음.
		   북 상단이 뷰포트 85% 지점에 닿을 때 진입 → 스크롤 후 재생 */
		start: "top 85%",
		end: "bottom top",
		invalidateOnRefresh: true,
		onEnter: playBookOpen,
		onEnterBack: playBookOpen,
		onLeave: resetBook,
		onLeaveBack: resetBook
	});
}

window.addEventListener(
	"resize",
	function () {
		locoScroll.update();
		ScrollTrigger.refresh();
	},
	{ passive: true }
);

/* 상단 이동: Locomotive 스크롤에 맞춤 (about.js의 window.scrollTo 대체) */
const topBtn = document.querySelector(".top-button");
const scrollTopTarget = document.querySelector("#top");
if (topBtn && scrollTopTarget) {
	topBtn.addEventListener(
		"click",
		function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			locoScroll.scrollTo(scrollTopTarget, { offset: 0, duration: 650 });
		},
		true
	);
}

const heroTitle = select(".about-hero-title");
const heroDesc = select(".about-hero-desc");

const splitHeroTitle = new SplitText(heroTitle, { type: "words" });
const splitHeroDesc = new SplitText(heroDesc, { type: "lines" });

const heroTitleTL = gsap.timeline().from(splitHeroTitle.words, {
	y: 70,
	opacity: 0,
	stagger: 0.035,
	ease: "power2.out"
});

gsap
	.timeline({
		scrollTrigger: {
			trigger: heroTitle,
			start: "bottom center",
			scroller: ".scrollContainer"
		}
	})
	.from(splitHeroDesc.lines, {
		opacity: 0,
		y: 100,
		skewY: 2.5,
		stagger: 0.05,
		duration: 1,
		ease: "power2.out"
	});

heroTitleTL.play();

const contentTitle = select(".about-content-title");
const splitContentTitle = new SplitText(contentTitle, { type: "words" });

gsap
	.timeline({
		scrollTrigger: {
			trigger: ".about-content",
			scroller: ".scrollContainer",
			start: "top 78%"
		}
	})
	.from(splitContentTitle.words, {
		opacity: 0,
		y: 36,
		stagger: 0.05,
		duration: 0.75,
		ease: "power2.out"
	})
	.from(
		".about-tab-wrap",
		{
			opacity: 0,
			y: 24,
			duration: 0.55,
			ease: "power2.out"
		},
		"-=0.45"
	)
	.from(
		"#panel-philosophy .panel-intro, #panel-philosophy .panel-list li",
		{
			opacity: 0,
			y: 18,
			stagger: 0.06,
			duration: 0.5,
			ease: "power2.out"
		},
		"-=0.4"
	);

window.addEventListener("load", () => {
	gsap.to("body", {
		autoAlpha: 1,
		duration: 0.25,
		onComplete: () => document.body.classList.add("is-motion-ready")
	});
	locoScroll.update();
	ScrollTrigger.refresh();
});
