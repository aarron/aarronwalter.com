import type { Metadata } from 'next'
import ListeningView from './ListeningView'

export const metadata: Metadata = {
  title: 'Listening',
  description: "Aarron Walter's vinyl record collection.",
}

export default function ListeningPage() {
  return <ListeningView />
}
