import { expect } from 'chai'
import { generateRoutesFromFiles } from '../src/pages/utils'

describe('pages:utils', () => {
  describe('generateRoutesFromFiles', () => {
    const pagesDir = 'pages'

    it('should generate correct route for 404', () => {
      const files = [`${pagesDir}/404.vue`]
      const output = generateRoutesFromFiles(files, pagesDir)
      expect(output[0]).to.deep.equal({
        name: '404',
        path: '/:catchAll(.*)*',
        file: `${pagesDir}/404.vue`,
        children: []
      })
    })

    it('should generate correct routes for index pages', () => {
      const files = [
        `${pagesDir}/index.vue`,
        `${pagesDir}/parent/index.vue`,
        `${pagesDir}/parent/child/index.vue`
      ]
      const output = generateRoutesFromFiles(files, pagesDir)
      expect(output[0]).to.deep.equal({
        name: 'index',
        path: '/',
        file: `${pagesDir}/index.vue`,
        children: []
      })
      expect(output[1]).to.deep.equal({
        name: 'parent',
        path: '/parent',
        file: `${pagesDir}/parent/index.vue`,
        children: []
      })
      expect(output[2]).to.deep.equal({
        name: 'parent-child',
        path: '/parent/child',
        file: `${pagesDir}/parent/child/index.vue`,
        children: []
      })
    })

    it('should generate correct routes for parent/child', () => {
      const files = [
        `${pagesDir}/parent.vue`,
        `${pagesDir}/parent/child.vue`
      ]
      const output = generateRoutesFromFiles(files, pagesDir)
      expect(output[0]).to.deep.equal({
        name: 'parent',
        path: '/parent',
        file: `${pagesDir}/parent.vue`,
        children: [
          {
            name: 'parent-child',
            path: 'child',
            file: `${pagesDir}/parent/child.vue`,
            children: []
          }
        ]
      })
    })

    it('should generate correct route for snake_case file', () => {
      const files = [`${pagesDir}/snake_case.vue`]
      const output = generateRoutesFromFiles(files, pagesDir)
      expect(output[0]).to.deep.equal({
        name: 'snake_case',
        path: '/snake_case',
        file: `${pagesDir}/snake_case.vue`,
        children: []
      })
    })

    it('should generate correct route for kebab-case file', () => {
      const files = [`${pagesDir}/kebab-case.vue`]
      const output = generateRoutesFromFiles(files, pagesDir)
      expect(output[0]).to.deep.equal({
        name: 'kebab-case',
        path: '/kebab-case',
        file: `${pagesDir}/kebab-case.vue`,
        children: []
      })
    })

    it('should generate correct dynamic routes', () => {
      const files = [
        `${pagesDir}/[slug].vue`,
        `${pagesDir}/sub/[slug].vue`,
        `${pagesDir}/[sub]/route-[slug].vue`
      ]
      const output = generateRoutesFromFiles(files, pagesDir)
      expect(output[0]).to.deep.equal({
        name: 'slug',
        path: '/:slug?',
        file: `${pagesDir}/[slug].vue`,
        children: []
      })
      expect(output[1]).to.deep.equal({
        name: 'sub-slug',
        path: '/sub/:slug?',
        file: `${pagesDir}/sub/[slug].vue`,
        children: []
      })
      expect(output[2]).to.deep.equal({
        name: 'sub-route-slug',
        path: '/:sub/route-:slug',
        file: `${pagesDir}/[sub]/route-[slug].vue`,
        children: []
      })
    })

    it('should generate correct catch-all route', () => {
      const files = [`${pagesDir}/[...slug].vue`]
      const output = generateRoutesFromFiles(files, pagesDir)
      expect(output[0]).to.deep.equal({
        name: 'slug',
        path: '/:slug(.*)*',
        file: `${pagesDir}/[...slug].vue`,
        children: []
      })
    })

    it('should throw unfinished param error for dynamic route', () => {
      const files = [`${pagesDir}/[slug.vue`]
      expect(() => generateRoutesFromFiles(files, pagesDir)).to.throw('Unfinished param "slug"')
    })

    it('should throw empty param error for dynamic route', () => {
      const files = [`${pagesDir}/[].vue`]
      expect(() => generateRoutesFromFiles(files, pagesDir)).to.throw('Empty param')
    })

    it('should only allow "_" & "." as special character for dynamic route', () => {
      const files = [
        `${pagesDir}/[a1_1a].vue`,
        `${pagesDir}/[b2.2b].vue`,
        `${pagesDir}/[c3@3c].vue`,
        `${pagesDir}/[d4-4d].vue`
      ]
      const output = generateRoutesFromFiles(files, pagesDir)
      expect(output[0]).to.deep.equal({
        name: 'a1_1a',
        path: '/:a1_1a?',
        file: `${pagesDir}/[a1_1a].vue`,
        children: []
      })
      expect(output[1]).to.deep.equal({
        name: 'b2.2b',
        path: '/:b2.2b?',
        file: `${pagesDir}/[b2.2b].vue`,
        children: []
      })
      expect(output[2]).to.deep.equal({
        name: 'c33c',
        path: '/:c33c?',
        file: `${pagesDir}/[c3@3c].vue`,
        children: []
      })
      expect(output[3]).to.deep.equal({
        name: 'd44d',
        path: '/:d44d?',
        file: `${pagesDir}/[d4-4d].vue`,
        children: []
      })
    })
  })
})
