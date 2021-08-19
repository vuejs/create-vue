import { ref, onUnmounted } from 'vue'

export default function useMediaQuery(query) {
  const mediaQueryList = window.matchMedia(query)
  const matches = ref(mediaQueryList.matches)

  const handler = (event) => {
    matches.value = event.matches
  }

  // Safari < 14 does not support this
  if (mediaQueryList.addEventListener) {
    mediaQueryList.addEventListener('change', handler)
  } else {
    mediaQueryList.addListener(handler)
  }

  onUnmounted(() => {
    // Safari < 14 does not support this
    if (mediaQueryList.removeEventListener) {
      mediaQueryList.removeEventListener('change', handler)
    } else {
      mediaQueryList.removeListener(handler)
    }
  })

  return matches
}
