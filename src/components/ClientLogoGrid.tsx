'use client'

import {
  siGoogle, siIntuit, siGoldmansachs, siWellsfargo,
  siPeloton, siAtlassian, siZendesk, siAtandt, siVmware,
} from 'simple-icons'

// Paths for brands not in simple-icons v16 — sourced from public SVG repositories
const LINKEDIN_PATH = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

const IBM_PATH = 'M23.544 15.993c.038 0 .06-.017.06-.053v-.036c0-.035-.022-.052-.06-.052h-.09v.14zm-.09.262h-.121v-.498h.225c.112 0 .169.066.169.157 0 .079-.036.129-.09.15l.111.19h-.133l-.092-.17h-.07zm.434-.222v-.062c0-.2-.157-.357-.363-.357a.355.355 0 00-.363.357v.062c0 .2.156.358.363.358a.355.355 0 00.363-.358zm-.838-.03c0-.28.212-.492.475-.492.264 0 .475.213.475.491 0 .279-.211.491-.475.491a.477.477 0 01-.475-.49zM16.21 8.13l-.216-.624h-3.56v.624zm.413 1.19l-.216-.623h-3.973v.624zm2.65 7.147h3.107v-.624h-3.108zm0-1.192h3.107v-.623h-3.108zm0-1.19h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-3.555l-.175.504-.175-.504h-3.555v.624h1.865v-.574l.2.574h3.33l.2-.574zm1.864-1.815h-3.142l-.217.624h3.359zm-7.46 3.006h1.865v-.624h-1.865zm0 1.19h1.865v-.623h-1.865zm-1.243 1.191h3.108v-.623h-3.108zm0 1.192h3.108v-.624h-3.108zm6.386-8.961l-.216.624h3.776v-.624zm-.629 1.815h4.19v-.624h-3.974zm-4.514 1.19h3.359l-.216-.623h-3.143zm2.482 2.383h2.496l.218-.624h-2.932zm.417 1.19h1.662l.218-.623h-2.098zm.416 1.191h.83l.218-.623h-1.266zm.414 1.192l.217-.624h-.432zm-12.433-.006l4.578.006c.622 0 1.18-.237 1.602-.624h-6.18zm4.86-3v.624h2.092c0-.216-.03-.425-.083-.624zm-3.616.624h1.865v-.624H6.217zm3.617-3.573h2.008c.053-.199.083-.408.083-.624H9.834zm-3.617 0h1.865v-.624H6.217zM9.55 7.507H4.973v.624h6.18a2.36 2.36 0 00-1.602-.624zm2.056 1.191H4.973v.624h6.884a2.382 2.382 0 00-.25-.624zm-5.39 2.382v.624h4.87c.207-.176.382-.387.519-.624zm4.87 1.191h-4.87v.624h5.389a2.39 2.39 0 00-.519-.624zm-6.114 3.006h6.634c.11-.193.196-.402.25-.624H4.973zM0 8.13h4.352v-.624H0zm0 1.191h4.352v-.624H0zm1.243 1.191h1.865v-.624H1.243zm0 1.191h1.865v-.624H1.243zm0 1.19h1.865v-.623H1.243zm0 1.192h1.865v-.624H1.243zM0 15.276h4.352v-.623H0zm0 1.192h4.352v-.624H0Z'

