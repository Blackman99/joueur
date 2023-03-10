import type { Action } from 'svelte/types/runtime/action'
import ContextMenu__SvelteComponent_ from '../components/ContextMenu.svelte'
import clickOutside from './outsideClick'

export interface ContextMenuItem {
  title: string
  name: string
}

export type ContextHandler = (e: any, menu: ContextMenuItem) => any

let contentMenuInstance: ContextMenu__SvelteComponent_ | undefined
let div: HTMLDivElement | undefined

const useContextMenu: Action<any, {
  menus: ContextMenuItem[]
  actionHandler?: ContextHandler
}> = (node: any, {
  menus,
  actionHandler,
} = {
  menus: [],
}) => {
  if (!menus.length || !actionHandler) return
  node.addEventListener('contextmenu', (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    const x = e.clientX
    const y = e.clientY
    const props = {
      show: true,
      x,
      y,
      menus,
      actionHandler: async (e: any, menu: ContextMenuItem) => {
        await actionHandler(e, menu)
        contentMenuInstance?.$set({
          show: false,
        })
      },
    }
    if (!contentMenuInstance) {
      if (!div) {
        div = document.createElement('div')
        div.className = 'j-context-menu'
        document.body.append(div)
      }
      contentMenuInstance = new ContextMenu__SvelteComponent_({
        target: div,
        props,
      })
    } else {
      contentMenuInstance.$set(props)
    }
  })

  clickOutside(node, {
    cbOutside: () => {
      contentMenuInstance?.$set({
        show: false,
      })
    },
  })

  return {
    destroy() {
      contentMenuInstance?.$destroy()
      div?.remove()
      contentMenuInstance = undefined
      div = undefined
    },
  }
}

export default useContextMenu
