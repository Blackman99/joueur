import type { Action } from 'svelte/types/runtime/action'

const clickOutside: Action = (node: any, {
  cbInside,
  cbOutside,
}: {
  cbInside?: () => void
  cbOutside?: () => void
}) => {
  const clickHandler = (e: any) => {
    if (!e.target || !node)
      return
    if (node.contains(e.target))
      cbInside?.()

    else
      cbOutside?.()
  }

  window.addEventListener('click', clickHandler)

  window.addEventListener('contextmenu', clickHandler)

  return {
    destroy() {
      window.removeEventListener('click', clickHandler)
      window.removeEventListener('contextmenu', clickHandler)
    },
  }
}

export default clickOutside