const W3C_PATH = 'M23.642 5.602l-.931 1.858s-.4-.738-.795-1.076c-.377-.322-.864-.62-1.48-.556-.597.062-1.27.587-1.722 1.46-.513.994-.688 2.001-.692 3.112-.005 1.556.57 2.618.57 2.618s-.132-.494-.11-1.33c.014-.52.017-1.089.41-2.261.33-.98 1.084-1.775 1.75-1.912.517-.107.847-.03 1.356.329.603.425.966 1.193.966 1.193l.946-1.81zM0 5.674l3.77 12.723h.156l2.356-7.886 2.357 7.886h.157l3.228-10.895.152-.258h2.655l-2.2 3.802v.754h.629c.806 0 1.398.246 1.775.738.324.42.487 1.011.487 1.776 0 .691-.152 1.283-.455 1.775-.304.492-.676.738-1.116.738-.419 0-.783-.138-1.092-.416-.308-.277-.557-.657-.746-1.139l-1.288.534c.261.796.665 1.427 1.21 1.893.544.466 1.183.699 1.916.699.974 0 1.767-.393 2.38-1.178.613-.785.919-1.754.919-2.906 0-.932-.21-1.743-.628-2.435-.42-.69-1.037-1.167-1.854-1.43l2.326-4.006v-.77h-6.177L8.64 13.419 6.362 5.674h-1.65l.754 2.529-1.54 5.215L1.65 5.674zm17.44 8.88s.233.755.379 1.076c.084.185.342.75.708 1.24.341.46 1.004 1.248 2.011 1.426 1.008.178 1.7-.274 1.871-.384.172-.11.533-.412.761-.657.239-.255.465-.58.59-.775.091-.143.24-.432.24-.432l-.241-1.255s-.418.748-.678 1.036c-.261.288-.727.794-1.302 1.048-.576.253-.877.302-1.446.247-.569-.054-1.097-.383-1.282-.52-.185-.138-.658-.542-.925-.92-.268-.376-.686-1.13-.686-1.13z'

type LogoEntry =
  | { name: string; kind: 'icon'; path: string }
  | { name: string; kind: 'img'; src: string }
  | { name: string; kind: 'text' }

const CLIENTS: LogoEntry[] = [
  { name: 'Google',                 kind: 'icon', path: siGoogle.path },
  { name: 'The White House',        kind: 'img',  src: '/logos/white-house.svg' },
  { name: 'LinkedIn',               kind: 'icon', path: LINKEDIN_PATH },
  { name: 'Goldman Sachs',          kind: 'icon', path: siGoldmansachs.path },
  { name: 'USAA',                   kind: 'img',  src: '/logos/usaa.svg' },
  { name: 'Intuit',                 kind: 'icon', path: siIntuit.path },
  { name: 'US Dept. of State',      kind: 'img',  src: '/logos/state-dept.svg' },
  { name: 'Wells Fargo',            kind: 'icon', path: siWellsfargo.path },
  { name: "Lloyd's Bank",           kind: 'img',  src: '/logos/lloyds.svg' },
  { name: 'Peloton',                kind: 'icon', path: siPeloton.path },
  { name: 'Atlassian',              kind: 'icon', path: siAtlassian.path },
  { name: 'WHO',                    kind: 'img',  src: '/logos/who.svg' },
  { name: 'CDC',                    kind: 'img',  src: '/logos/cdc.svg' },
  { name: 'W3C',                    kind: 'icon', path: W3C_PATH },
  { name: "L'Oréal Paris",          kind: 'img',  src: '/logos/loreal.svg' },
  { name: 'State Farm',             kind: 'img',  src: '/logos/state-farm.svg' },
  { name: 'The Home Depot',         kind: 'img',  src: '/logos/home-depot.svg' },
  { name: 'VMware',                 kind: 'icon', path: siVmware.path },
  { name: 'Booz Allen Hamilton',    kind: 'img',  src: '/logos/booz-allen.svg' },
  { name: 'Crate and Barrel',       kind: 'img',  src: '/logos/crate-barrel.svg' },
  { name: 'FirstMark Capital',      kind: 'text' },
  { name: 'Capital One',            kind: 'img',  src: '/logos/capital-one.svg' },
  { name: 'IBM',                    kind: 'icon', path: IBM_PATH },
  { name: 'Zendesk',                kind: 'icon', path: siZendesk.path },
  { name: 'AT&T',                   kind: 'icon', path: siAtandt.path },
]

const ICON_VIEWBOX = '0 0 24 24'

export default function ClientLogoGrid() {
  return (
    <ul className="about-clients">
      {CLIENTS.map(({ name, ...entry }) => (
        <li key={name} className="about-client-logo" data-logo={name} title={name}>
          {entry.kind === 'icon' ? (
            <svg
              role="img"
              aria-label={name}
              viewBox={ICON_VIEWBOX}
              className="about-client-svg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={entry.path} />
            </svg>
          ) : entry.kind === 'img' ? (
            <img
              src={entry.src}
              alt={name}
              className="about-client-img"
              loading="lazy"
            />
          ) : (
            <span className="about-client-fallback">{name}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
