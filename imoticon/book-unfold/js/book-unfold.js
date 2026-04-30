;(function () {
  const scrollRoot = document.querySelector('[data-scroll-container]')
  const track = document.querySelector('[data-book-scroll-track]')
  if (!scrollRoot || !track) return

  const scroller = new LocomotiveScroll({
    el: scrollRoot,
    smooth: false
  })

  function clamp01(v) {
    return Math.max(0, Math.min(1, v))
  }

  function getTrackProgress() {
    const rect = track.getBoundingClientRect()
    const vh = window.innerHeight
    const total = Math.max(track.offsetHeight - vh, 1)
    const passed = Math.max(0, -rect.top)
    return clamp01(passed / total)
  }

  function updateBookProgress() {
    scrollRoot.style.setProperty('--book-progress', String(getTrackProgress()))
  }

  scroller.on('scroll', updateBookProgress)

  window.addEventListener('scroll', updateBookProgress, { passive: true })
  window.addEventListener('resize', function () {
    scroller.update()
    updateBookProgress()
  })

  updateBookProgress()
  requestAnimationFrame(function () {
    scroller.update()
    updateBookProgress()
  })
})()
