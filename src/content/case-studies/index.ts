import type { CaseStudy, ComingSoon } from '../types'
import { angelFoundation } from './angel-foundation'
import { noree } from './noree'
import { constructionOs } from './construction-os'
import { physioOs } from './physio-os'

export const caseStudies: CaseStudy[] = [angelFoundation, noree, constructionOs, physioOs]

/** Products with nothing verifiable to say yet. No invented feature copy. */
export const comingSoon: ComingSoon[] = [
  {
    slug: 'noholi-library',
    kind: 'product',
    clientName: 'Noholi Library',
    clientKind: 'Product',
    status: 'coming-soon',
    summary: 'In development. Details published once there is something real to show.',
  },
]

export const projects = caseStudies.filter((c) => c.kind === 'project')
export const products = caseStudies.filter((c) => c.kind === 'product')

export const bySlug = (slug: string) => caseStudies.find((c) => c.slug === slug)
