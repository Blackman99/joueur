import { circInOut } from 'svelte/easing'

const pageTransition = (node: any) => {
  const existingTransform = getComputedStyle(node).transform.replace('none', '')
  return {
    delay: 0,
    duration: 500,
    easing: circInOut,
    css: (t: number, u: number) => `opacity: ${t}; position: absolute; top: 0; bottom: 0; left: 15vw; right: 0; z-index: ${Math.floor(10 * t)}; transform: ${existingTransform} translateX(${100 * u}%)`,
  }
}

export default pageTransition
