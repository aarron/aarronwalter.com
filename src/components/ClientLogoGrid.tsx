'use client'

import {
  siGoogle, siIntuit, siGoldmansachs, siWellsfargo,
  siPeloton, siAtlassian, siZendesk, siAtandt, siVmware,
} from 'simple-icons'

// Simple-icons always use a 24×24 viewBox
const ICON_VIEWBOX = '0 0 24 24'

const CLIENTS: { name: string; icon?: { path: string } }[] = [
  { name: 'Google',                 icon: siGoogle },
  { name: 'The White House' },
  { name: 'LinkedIn' },
  { name: 'Goldman Sachs',          icon: siGoldmansachs },
  { name: 'USAA' },
  { name: 'Intuit',                 icon: siIntuit },
  { name: 'US Dept. of State' },
  { name: 'Wells Fargo',            icon: siWellsfargo },
  { name: "Lloyd's Bank" },
  { name: 'Peloton',                icon: siPeloton },
  { name: 'Atlassian',              icon: siAtlassian },
  { name: 'WHO' },
  { name: 'CDC' },
  { name: 'W3C' },
  { name: "L'Oréal Paris" },
  { name: 'State Farm' },
  { name: 'The Home Depot' },
  { name: 'VMware',                 icon: siVmware },
  { name: 'Booz Allen Hamilton' },
  { name: 'Crate and Barrel' },
  { name: 'FirstMark Capital' },
  { name: 'Capital One' },
  { name: 'IBM' },
  { name: 'Zendesk',                icon: siZendesk },
  { name: 'AT&T',                   icon: siAtandt },
]

export default function ClientLogoGrid() {
  return (
    <ul className="about-clients">
      {CLIENTS.map(({ name, icon }) => (
        <li key={name} className="about-client-logo" title={name}>
          {icon ? (
            <svg
              role="img"
              aria-label={name}
              viewBox={ICON_VIEWBOX}
              className="about-client-svg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={icon.path} />
            </svg>
          ) : (
            <span className="about-client-fallback">{name}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
