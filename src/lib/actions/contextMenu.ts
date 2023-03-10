import type { Action } from 'svelte/types/runtime/action'
import ContextMenu__SvelteComponent_ from '../components/ContextMenu.svelte'
import clickOutside from './outsideClick'

export interface ContextMenu {
  title: string
}

let contentMenuInstance: ContextMenu__SvelteComponent_

const useContextMenu: Action = (node: any, {
  menus,
  actionHandler,
}: {
  menus: ContextMenu[]
  actionHandler: (e: any) => any
}) => {
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
      actionHandler: async (e: any) => {
        await actionHandler(e)
        contentMenuInstance.$set()
      },
    }
    if (!contentMenuInstance) {
      const div = document.createElement('div')
      div.className = 'j-context-menu'
      contentMenuInstance = new ContextMenu__SvelteComponent_({
        target: div,
        props,
      })
      document.body.append(div)
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
}

export default useContextMenu
