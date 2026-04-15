document.addEventListener("DOMContentLoaded", () => {
    const tabs = Array.from(document.querySelectorAll(".about-tab"));
    const panels = Array.from(document.querySelectorAll(".about-panel"));
    const tabWrap = document.querySelector(".about-tab-wrap");

    const scrollTabIntoView = (tab, smooth = true) => {
        if (!tabWrap) return;
        if (tabWrap.scrollWidth <= tabWrap.clientWidth) return;

        const wrapRect = tabWrap.getBoundingClientRect();
        const tabRect = tab.getBoundingClientRect();
        const leftOverflow = tabRect.left - wrapRect.left;
        const rightOverflow = tabRect.right - wrapRect.right;

        // 탭이 보이는 영역을 벗어난 경우에만 필요한 만큼 스크롤
        if (leftOverflow < 0) {
            tabWrap.scrollBy({ left: leftOverflow - 12, behavior: smooth ? "smooth" : "auto" });
            return;
        }

        if (rightOverflow > 0) {
            tabWrap.scrollBy({ left: rightOverflow + 12, behavior: smooth ? "smooth" : "auto" });
        }
    };

    const activateTab = (tab) => {
        const targetId = tab.dataset.target;

        tabs.forEach((button) => {
            const isActive = button === tab;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });

        panels.forEach((panel) => {
            const isActive = panel.id === targetId;
            panel.classList.toggle("is-active", isActive);
            panel.hidden = !isActive;
        });

        scrollTabIntoView(tab, true);
    };

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => activateTab(tab));
    });

    const initialActiveTab = tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];
    if (initialActiveTab) {
        scrollTabIntoView(initialActiveTab, false);
    }

    window.addEventListener("resize", () => {
        const activeTab = tabs.find((tab) => tab.classList.contains("is-active"));
        if (activeTab) {
            scrollTabIntoView(activeTab, false);
        }
    });

    // 상단 이동 버튼과 기본 앵커 이동을 부드럽게 처리
    const topButton = document.querySelector(".top-button");
    if (topButton) {
        topButton.addEventListener("click", (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    const topBtnWrap = document.querySelector(".top-btn");
    const topHover = document.querySelector(".top-hover");
    if (topBtnWrap && topHover) {
        topBtnWrap.addEventListener("mouseenter", () => {
            topHover.style.display = "block";
        });
        topBtnWrap.addEventListener("mouseleave", () => {
            topHover.style.display = "none";
        });
    }
});
