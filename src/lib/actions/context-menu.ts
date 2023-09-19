import type { Action } from 'svelte/types/runtime/action'
import ContextMenu__SvelteComponent_ from '../components/shared/ContextMenu.svelte'
import clickOutside from './outside-click'

export interface ContextMenuItem {
  [key: string]: any
  title: string
  name: string
  children?: ContextMenuItem[]
}

export type ContextHandler = (e: any, menu: ContextMenuItem) => any
export interface ContextMenuActionParams {
  menus: ContextMenuItem[]
  actionHandler?: ContextHandler
}

let contentMenuInstance: ContextMenu__SvelteComponent_ | undefined
let div: HTMLDivElement | undefined

const createdOrUpdateContextMenu = (node: any, { menus, actionHandler }: ContextMenuActionParams) => {
  if (!menus.length || !actionHandler) return
  const handler = (e: any) => {
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
    }
    else {
      contentMenuInstance.$set(props)
    }
  }
  node.addEventListener('contextmenu', handler)
  return () => {
    node.removeEventListener('contextmenu', handler)
  }
}

const useContextMenu: Action<any, ContextMenuActionParams> = (node: any, {
  menus,
  actionHandler,
} = {
  menus: [],
}) => {
  let cleaner = createdOrUpdateContextMenu(node, { menus, actionHandler })

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
    update(p) {
      cleaner?.()
      cleaner = createdOrUpdateContextMenu(node, p)
    },
  }
}

export default useContextMenu
