import { splitByCase, upperFirst } from 'scule'

export default (title, link) => (title || link.split('/').filter(Boolean).map(part => splitByCase(part).map(p => upperFirst(p)).join(' ')).join(' > ').replace('Api', 'API'))
