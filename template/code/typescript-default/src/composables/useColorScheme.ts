import { ref, computed } from 'vue'
import useMediaQuery from './useMediaQuery'

// Its value should be consistent when called multiple times.
// So we put it outside the composable function
const isUserToggledDark = ref<boolean>()

export default function useColorScheme() {
  const isDefaultDark = useMediaQuery('(prefers-color-scheme: dark)')

  const isDark = computed(() => {
    if (typeof isUserToggledDark.value !== 'undefined') {
      return isUserToggledDark.value
    } else {
      return isDefaultDark.value
    }
  })

  const toggle = () => {
    if (typeof isUserToggledDark.value !== 'undefined') {
      isUserToggledDark.value = !isUserToggledDark.value
    } else {
      isUserToggledDark.value = !isDefaultDark.value
    }
  }

  return {
    toggle,
    isDark
  }
}
