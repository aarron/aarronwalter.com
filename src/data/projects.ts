// Projects shown on /making. Featured projects get a full card; the rest appear
// in a compact list. `repos` maps GitHub repositories to the project, so commit
// activity (scripts/fetch-github-activity.ts) lands in the right swimlane.
// `repo` is set only for public repositories, which visitors can open.

export interface Project {
  slug:        string
  name:        string
  pitch:       string          // one line: what it is
  about:       string          // a short paragraph for someone new to it
  highlights?: string[]
  stack:       string[]
  url?:        string          // live site, if public
  repo?:       string          // public GitHub repository URL
  repos:       string[]        // GitHub repos whose commits count toward this project
  featured?:   boolean
  context?:    string          // where it lives, e.g. "Design Better" or "Personal"
  image?:      string          // screenshot in /public/making, shown in a browser frame
}

export const projects: Project[] = [
  {
    slug: 'curious',
    image: '/making/curious.webp',
    name: 'Curious',
    context: 'Design Better',
    featured: true,
    pitch: 'Research and interview help for podcast hosts.',
    about: 'A good interview rests on research: knowing the guest\'s story, reading their recent work and arriving with questions they have not answered a hundred times. That takes hours per guest. Curious does the groundwork in minutes. Give it a guest\'s name and it writes a briefing and a pool of questions in the host\'s own voice, then stays useful during the recording and after it, with transcription and a review of how the conversation went.',
    highlights: [
      'Questions written in the host\'s own voice by several AI models working together',
      'Live interview mode with a running clock and talk-time signals',
      'Real-time co-editing for multiple hosts',
      'A post-interview review of question craft and talk time',
    ],
    stack: ['Next.js', 'Claude', 'Neon Postgres', 'Stripe', 'PartyServer', 'AssemblyAI'],
    url: 'https://imcurious.io',
    repos: ['Design-Better/showprep'],
  },
  {
    slug: 'designbetter-com',
    image: '/making/designbetter-com.webp',
    name: 'designbetter.com',
    context: 'Design Better',
    featured: true,
    pitch: 'The front door to Design Better.',
    about: 'Design Better is a podcast, newsletter and book series about design, technology and the creative process. Its work lives in many places: episodes on Spotify and Apple Podcasts, videos on YouTube, the newsletter on Substack, plus books, jobs and a community. designbetter.com brings it together in one site that helps visitors find what interests them and invites them to become members.',
    highlights: [
      'One archive of every episode, video and essay',
      'Search across everything Design Better has published',
      'Live jobs board and the nine Design Better books',
    ],
    stack: ['Next.js', 'Tailwind', 'Substack', 'YouTube API'],
    url: 'https://designbetter.com',
    repos: ['Design-Better/designbetter.com'],
  },
  {
    slug: 'design-system',
    image: '/making/design-system.webp',
    name: 'Design Better Design System',
    context: 'Design Better',
    featured: true,
    pitch: 'One rulebook for every Design Better product, for people and for AI.',
    about: 'A design system is the shared rulebook for how a company\'s products look, sound and behave: colors, type, spacing, components and the tone of its writing. Design Better runs a growing family of sites and tools, and this is the system they share. It is published as a website for people and as an MCP server, so AI coding assistants can look up the exact rules instead of guessing.',
    highlights: [
      'Published at designbetter.style',
      'Served to AI assistants over the Model Context Protocol',
      'A build check keeps the site and the MCP server in agreement',
    ],
    stack: ['Next.js', 'MCP', 'TypeScript'],
    url: 'https://designbetter.style',
    repos: ['Design-Better/dbdesignsystem'],
  },
  {
    slug: 'athens-holiday-market',
    image: '/making/athens-holiday-market.webp',
    name: 'Athens Holiday Market',
    context: 'Community',
    featured: true,
    pitch: 'The website and jury system for a juried holiday market of local makers.',
    about: 'The Athens Holiday Market is a two-evening market of handmade goods by local artists, held each December in the courtyard of Big City Bread in Athens, Georgia. Artists apply, a panel of judges reviews their work, and only accepted artists get a booth. This system handles all of it: the public site where shoppers browse artists and artists apply, and the organizers\' console for judging, notifications, booth fees and artist pages.',
    highlights: [
      'Judges vote on applications with photos side by side',
      'Email and text-message broadcasts to artists, judges and shoppers',
      'Booth-fee invoices sent and tracked automatically',
      'Accepted artists build their own public pages',
    ],
    stack: ['Next.js', 'Neon Postgres', 'Drizzle', 'Resend', 'Twilio', 'PayPal'],
    url: 'https://athensholidaymarket.com',
    repo: 'https://github.com/aarron/athens-holiday-market',
    repos: ['aarron/athens-holiday-market'],
  },
  {
    slug: 'guitar-reference',
    name: 'Guitar Reference',
    context: 'Personal',
    featured: true,
    pitch: 'Three years of handwritten guitar lessons, made searchable and practicable.',
    about: 'Three years of guitar lessons left a stack of handwritten notes: chord diagrams, scales, theory and photocopied songs, about 96 scanned PDFs. Nothing was searchable, and the only way to practice was to flip pages. This project turned them into a linked reference library and a practice app. The hard part was reading the teacher\'s hand-drawn chord diagrams accurately, which AI could not be trusted to do, so every chord is checked against music theory before it is shown.',
    highlights: [
      '231 chords with 876 fingerings, 204 scales and 25 songs',
      'A practice app with 956 questions and spaced repetition',
    ],
    stack: ['Python', 'Next.js', 'Claude', 'Obsidian'],
    repos: ['aarron/guitar-reference', 'aarron/guitar-reference-vault'],
  },
  {
    slug: 'power-dashboard',
    name: 'Power Dashboard',
    context: 'Personal',
    featured: true,
    pitch: 'A dashboard for tracking solar power generation at my home and our power consumption. It connects to the microinverters on my roof and Georgia Power to help us optimize power usage and reduce power bills.',
    about: 'Our house in Athens, Georgia, has had an 11-kilowatt solar array for ten years, yet the electric bill kept climbing. This dashboard combines ten years of bills, solar production and local weather to separate the causes. The panels now make about a third less power than in 2017, and two-thirds of the recent increase comes from using more electricity, not higher rates. It updates itself every morning.',
    highlights: [
      'Ten years of bills, solar output and weather in one place',
      'Weather-normalized analysis separates usage from rates',
      'Refreshes daily from the utility and the solar inverters',
    ],
    stack: ['Next.js', 'Recharts', 'Enphase API'],
    repos: ['aarron/power-dashboard'],
  },
  {
    slug: 'vestabridge',
    name: 'VestaBridge',
    context: 'Personal',
    featured: true,
    pitch: 'Messages to a split-flap display, even when the internet is down.',
    about: 'A Vestaboard is a wall-mounted split-flap display, like the clattering letter boards once found in train stations. VestaBridge adds two new ways to send it messages: an ordinary text message, or off-grid radio over a Meshtastic mesh, which needs no cell service or internet. It runs on a Raspberry Pi the size of a stick of gum.',
    highlights: [
      'Text a phone number and the board flips to your message',
      'Off-grid messages arrive over long-range radio',
    ],
    stack: ['Python', 'Raspberry Pi', 'Meshtastic', 'Twilio'],
    repo: 'https://github.com/aarron/vestabridge',
    repos: ['aarron/vestabridge'],
  },


  // ── More projects ──
  {
    slug: 'state-of-design', name: 'State of Design', context: 'Design Better',
    pitch: 'A report site on the state of the design profession.',
    about: '', stack: ['Next.js'], repos: ['Design-Better/state-of-design'],
  },
  {
    slug: 'designer-directory', name: 'Designer Directory', context: 'Design Better',
    pitch: 'A talent directory to help great designers find great jobs.',
    about: '', stack: ['Next.js'], repos: ['Design-Better/designer-directory'],
  },
  {
    slug: 'design-better-teams', name: 'Design Better Teams', context: 'Design Better',
    pitch: 'Design Better for teams.',
    about: '', stack: ['Next.js'], repos: ['Design-Better/design-better-teams'],
  },
  {
    slug: 'db-community', name: 'Design Better Community', context: 'Design Better',
    pitch: 'Member profiles, Slack onboarding and renewals for the paid community.',
    about: '', stack: ['Next.js'], repos: ['Design-Better/db-community'],
  },
  {
    slug: 'db-corpus', name: 'Design Better Corpus', context: 'Design Better',
    pitch: 'Semantic search across everything Design Better has published.',
    about: '', stack: ['Next.js', 'Claude'], repos: ['Design-Better/db-corpus'],
  },
  {
    slug: 'designbetter-adobe', name: 'Design Better × Adobe', context: 'Design Better',
    pitch: 'The Design Better Premium offer for Adobe Creative Cloud members.',
    about: '', stack: ['Next.js'], repos: ['Design-Better/designbetter-adobe'],
  },
  {
    slug: 'aarronwalter-com', name: 'aarronwalter.com', context: 'Personal',
    pitch: 'This site: reading, listening, notes and now making.',
    about: '', stack: ['Next.js', 'Discogs API', 'Spotify', 'MusicBrainz'],
    url: 'https://aarronwalter.com', repo: 'https://github.com/aarron/aarronwalter.com',
    repos: ['aarron/aarronwalter.com'],
  },
  {
    slug: 'meghan-the-engineer', name: 'Meghan the Engineer', context: 'Personal',
    pitch: 'A Tufte-inspired Ghost theme for Meghan Walter\'s site.',
    about: '', stack: ['Ghost'], repos: ['aarron/meghantheengineer'],
  },
]
