import type { NavItem } from '@nuxt/content/dist/runtime/types'
import { upperFirst } from 'scule'

export const _find = (
  items: NavItem[],
  id: string,
  tree: NavItem[] = [],
  condition: (node: NavItem) => boolean
): { found?: NavItem; tree: NavItem[] } => {
  for (const item of items) {
    if (condition(item)) { return { found: item, tree } }

    if (item.children) {
      const result = _find(item.children, id, [...tree, item], condition)

      if (result.found) { return result }
    }
  }

  return { tree }
}

export const findElement = (
  items: NavItem[],
  id: string,
  tree: NavItem[] = [],
  condition = (node: NavItem) => node.id === id || node.slug === id
) => _find(items, id, tree, condition)

export const findIndex = (items: NavItem[]) => items.find(item => item.slug === '/')

export const isIndex = (id: string) => {
  const idParts = id.split(':').slice(1)
  return !!idParts[idParts.length - 1].match(/([1-9][0-9]*\.)?index.md/g)
}

export const isDocument = (node: NavItem) => 'partial' in node && 'draft' in node && !node.empty

export const directory = (link: string) => {
  const dirs = link.split('/')
  const directory = dirs.length > 1 ? dirs[dirs.length - 2] : ''
  return directory.split('-').map(upperFirst).join(' ')
}
