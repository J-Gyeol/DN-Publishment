//슬라이드 1개 이하면 페이지네이션 안나옴
$('.main_swiper_wrap').each(function () {
    var dots = $(this).find('.pagenation_wrap');
    var slider = $(this).find('.swiper-wrapper');

    slider.each(function () {
        var listLi = $(this).children('.swiper-wrapper li');
        if (listLi.length < 2) { //1개 이하면 안보이구
            dots.hide();
        } else {
            dots.show(); //2개 이상부터 보이도록 하자!
        }
    });
});

var swiper = new Swiper(".mySwiper-hero", {
    slidesPerView: "auto",
    centeredSlides: true,
    effect: "fade",
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    spaceBetween: 0,
    keyboard: {
        enabled: true,
    },
    on: {
        init: function () {
            pagenation(1);
        },
    },
});

mainSlider.init();

$(window).on('resize', function () {
  mainSlider.init();
});

mainSlider.on('slideChange', function(){
  var slideIdx = mainSlider.realIndex + 1; //슬라이드의 인덱스를 확인하는 경우
  pagenation(slideIdx);
});

function pagenation(slideIdx){
  $('.pagenation_wrap > li button').removeClass('on');
  $('.pagenation_wrap > li:nth-of-type('+ slideIdx +') button').addClass('on');
}

$('.pagenation_wrap > li button').on('click', function () {
  var index = $(this).closest('li').index();
  mainSlider.slideToLoop(index);
});
