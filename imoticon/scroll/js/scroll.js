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

const colors = [
	"#ffcc55",
	"#f0b4fa",
	"#0000fe",
	"#385a1d",
	"#e277af",
	"#e4e4e4"
];

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
		start: "top bottom",
		end: "bottom top",
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

const colorful = select(".colorful");
const tagline = select(".tagline");
const content = select(".content");

let colorfulSplit = null;
if (colorful) {
	colorfulSplit = new SplitText(colorful, { type: "chars" });
}
const splitTagline = new SplitText(tagline, { type: "words" });
const splitContent = new SplitText(content, { type: "lines" });

if (colorfulSplit) {
	gsap.set(colorfulSplit.chars, {
		color: gsap.utils.wrap(colors)
	});
}

const splitTL = gsap.timeline().from(splitTagline.words, {
	y: 70,
	opacity: 0,
	stagger: 0.035,
	ease: "power2.out"
});

gsap
	.timeline({
		scrollTrigger: {
			trigger: tagline,
			start: "bottom center",
			scroller: ".scrollContainer"
		}
	})
	.from(splitContent.lines, {
		opacity: 0,
		y: 100,
		skewY: 2.5,
		stagger: 0.05,
		duration: 1,
		ease: "power2.out"
	});

splitTL.play();

window.addEventListener("load", () => {
	gsap.to("body", { autoAlpha: 1 });
	locoScroll.update();
	ScrollTrigger.refresh();
	/* ST 3.x는 로드 시 이미 뷰 안에 있으면 onEnter가 안 뜨는 경우가 있어 1회 보정 */
	requestAnimationFrame(() => {
		if (!bookPage) return;
		const r = bookPage.getBoundingClientRect();
		if (r.bottom > 0 && r.top < window.innerHeight) {
			playBookOpen();
		}
	});
});
