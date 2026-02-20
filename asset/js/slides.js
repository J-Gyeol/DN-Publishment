
$(function () {


    /****** 1. 메인 비주얼 영역 ******/

    // 1-1. 삼항연산자 - 모바일과 데스크탑에 따라 재생 속도 다르게 설정 - 모바일이 더 빠름
    const autoplaySpeed = (/Mobi|Android/i.test(navigator.userAgent)) ? 3600 : 3600;
    let isPlaying = true;

    // 현재 디바이스가 모바일인지 판별 (편하게 재사용하기 위해 변수화)
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);


    // 1-2. if문으로 풀어서 작성 (참고용)
    // let autoplaySpeed = 5000;
    // if (/Mobi|Android/i.test(navigator.userAgent)) {
    //     autoplaySpeed = 3000;
    // }


    // -----------------------------------------------------------
    // 진행바 생성
    // -----------------------------------------------------------
    function createProgressBars(slideCount) {
        const barsContainer = $('.bars_container');
        barsContainer.empty(); // 기존 진행바 제거

        for (let i = 0; i < slideCount; i++) {
            const bar = $(`
            <div class="progress_bar" data-index="${i}">
                <div class="progress_bar_fill"></div>
            </div>
        `);

            // 각 진행바에 클릭 이벤트 바인딩
            bar.on('click', function (e) {
                e.stopPropagation();
                const targetIndex = $(this).data('index');
                console.log('Bar clicked:', targetIndex);

                $('.mv_slide_ctn').slick('slickGoTo', targetIndex);

                // 클릭 시 자동재생 꺼져 있으면 다시 재생
                if (!isPlaying) {
                    $('.mv_slide_ctn').slick('slickPlay');
                    $('.play_btn').addClass('playing');
                    isPlaying = true;
                }
            });

            barsContainer.append(bar);
        }
    }



    // -----------------------------------------------------------
    // 진행바 업데이트
    // -----------------------------------------------------------
    function updateProgressBar(currentIndex) {
        $('.progress_bar').removeClass('active');
        $('.progress_bar .progress_bar_fill').css('width', '0%');

        $('.progress_bar').each(function (index) {
            if (index < currentIndex) {
                $(this).find('.progress_bar_fill').css('width', '100%');
            } else if (index === currentIndex) {
                $(this).addClass('active');
                $(this).find('.progress_bar_fill').css({
                    'animation-duration': (autoplaySpeed / 1000) + 's',
                    'width': '100%'
                });
            }
        });
    }



    // -----------------------------------------------------------
    // 슬라이더 초기화
    // -----------------------------------------------------------
    function initSlider() {
        const slideCount = $('.mv_slide_ctn .item').length;

        // 진행바 생성
        createProgressBars(slideCount);

        // slick 초기화
        $('.mv_slide_ctn').slick({
            arrows: false,
            fade: true,
            autoplay: true,
            autoplaySpeed: autoplaySpeed,
            infinite: true,
            speed: 500,
            pauseOnHover: false,
            pauseOnFocus: false,
            cssEase: "linear",
        });

        // 첫 진행바 활성화
        updateProgressBar(0);

        // 슬라이드 변경 시 진행바 업데이트
        $('.mv_slide_ctn').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            updateProgressBar(nextSlide);
        });



        $('.mv_slide_ctn').on('afterChange', function (event, slick, currentSlide) {

            // 모든 비디오 멈춤 + 초기화
            $('.mv_slide_ctn .slick-slide:not(.slick-cloned) video').each(function () {
                this.pause();
                this.currentTime = 0;
            });

            // 현재 실제 슬라이드의 비디오만 재생
            const $current = $(slick.$slides.get(currentSlide)).find('video').get(0);

            if ($current) {
                $current.currentTime = 0;

                // 약간의 지연 후 재생 (slick 전환 완료 후 실행)
                setTimeout(() => {
                    $current.play();
                }, 50);
            }
        });




        // 재생/정지 버튼
        $('.play_btn').on('click', function () {
            if (isPlaying) {
                // 슬라이더 멈춤
                $('.mv_slide_ctn').slick('slickPause');
                $(this).removeClass('playing');
                $('.progress_bar.active .progress_bar_fill').css('animation-play-state', 'paused');
                isPlaying = false;

            } else {
                // 슬라이더 재생
                $('.mv_slide_ctn').slick('slickPlay');
                $(this).addClass('playing');
                $('.progress_bar.active .progress_bar_fill').css('animation-play-state', 'running');
                isPlaying = true;
            }
        });

        // 처음엔 재생 상태
        $('.play_btn').addClass('playing');
    }



    // -----------------------------------------------------------
    // ※ 모바일 스크롤 시 autoplay 유지 (PC 제외)
    // -----------------------------------------------------------
    if (isMobile) {

        let scrollTimer;

        $(window).on('scroll touchmove', function () {

            // 스크롤 중 autoplay 꺼져있으면 다시 재생
            if (!isPlaying) {
                $('.mv_slide_ctn').slick('slickPlay');
                $('.play_btn').addClass('playing');
                isPlaying = true;
            }

            // 스크롤 멈춘 후에도 autoplay 유지
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                $('.mv_slide_ctn').slick('slickPlay');
                $('.play_btn').addClass('playing');
                isPlaying = true;
            }, 20);
        });


        // -----------------------------------------------------------
        // ※ 추가 기능 : iOS visibilitychange 대응
        // -----------------------------------------------------------
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                $('.mv_slide_ctn').slick('slickPlay');
                $('.play_btn').addClass('playing');
                isPlaying = true;
            }
        });
    }



    // -----------------------------------------------------------
    // 상단 비주얼 viewport 높이 계산 (모바일 100vh 버그 대응)
    // -----------------------------------------------------------
    function setVh() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }



    // -----------------------------------------------------------
    // 페이지 시작 (슬라이더는 인트로 끝나고 실행되도록 변경)
    // -----------------------------------------------------------
    function startPage() {
        setVh();  // vh 먼저 계산
        // initSlider();  ← 기존 실행 제거됨
    }



    // 초기 실행 (vh 계산만 실행)
    setVh();



    // -----------------------------------------------------------
    // 인트로 종료 후 슬라이더 + UI 동시 실행 (4초 딜레이)
    // -----------------------------------------------------------
    setTimeout(function () {
        startPage();
        initSlider();

        // 모든 비디오 초기화
        $('.mv_slide_ctn video').each(function () {
            this.pause();
            this.currentTime = 0;
        });

        // ★ 첫 슬라이드 영상 강제 재생 (중요!)
        const firstVideo = $('.mv_slide_ctn .slick-current video').get(0);
        if (firstVideo) {
            firstVideo.currentTime = 0;
            firstVideo.play();
        }

    }, 4000);




    // resize 대응
    $(window).on('resize', function () {
        setVh();
    });



    /****** 2. 인트로-페이지 로드 시 스크롤바 재생성 ******/
    $('body').addClass('intro-active');

    // 인트로 애니메이션 종료 후 (4.6초 후)
    setTimeout(function () {
        $('body').removeClass('intro-active');

    }, 4600);




    /****** 3. 어바웃 chair 영역  ******/

    $(".m-about-sec .slide_wrap .slide_ctn").slick({
        arrows: false,
        pauseOnHover: false,
        pauseOnFocus: false,
        variableWidth: true,
        centerMode: true,
        autoplay: true,
        autoplaySpeed: 4000,
        speed: 2000,
    }).on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        var count = slick.slideCount;
        var selectors = [nextSlide, nextSlide - count, nextSlide + count].map(function (n) {
            return '.m-about-sec [data-slick-index="' + n + '"]'
        }).join(',');
        $('.m-about-sec .slick_now').removeClass('slick_now');
        $(selectors).addClass('slick_now');
    });

    $(".m-about-sec .slide_wrap .slide_ctn").find($('.slick-slide[data-slick-index="0"]')).addClass('slick_now');

    $(".m-about-sec .slide_wrap .slide_btn > div").on("click", function (e) {
        if (e.currentTarget.className == "prev") {
            $(".m-about-sec .slide_wrap .slide_ctn").slick("slickPrev")
        } else {
            $(".m-about-sec .slide_wrap .slide_ctn").slick("slickNext")
        }
    })


    /****** 4. 뉴스 news 영역  ******/
    // $(".m-news-sec .cont .list .item").hover(function () {
    //     $(".m-news-sec .cont .tab").addClass("on")
    // }, function () {
    //     $(".m-news-sec .cont .tab").removeClass("on")
    // })

    // $(".m-news-sec .cont .tab li").on("click", function () {
    //     var tabTxt = $(this).data('tab');
    //     console.log(tabTxt)
    //     $(".m-news-sec .cont .tab li").removeClass("on");
    //     $(this).addClass("on");
    //     $(".m-news-sec .cont .list .item").hide()
    //     $(".m-news-sec .cont .list .item[data-idx='" + tabTxt + "']").show()
    // })




}); // 끝코드