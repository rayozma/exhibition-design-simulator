import type { BriefingSection, QuizItem } from '../lib/briefing'

/**
 * Starting content of the team briefing, from the ADIPEC briefing handout. Written to the database
 * once, when the briefing is still empty; after that the team edits it on the page.
 * Links shown as [name]() have no address yet: edit the section to paste the Drive link.
 */
type Seed = { id: string; title: string; body: string; quiz?: QuizItem[]; kind?: 'booth' }

const SEED: Seed[] = [
  {
    id: 'first-time',
    title: 'First time at ADIPEC?',
    body: `**ADIPEC 2026 · 2–5 November 2026 · ADNEC, Abu Dhabi**

![ADIPEC exhibition hall at ADNEC](https://www.adipec.com/media/qp3oxxq0/seoimage.jpg)

- One of the largest oil & gas exhibitions in the world
- 200,000 visitors last year
- Huge venue (ADNEC) with hundreds of exhibitors
- Come early every morning (8 AM to 4 PM)
- Be fit: it will be a long but very exciting week
briefing/videos/adipec-2026.mp4`,
    quiz: [
      {
        q: 'What are the booth hours you should plan around each day?',
        choices: ['8 AM to 4 PM', '10 AM to 6 PM', '9 AM to 9 PM', '7 AM to 1 PM'],
        answer: 0,
        explain: 'Come early every morning: the show runs 8 AM to 4 PM.',
      },
      {
        q: 'Roughly how many visitors came to ADIPEC last year?',
        choices: ['20,000', '75,000', '200,000', '1 million'],
        answer: 2,
      },
    ],
  },
  {
    id: 'who',
    title: "Who we are & why we're here",
    body: `We are **Terra Drone x NDTCCS x VALSEM**: a partnership between Terra Drone Indonesia & NDT Corrosion Control Services UAE to serve the market in the UAE, especially Abu Dhabi, together with VALSEM Industries, NDTCCS's strategic partner in the GCC.

### Terra Drone, a drone startup from Japan
- **Starting year:** 2016
- **HQ:** Japan
- **Presence:** Japan; Southeast Asia (Indonesia, Singapore, Malaysia); Middle East (UAE, KSA); Europe (Netherlands, Germany, Belgium)
- **No. of employees:** 650++ globally (100 in Japan, 500 in Southeast Asia, 50 in Europe, 20 in Middle East)
- **Core business:** drone services (survey & mapping, inspection, surveillance, agriculture service, spraying, training, consultancy, etc), drone R&D (Terra LiDAR, UT Drone, Aviro Spraying, etc), software development (3D Inspect, Terra Cloud, etc)
- **Key customers:** UAE (ADNOC), Europe (Wilmar, Vopak, VTTI, etc), Oil & Gas (Chevron, ConocoPhillips, ExxonMobil, Shell, INPEX, etc), Agriculture (Sinarmas, Sime Darby, etc)

### NDTCCS, an inspection company from KSA
- **Starting year:** 1975
- **HQ:** KSA
- **Presence:** the whole Middle East (KSA, UAE, Oman, Bahrain, Qatar, Kuwait)
- **No. of employees:** 3,000++
- **Core business:** NDT inspection, advanced NDT (robotics, drones, underwater ROV, etc), lifting inspection, metallurgy & laboratory services, asset integrity management, heat treatment, cathodic protection, manpower supply, etc
- **Key customers:** Aramco, SABIC, ADNOC, Nawah, etc

### VALSEM, an equipment protection company from France
- **Starting year:** 1977
- **HQ:** France
- **Core business:** protecting critical equipment during transport and storage (ValStrong anti-corrosion membranes, EXA-AIR anti-shock cushioning) and keeping proof of its condition over time (ValTRACK sensors)
- **Customers:** ~980 industrial customers in energy, nuclear, aerospace and infrastructure
- **With us:** NDTCCS is VALSEM's strategic partner in the GCC; VALSEM has its own counter on our booth (see [VALSEM](#products/valsem) in the Product reference)

### Why we are in the Al Masaood pavilion
Terra Drone & NDTCCS have been working closely with Al Masaood **as their strategic partner** in securing some major contracts with ADNOC:

1. Drone center contract with ADNOC Onshore
2. Framework agreement with ADNOC Group

### Why we are at ADIPEC
We want to **showcase drone solutions** and their benefits for the oil & gas industry.

We want to **introduce the drones that are currently available in Abu Dhabi**, and the solutions that we can offer to customers.`,
    quiz: [
      {
        q: 'Where is Terra Drone headquartered, and when did it start?',
        choices: ['Japan, 2016', 'Indonesia, 2016', 'Japan, 1975', 'UAE, 2020'],
        answer: 0,
      },
      {
        q: 'Where is NDTCCS headquartered, and when did it start?',
        choices: ['UAE, 2016', 'KSA, 1975', 'Kuwait, 1990', 'Oman, 1985'],
        answer: 1,
      },
      {
        q: 'About how many employees does NDTCCS have?',
        choices: ['650+', '1,000+', '3,000+', '10,000+'],
        answer: 2,
      },
      {
        q: 'Which of these is a Terra Drone software product?',
        choices: ['Terra Cloud', 'FlightHub 2', 'GeoSLAM', 'VisitConnect'],
        answer: 0,
        explain: 'Terra Drone builds 3D Inspect and Terra Cloud. FlightHub 2 is DJI’s, GeoSLAM is a feature used with Elios 3.',
      },
      {
        q: 'Which ADNOC contract did we secure together with Al Masaood?',
        choices: ['Drone center contract with ADNOC Onshore', 'Offshore helicopter services', 'Pipeline construction', 'Refinery maintenance staffing'],
        answer: 0,
      },
    ],
  },
  {
    id: 'booth',
    kind: 'booth',
    title: 'Our booth & what we showcase',
    body: `Open the live 3D design to walk through the booth before the show: every numbered item on the stand has an info card (ⓘ) with its description, photos and FAQ.

Upload the booth render below with *Edit*.`,
  },
  {
    id: 'experience',
    title: 'Drone work experience in the UAE',
    body: `### ADNOC Offshore
- Void space inspection (external & internal)
- Under deck inspection (external)
- Caisson leg inspection (external & internal)
- Piperack inspection (external)
- UT measurement (caisson leg & void space)
- Drone delivery
- Cargo delivery using FlyCart 30

### ADNOC Refining: inspection of cyclone, boiler and flare (accomplished)
- Flare inspection
- Internal inspection (cyclone, boiler, reactor, snubber, drying tower, absorbing tower)

### ADNOC Onshore: Drone Center
- More than 60 flares inspected
- More than 400 OHL (overhead line) units inspected
- More than 400 wellheads surveyed
- More than 8,000 km of pipeline surveyed
- More than 3,000 km of in-field security patrolling
- Methane gas detection on BAB & Bu Hasa fields
- Delivery of goods by drone on Bu Hasa field
- Drone pilot training for ADNOC personnel
- Drone purchasing

### ADNOC Drilling
- High resolution and accuracy mapping and LiDAR
- Pipeline automatic feature extraction

### ADNOC Gas
- Methane emission monitoring for OGMP in Fujairah, Das Island and Habshan field

### Lafarge Holcim
- Confined space inspection inside EP and silo

### Equate (Kuwait)
- UT using Voliro on several pipes

Sample use cases: [Data Sample 2024]()`,
    quiz: [
      {
        q: 'How many km of pipeline has the ADNOC Onshore Drone Center surveyed?',
        choices: ['More than 800 km', 'More than 3,000 km', 'More than 8,000 km', 'More than 20,000 km'],
        answer: 2,
        explain: 'More than 8,000 km pipeline surveyed. 3,000 km is the in-field security patrolling.',
      },
      {
        q: 'How many flares has the ADNOC Onshore Drone Center inspected?',
        choices: ['More than 6', 'More than 60', 'More than 400', 'More than 1,000'],
        answer: 1,
      },
      {
        q: 'Where did we do methane gas detection for ADNOC Onshore?',
        choices: ['BAB & Bu Hasa fields', 'Das Island', 'Ruwais refinery', 'Zakum field'],
        answer: 0,
        explain: 'BAB & Bu Hasa for ADNOC Onshore. For ADNOC Gas (OGMP) it was Fujairah, Das Island and Habshan.',
      },
      {
        q: 'Which drone did we use for cargo delivery at ADNOC Offshore?',
        choices: ['DJI FlyCart 30', 'Rigitech Eiger', 'DJI M400', 'AheadX QP530'],
        answer: 0,
      },
      {
        q: 'What did we do for Equate in Kuwait?',
        choices: ['UT on pipes using Voliro', 'Flare inspection', 'Pipeline LiDAR mapping', 'Drone pilot training'],
        answer: 0,
      },
    ],
  },
  {
    id: 'offer',
    title: 'What do we offer?',
    body: `Every service we offer: what to say, our track record, videos, sample reports and the products we use. Search, or pick a category, then open a service.

[[service-catalog]]

## Inspection
### Inspection overview
![Drone inspecting an industrial plant](briefing/videos/m350.jpg)
- Five types of drone inspection: external visual, external thermal, internal (confined space), UT thickness and underwater
- **External visual**
  - Detailed high-resolution images from an ultra-zoom camera to visually inspect & identify defects / damage on structures from a safe distance
  - Mostly for vertical structures (OHL, comm towers, bridges, underdecks, overhanging pipes, etc). Drones remove the need for human inspectors to work at height
  - Drones cover large areas in a fraction of the time of a manual inspection, and greatly reduce the need for scaffolding, ladders, cranes or other expensive access equipment
- **External thermal**
  - Thermal images from an infra-red camera to find temperature / heat anomalies
  - Mostly for objects that deal with heat (flares, thermal oxidizers, etc)
- **Internal (confined space) close-up visual**
  - Detailed high-resolution images of internal surfaces in confined spaces (storage tanks, boilers, stacks (shutdown), air ducts, void spaces, caisson legs, etc) without human entry, reducing exposure to toxic gases, high temperatures and other hazards
- **UT thickness measurement**
  - Spot UT thickness measurement of a surface (storage tank wall, roof, IPA beam, boiler wall tube)
- **Underwater inspection**
  - High-resolution photo & video to visually inspect underwater structures & objects
- Each type has its own card in this list, with videos, reports and the products we use
[[service-faq:inspection]]

### Flare inspection
![Drone view of a flare stack in the desert](briefing/videos/flare-inspection.jpg)
- **External thermal and visual inspection** of flares from a safe distance
- Thermal images find temperature / heat anomalies; the zoom camera shows defects and damage on the stack
- Track record: **more than 60 flares inspected** for ADNOC Onshore (Drone Center); flare inspection for ADNOC Refining
briefing/videos/flare-inspection.mp4
- **Folder & sample report:** [FLARE INSPECTION]() · [Inspection report – Flare]()
- **Products we use:** [DJI Zenmuse H30 Series](#products/dji-zenmuse-h30-series) · [DJI M350 RTK](#products/dji-m350-rtk) · [DJI M400](#products/dji-m400)

### Overhead power line inspection
![Rust and cracks found by drone on power line insulators](briefing/videos/ohl-inspection.jpg)
- **External visual inspection** of towers, insulators and conductors from a safe distance: drones remove the need for inspectors to work at height
- Track record: **more than 400 OHL units inspected** for ADNOC Onshore (Drone Center)
briefing/videos/ohl-inspection.mp4
- **More videos:** [AheadX OHL inspection](briefing/videos/aheadx-ohl.mp4)
- **Folder & sample report:** [OVERHEADLINES]() · [Report visual inspection]()
- **Products we use:** [AheadX QP530](#products/aheadx-qp530) · [DJI Zenmuse H30 Series](#products/dji-zenmuse-h30-series) · [DJI M400](#products/dji-m400)

### Pipeline inspection & ROW mapping
![Drone footage of a leak along a pipeline](briefing/videos/pipeline-inspection.jpg)
- Visual and thermal survey of pipelines and their right of way (ROW): leaks and encroachment
- Pipeline ROW mapping: 3D mapping, topographic map, encroachment
- Pipeline automatic feature extraction from drone imagery (done for ADNOC Drilling)
- Track record: **more than 8,000 km of pipeline surveyed** for ADNOC Onshore (Drone Center)
briefing/videos/pipeline-inspection.mp4
- **More videos:** [Pipeline centreline mapping](briefing/videos/pipeline-feature-extraction.mp4)
- **Folder & sample report:** [PIPELINE INSPECTION]() · [ADNOC-DC MOL report]()
- **Products we use:** [AheadX QP530](#products/aheadx-qp530) · [Bramor C4Eye](#products/bramor-c4eye-fixed-wing) · [Custom AI applications](#products/custom-ai-applications)

### Confined space inspection
![Drone inspection inside a CO boiler](briefing/videos/internal-inspection.jpg)
- **Internal close-up visual inspection** of storage tanks, boilers, stacks (shutdown), air ducts, void spaces and caisson legs, without human entry
- Reduces exposure to toxic gases, high temperatures and other hazards, and the need for scaffolding
- Track record: internal inspection of cyclone, boiler, reactor, snubber, drying tower and absorbing tower for **ADNOC Refining**; void space and caisson leg inspection for **ADNOC Offshore**; inside EP and silo for **Lafarge Holcim**
briefing/videos/internal-inspection.mp4
- **Folder & sample reports:** [Confined Space Inspection]() · [TDID – Confined Space Inspection]() · [Report inspection]() · [Inspection report]()
- **Products we use:** [Elios 3](#products/elios-3) · [Nolvis X1](#products/nolvis-x1) · [DJI Avata (confined-space inspection)](#products/dji-avata-confined-space-inspection)

### UT thickness measurement
![Voliro T taking a UT reading on a pipe](briefing/photos/voliro-ut-test.jpg)
- **Spot UT thickness measurement** by drone on a surface: storage tank wall, roof, IPA beam, boiler wall tube
- Track record: UT measurement of caisson legs and void spaces for **ADNOC Offshore**; UT using Voliro on several pipes for **Equate (Kuwait)**
- **Products we use:** [Voliro T](#products/voliro-t) · [Elios 3](#products/elios-3) (UT payload)

### Underwater inspection
![ROV footage of a subsea structure covered in marine growth](briefing/videos/underwater-robot.jpg)
- High-resolution photo & video to visually inspect underwater structures & objects, with an underwater robot (ROV)
briefing/videos/underwater-robot.mp4
- **More videos:** [Subsea footage 2021](briefing/videos/subsea-2021.mp4) · [Subsea footage 2023](briefing/videos/subsea-2023.mp4)
- **Products we use:** [Underwater robot](#products/underwater-robot)

### Solar PV inspection
![Solar PV inspection dashboard with panel issues by type](briefing/videos/solar-pv.jpg)
- Drone thermal inspection of solar PV plants, with a dashboard of panel issues by type and relevance
briefing/videos/solar-pv.mp4
- **Folder & video:** [Renewable Energy]() · [TDID – Renewable Energy]()

## Surveillance & security
### Surveillance
![Fixed-wing surveillance drone launched in the desert](briefing/videos/c4eye.jpg)
- Real-time live-stream video for security & safety
- First response in emergencies: real-time information to the command center
- **Fixed wing** for large areas (e.g. pipelines), **multirotor** for small areas (e.g. facility, plant, complex)
- Both have a zoom surveillance camera, plus an infra-red thermal camera for night operation
briefing/videos/c4eye.mp4
- **Products we use:** [Bramor C4Eye](#products/bramor-c4eye-fixed-wing) · [AheadX QP530](#products/aheadx-qp530) · [DJI Dock 4](#products/dji-dock-4) · [Terra VMX](#products/terra-vmx) · [Terra Stream PPE](#products/terra-stream-ppe-detection)
[[service-faq:surveillance]]

### In-field patrolling
![Drone view of a wellhead half buried in sand](briefing/videos/wellhead-surveillance.jpg)
- Routine drone patrols of oil fields: wellheads, fences, flowlines and access roads, with findings reported (e.g. fence buried in sand, water in a wellhead)
- Track record: **more than 400 wellheads surveyed** and **more than 3,000 km of in-field security patrolling** for ADNOC Onshore (Drone Center)
briefing/videos/wellhead-surveillance.mp4
- **Folder & sample report:** [INFIELD PATROL]() · [BUH In-field patrol]()
- **Products we use:** [Bramor C4Eye](#products/bramor-c4eye-fixed-wing) · [DJI Dock 4](#products/dji-dock-4) · [DJI Matrice 4 Series](#products/dji-matrice-4-series)

## Gas & methane
### Methane & gas leak monitoring
![Methane survey map with gas readings](briefing/videos/methane-falcon.jpg)
- Real-time data collection and transmission: leaks are found instantly, without exposing personnel
- Comprehensive reports with geotagged data, aerial images and detailed analysis of detected leaks, for asset integrity
- Track record: methane gas detection on **BAB & Bu Hasa** fields (ADNOC Onshore); methane emission monitoring for **OGMP** in Fujairah, Das Island and Habshan field (ADNOC Gas)
briefing/videos/methane-falcon.mp4
- **Folder & sample report:** [METHANE GAS DETECTION]() · [ADNOC Onshore – BAB]()
[[service-faq:methane]]

## Survey & mapping
### Survey & mapping (photogrammetry & LiDAR)
![Textured 3D mesh of a bridge from a drone survey](briefing/videos/mapx.jpg)
- Provides a **high resolution, accurate, up-to-date map** / imagery (like Google Maps)
- Drones achieve **better resolution**: 1 cm/pixel (Google Earth is 0.5–1 m/pixel, the best satellite imagery (Quickbird) is 30 cm/pixel, airborne is 10–15 cm/pixel)
- Drones produce a **very detailed 3D model** for visualization (a very high Level of Detail / LOD) that other methods can't match
- Drones produce an **accurate topographic map** (Digital Elevation Model, contours, etc) with cm resolution & accuracy (Google Earth is 10 m/pixel with 30 m accuracy), with minimum interpolation (airborne involves a lot of interpolation)
- Good to discuss with the **survey dept / GIS dept / facility engineering dept / pipeline integrity dept / etc**
- Use cases:
  - Pipeline ROW mapping → 3D mapping, topographic map, encroachment, etc
  - Facility mapping → plan layout, topographic map, inventory, etc
  - Construction topography survey for initial design
  - Construction progress monitoring (periodic)
- Track record: high resolution and accuracy mapping and LiDAR for **ADNOC Drilling**
briefing/videos/mapx.mp4
- **Products we use:** [DJI Zenmuse L2](#products/dji-zenmuse-l2) · [Trinity Pro](#products/trinity-pro-fixed-wing-vtol) · [DJI Mavic 3 Enterprise Series](#products/dji-mavic-3-enterprise-series) · [DJI D-RTK 3](#products/dji-d-rtk-3) · [Terra MapX](#products/terra-mapx) · [Terra Progress](#products/terra-progress)
[[service-faq:survey]]

### Seismic & exploration support
![Drone LiDAR survey over a ridge](briefing/videos/zenmuse-l2.jpg)
- Exploration / seismic → reconnaissance, planning, supporting data collection, etc
- Exploration using infra-red data (NDVI, thermal, etc)
- **Sample report:** [ADNOC-SEISMIC report]()
- **Products we use:** [DJI Zenmuse L2](#products/dji-zenmuse-l2) · [Trinity Pro](#products/trinity-pro-fixed-wing-vtol)

### Agriculture & vegetation management
![Every palm tree detected and counted from a drone image](briefing/videos/palm-detection.jpg)
- Agriculture → tree counting, health assessment, estate design, etc
- Vegetation management, and spraying of fertilisers or pesticides by drone
briefing/videos/palm-detection.mp4
- **Folder & video:** [Vegetation management]() · [TDID – Vegetation Management]()
- **Products we use:** [Aviro E16 spraying drone](#products/aviro-e16-spraying-drone) · [Custom AI applications](#products/custom-ai-applications)

## Delivery & logistics
### Drone delivery
![FlyCart 30 landing on an offshore helideck](briefing/videos/flycart-offshore.jpg)
- Delivery of goods and cargo by drone: to offshore platforms, remote sites and across large fields
- Track record: **delivery of goods by drone on Bu Hasa field** (ADNOC Onshore); drone delivery and **cargo delivery using FlyCart 30** for ADNOC Offshore
briefing/videos/flycart-offshore.mp4
- **Folder & sample report:** [DELIVERY]() · [Drone Delivery Bu Hasa]() · [ADNOC-DC BUH final]()
- **Products we use:** [DJI FlyCart 30](#products/dji-flycart-30) · [DJI FlyCart 100](#products/dji-flycart-100) · [Rigitech Eiger](#products/rigitech-eiger) · [TR9S cargo drone](#products/tr9s-cargo-drone)

## Training & sales
### Drone training & consultancy
![Pilot training on the DJI Flight Simulator](briefing/videos/flight-simulator.jpg)
- Training / workshops for employees: how to operate drones and how to use them in their business
- An academy (e.g. 2–3 months) for complete knowledge of drone operations
- Consultancy to build an internal drone program: choosing the right drone, meeting compliance requirements, etc
- Track record: drone pilot training for **ADNOC personnel** (ADNOC Onshore)
- **Products we use:** [Drone flight simulator](#products/drone-flight-simulator) · [SkyOps](#products/skyops) · [Terra Organize](#products/terra-organize)
[[service-faq:training]]

### Selling drones
![DJI Dock 4 with Matrice 5TD](https://www-cdn.djiits.com/cms/uploads/6d68a59801b5acf6962b51b00080b6f9.png)
- We are an **official reseller of DJI Enterprise**
- We also sell our own fixed-wing drone technology
- Track record: drone purchasing for ADNOC Onshore (Drone Center)
- See the **DJI Enterprise** and **Drones & robots** categories in the [Product reference](#products)
[[service-faq:selling]]

## More samples
Samples: [Short videos]() · [Videos]()`,
    quiz: [
      {
        q: 'What resolution can a drone survey achieve, compared with Google Earth?',
        choices: [
          'About 1 cm/pixel vs 0.5–1 m/pixel',
          'About 30 cm/pixel vs 10 m/pixel',
          'About 10 cm/pixel vs 1 cm/pixel',
          'The same resolution, only faster',
        ],
        answer: 0,
      },
      {
        q: 'A visitor from the pipeline integrity department walks in. Which service is the natural opener?',
        choices: ['Survey & mapping (pipeline ROW mapping)', 'Drone cleaning', 'Selling DJI drones', 'Drone pilot academy'],
        answer: 0,
        explain: 'Survey & mapping suits survey, GIS, facility engineering and pipeline integrity departments.',
      },
      {
        q: 'For surveillance, which drone type do we use for large areas like pipelines?',
        choices: ['Fixed wing', 'Multirotor', 'Underwater ROV', 'Tethered drone'],
        answer: 0,
        explain: 'Fixed wing for large areas, multirotor for small areas like a facility or plant.',
      },
      {
        q: 'Which inspection type is mostly used for flares and thermal oxidizers?',
        choices: ['External thermal', 'Internal confined space', 'UT thickness', 'Underwater'],
        answer: 0,
      },
      {
        q: 'Which brand are we an official enterprise reseller of?',
        choices: ['DJI', 'Parrot', 'Skydio', 'Autel'],
        answer: 0,
      },
    ],
  },
  {
    id: 'products',
    title: 'Product reference',
    body: `Every product we offer, to answer visitor questions. Search, or pick a category, then open a product. Products marked **On the booth** are on our stand (see [Our booth](#booth)); the rest we can offer from Abu Dhabi.

[[product-catalog]]

## DJI Enterprise
### DJI Dock 4 (on the booth)
![DJI Dock 4 with Matrice 5TD](https://www-cdn.djiits.com/cms/uploads/6d68a59801b5acf6962b51b00080b6f9.png)
- DJI's newest drone-in-a-box (launched October 2026) for fully autonomous, 24/7 remote operations
- First DJI dock with **automatic battery swap** (Dock 3 needs ~30 min to recharge)
- Paired aircraft: **DJI Matrice 5TD** (M5TD)
- Wire-level obstacle sensing, with onboard AI object detection in real time
- Built for harsh sites: battery pre-heating and air-conditioning built in
- Needs the DJI O4 Ground Station (RTK base, Ethernet, edge-computing slot); 4G via DJI Cellular Dongle 2
- Managed in DJI FlightHub 2: virtual cockpit, image/text object search, real-time AI alerts by SMS / email / push
- Same mounting pattern as Dock 3, so it fits existing sites
- Ideal for oil & gas facilities, pipelines, utilities, security patrols and remote assets where sending people is slow or risky
| Specification | |
|---|---|
| Battery swap time | Under 25 s |
| Landing-to-takeoff | Under 45 s |
| Battery storage | Up to 3 batteries |
| Charging channels | 2 |
| Battery charge time | 15–95 % in 27 minutes |
| Flight time (M5TD) | Up to 59 min |
| Operating radius (M5TD) | 10 km |
| Protection (M5TD) | IP55 |
| Payload (M5TD) | 450 g (speaker, spotlight, parachute) |
| Cameras (M5TD) | Three 50 MP cameras (wide, medium tele, 252 mm tele) |
| Hybrid zoom (M5TD) | Up to 176x |
| Thermal camera (M5TD) | 1280×1024 |
| Laser rangefinder (M5TD) | 3,000 m |
| Obstacle sensing | Millimeter-wave radar + rotating LiDAR + 6-direction vision |
| Onboard AI detection | 17 object classes in real time |
| Operating temperature | −40 °C to +50 °C |
| Dock protection | IP56 |
| Landing wind resistance | Up to 12 m/s |
| Mounting pattern | 400 × 400 mm |
briefing/videos/dock4.mp4
[[product-faq:dock4]]

### DJI Dock 3
![DJI Dock 3 drone-in-a-box](briefing/videos/dock3.jpg)
- **Drone-in-a-box** for continuous remote operations: the drone takes off from and lands in the dock without a pilot on site, for infrastructure inspection, emergency response and security patrols
- First DJI dock for **vehicle-mounted deployment**: the drone can take off from and land on a moving vehicle
- Works with the **Matrice 4D** or **Matrice 4TD** drone (same cameras as the Matrice 4 Series, with better flight and protection performance); can also be flown on its own with the DJI RC Plus 2 Enterprise
- Managed remotely through **DJI FlightHub 2**
| Specification | |
|---|---|
| Dock protection | IP56 |
| Drone flight time | Up to 54 minutes |
| Max flight distance | 43 km |
| Wind resistance | 12 m/s |
| Operating temperature | -30° to 50° C |
| Camera zoom | 16x digital zoom (112x hybrid zoom) |
| Max image size | 8192×6144 |
briefing/videos/dock3.mp4
- **Brochure:** [DJI Dock 3 datasheet](briefing/brochures/dji-dock-3.pdf)

### DJI M400
![DJI Matrice 400](https://www-cdn.djiits.com/cms/uploads/3c9712c308bac3e36007c3a9ded88d9d.png)
- For powerline inspection, oil & gas surveys, mapping, emergency response and asset monitoring
- Heavy lift and all-weather: dust, drizzle and harsh environments
- LiDAR + millimeter-wave radar for 360° obstacle awareness and avoidance
- O4 Enterprise transmission with automatic frequency switching
- Hot-swappable batteries: no downtime in the field
- AI flight assistance & mission automation: route planning, repeatable inspection paths, AI object recognition
| Specification | |
|---|---|
| Flight time | Up to 59 minutes |
| Max payload | Up to 6 kg |
| Protection | IP55 |
| Video transmission | Stable HD video up to 20 km |
| Positioning | RTK, centimeter-grade |
| Operating temperature | −20 °C to +50 °C |
briefing/videos/m400.mp4
- **Brochure:** [DJI Matrice 400 datasheet](briefing/brochures/dji-m400.pdf)
[[product-faq:m400]]

### DJI M350 RTK
![DJI M350 RTK drone](briefing/videos/m350.jpg)
- **Flagship heavy-duty drone platform** for aerial inspection, survey and mapping, with multi-payload support (H20 Series, P1, L1 and other DJI payloads)
- TB65 batteries are **hot-swappable** and self-heating, which lowers the cost per flight
| Specification | |
|---|---|
| Max payload | 2700 g |
| Flight time | 55 min (without payload) |
| Area coverage | 300 ha |
| Wind resistance | 15 m/s |
| Protection | IP55 |
| Obstacle sensing | 6-directional |
| FPV camera | Night vision |
| Transmission | DJI O3 Enterprise, range 20 km |
| Battery life (TB65) | Up to 400 cycles (100% more than before) |
briefing/videos/m350.mp4
- **Brochure:** [DJI M350 RTK datasheet](briefing/brochures/dji-m350.pdf)

### DJI M300 RTK
![DJI M300 RTK drone](briefing/videos/m300.jpg)
- **Heavy-duty inspection platform** built for oil and gas and other industries: high-precision visual inspection of **flare stacks**, power lines and other critical infrastructure, plus survey and mapping
- Carries up to **three payloads at once** (H20 Series, P1, L1 and other DJI payloads)
- **Hot-swappable batteries** (change batteries without powering off)
- Its successor, the **DJI M350 RTK**, has the same payload and flight time with better protection (IP55) and longer transmission (20 km)
| Specification | |
|---|---|
| Max payload | 2.7 kg |
| Flight time | Up to 55 min (without payload) |
| Area coverage | 300 ha |
| Wind resistance | 15 m/s |
| Protection | IP45 |
| Operating temperature | -20°C to 50°C |
| Transmission | 15 km, 1080p triple-channel video |
| Obstacle sensing | 6-directional |
briefing/videos/m300.mp4
- **Brochure:** [DJI M300 RTK datasheet](briefing/brochures/dji-m300.pdf)

### DJI Matrice 30 Series
![DJI Matrice 30 Series drone](briefing/videos/m30.jpg)
- **Portable all-weather inspection drone** with wide, zoom, laser rangefinder and (on the **M30T**) thermal cameras in one unit
- **DJI Dock ready**: a dock version is available
| Specification | |
|---|---|
| Flight time | 41 min |
| Max speed | 25 m/s |
| Wind resistance | 15 m/s |
| Protection | IP55 |
| Operating temperature | -20° C to 50° C |
| Zoom camera | 5-16x optical, up to 200x hybrid |
| Wide camera | 12 MP, 4K/30fps |
| Thermal camera (M30T) | 640×512@30fps |
| Thermal accuracy (M30T) | ±2°C or ±2% |
| Laser rangefinder | 3 m - 1200 m |
| Battery recharge (dock version) | 10% to 90% in 25 minutes |
| Operating range (dock version) | 7 km |
| Operating temperature (dock version) | -35 ℃ to 50℃ |
briefing/videos/m30.mp4
- **Brochure:** [DJI Matrice 30 Series datasheet](briefing/brochures/dji-m30.pdf)

### DJI Matrice 4 Series
![DJI Matrice 4 Series drone](briefing/videos/matrice-4.jpg)
- **Compact commercial drone** for surveying, mapping, inspection and public safety; two models: **Matrice 4T** (thermal and low-light work) and **Matrice 4E** (high-precision mapping and 3D models)
- Night vision and a **laser rangefinder**
- The **DJI Dock 3** uses the dock versions of this drone (Matrice 4D / 4TD) for fully remote operation
| Specification | |
|---|---|
| Flight time | 49 min (standard propellers) |
| Max flight distance | 35 km |
| Wind resistance | 12 m/s |
| Operating temperature | -10℃ to 40℃ |
| Hybrid zoom | 112x |
| Video | 4K at 30fps on a 3-axis gimbal |
| Thermal camera (4T) | 640 x 512 px |
| Temperature measurement (4T) | -20℃ to 150℃ |
| Transmission | O4 Enterprise, range up to 25 km |
| Takeoff weight | 1219 g |
| Max payload | Up to 200 g |
briefing/videos/matrice-4.mp4
- **Brochure:** [DJI Matrice 4 Series datasheet](briefing/brochures/dji-matrice-4.pdf)

### DJI Mavic 3 Enterprise Series
![DJI Mavic 3 Enterprise drone](briefing/videos/mavic-3e.jpg)
- **Small, one-hand-carry commercial drone** for mapping, inspection, search and rescue, firefighting and night operations; models **Mavic 3E** (mapping), **Mavic 3T** (thermal) and **Mavic 3 Multispectral**
- Mavic 3E wide camera has a **mechanical shutter**: no motion blur
| Specification | |
|---|---|
| Flight time | 45 min |
| Area coverage | 200 ha / flight |
| Wind resistance | 12 m/s |
| Positioning | RTK module, centimeter-level |
| Wide camera (3E) | 4/3 CMOS, 20MP, mechanical shutter |
| Interval shooting (3E) | 0.7-second |
| Zoom camera (3E) | 12MP, up to 56x hybrid zoom |
| Thermal camera (3T) | 640 × 512 px |
| Multispectral cameras | 4 × 5 MP G/R/RE/NIR |
| Weight without batteries | 915 g (3E) / 920 g (3T) |
| Transmission | DJI O3 E |
briefing/videos/mavic-3e.mp4
- **Brochure:** [DJI Mavic 3 Enterprise Series datasheet](briefing/brochures/dji-mavic-3e.pdf)

### DJI Avata (confined-space inspection)
![DJI Avata drone](briefing/videos/avata-2.jpg)
- **DJI Avata modified by Terra Drone** (Avata INS) for **internal visual inspection in narrow, confined spaces**: tanks, ducts, pipes, boilers, where larger drones can't go
- Camera detail is enough to spot small cracks and damage
- 4-side anti-slip wheels, live-stream available; GNSS for outdoor navigation
- The videos show the standard DJI Avata 2 and Avata, which our version is built on
| Specification | |
|---|---|
| Width | 180 mm |
| Space needed to manoeuvre | 250 mm diameter |
| Take-off weight | 410 g |
| Camera | 48 MP, 1/1.7" |
| Video | Up to 4K 60 fps |
| Camera tilt | -80 to +65 deg |
| Inspection resolution | 1 mm/pixel at 0.6 m from the surface |
| Lighting | Up to 10k lumens |
| Flight time | Up to 18 minutes |
| Transmission | Up to 10 km line of sight |
| Operating temperature | -10 to 40 degC |
briefing/videos/avata-2.mp4
- **More videos:** [DJI Avata (first generation)](briefing/videos/avata.mp4)
- **Brochure:** [DJI Avata datasheet](briefing/brochures/dji-avata.pdf)

### DJI FlyCart 30
![DJI FlyCart 30](https://www-cdn.djiits.com/cms/uploads/6309da752b25bee607f0c785de57085e.png)
- Cargo delivery
| Specification | |
|---|---|
| Max payload (1 battery) | Up to 35 kg |
| Travel distance (1 battery) | 7.5 km |
| Endurance (1 battery) | 7.5 minutes |
| Max payload (2 batteries) | Up to 25 kg |
| Travel distance (2 batteries) | 15 km |
| Endurance (2 batteries) | 15 minutes |
| Max operation radius | 5 km |
briefing/videos/flycart-offshore.mp4
briefing/videos/flycart-30-official.mp4
- **More videos:** [Terra Drone FlyCart 30 demonstration](briefing/videos/flycart-30-demo.mp4) · [Offshore delivery](briefing/videos/flycart-delivery-offshore.mp4) · [Offshore delivery (long)](briefing/videos/flycart-delivery-offshore-2.mp4) · [Offshore take-off](briefing/videos/flycart-takeoff-offshore.mp4) · [Landing](briefing/videos/flycart-landing.mp4) · [Winch down](briefing/videos/flycart-winch-down.mp4) · [Winch up](briefing/videos/flycart-winch-up.mp4) · [Dubai 1](briefing/videos/flycart-dubai-1.mp4) · [Dubai 2](briefing/videos/flycart-dubai-2.mp4) · [Dubai 3](briefing/videos/flycart-dubai-3.mp4) · [Test flight](briefing/videos/flycart-test-flight.mp4) · [Introducing FlyCart 30](briefing/videos/flycart-30-intro.mp4) · [FlyCart 30 (long)](briefing/videos/flycart-30-intro-long.mp4)
- **Brochure:** [DJI FlyCart 30 datasheet](briefing/brochures/dji-flycart-30.pdf)
[[product-faq:flycart]]

### DJI FlyCart 100
![DJI FlyCart 100 heavy-lift delivery drone](briefing/videos/flycart-100.jpg)
- **Heavy-lift delivery drone** for aerial logistics: moving equipment and supplies to hard-to-reach sites such as construction sites and emergency zones
- Two delivery modes: **cargo box** or **automated winch** with automatic release
- LiDAR obstacle sensing and an **emergency parachute**
| Specification | |
|---|---|
| Max payload (1 battery) | Up to 80 kg |
| Max payload (2 batteries) | 65 kg |
| Max takeoff weight | 149.9 kg |
| Winch length | 30-meter |
| Flight range | 26 km without payload |
| Max speed | 20 m/s |
| Transmission | O4, up to 20 km |
| Protection | IP55 |
| Operating temperature | -20°C to 40°C |
briefing/videos/flycart-100.mp4
- **Brochure:** [DJI FlyCart 100 datasheet](briefing/brochures/dji-flycart-100.pdf)

## Payloads & accessories
### DJI Zenmuse H30 Series
![DJI Zenmuse H30 payload on a Matrice drone](briefing/videos/zenmuse-h30.jpg)
- **All-weather multi-sensor payload** by DJI with five modules in one: wide-angle camera, zoom camera, **infrared thermal camera**, **laser range finder** and NIR auxiliary light; for energy inspection, public safety, water conservation and forestry, day and night
- Electronic dehazing for smog or high humidity, and a night scene video mode
| Specification | |
|---|---|
| Zoom | 34x hybrid optical, up to 400x max zoom |
| Camera sensor | 1/1.8-inch CMOS, 40 MP |
| Laser range finder wavelength | 905 nm |
| Laser range finder range | 3-3000 m |
| Video | Up to 3840×2160@30fps |
| Weight | 920±5 g |
| Protection | IP54 |
| Operating temperature | -20° to 50° C |
| Supported aircraft | Matrice 350 RTK and Matrice 400 |
briefing/videos/zenmuse-h30.mp4
- **Brochure:** [DJI Zenmuse H30 Series datasheet](briefing/brochures/dji-zenmuse-h30.pdf)

### DJI Zenmuse L2
![DJI Zenmuse L2 LiDAR drone in flight](briefing/videos/zenmuse-l2.jpg)
- **LiDAR survey payload** by DJI: LiDAR, a high-precision IMU and an RGB camera in one unit, for accurate 3D mapping, terrain models (DEM) and scanning of complex structures; processed in **DJI Terra**
- Multiple returns let it see through dense vegetation; live point cloud view on site
| Specification | |
|---|---|
| Detection range | 450 m at 50% reflectivity (0 klx) |
| Detection range (low reflectivity) | 250 m at 10% reflectivity (100 klx) |
| Returns | Up to 5 |
| System accuracy | 5 cm horizontal / 4 cm vertical @150 m |
| Ranging accuracy | 2 cm @150 m |
| Point rate (single return) | 240,000 pts/s |
| Point rate (multiple returns) | 1,200,000 pts/s |
| Coverage per flight | Up to 2.5 km² |
| Mapping camera | 4/3 CMOS, 20 MP |
| Weight | 906 g |
| Protection | IP54 |
| Compatible aircraft | M300 RTK and M350 RTK |
briefing/videos/zenmuse-l2.mp4
- **Brochure:** [DJI Zenmuse L2 datasheet](briefing/brochures/dji-zenmuse-l2.pdf)

### DJI Zenmuse V1
![DJI Zenmuse V1 speaker mounted on a Matrice drone](briefing/videos/zenmuse-v1.jpg)
- **Speaker payload**, DJI's first dedicated one: broadcasts live voice, recorded messages and emergency alerts from the air, for public safety, search and rescue and crowd control
- Controlled from the **DJI Pilot 2** app: record, replay and broadcast with no extra equipment
- Tilting gimbal to aim the sound at a target area
| Specification | |
|---|---|
| Effective broadcast distance | 500 m |
| Max sound level | 127 dB @1 m |
| Nominal power | 25 W |
| Gimbal tilt (controllable) | -120° to +20° |
| Weight | 690±10 g |
| Protection | IP54 |
| Compatible aircraft | M300 RTK and M350 RTK |
briefing/videos/zenmuse-v1.mp4
- **Brochure:** [DJI Zenmuse V1 datasheet](briefing/brochures/dji-zenmuse-v1.pdf)

### DJI D-RTK 3
![DJI D-RTK 3 station set up in the field](briefing/videos/drtk3-m4t.jpg)
- **Multifunctional GNSS station** by DJI for mapping, infrastructure inspection and 3D modelling
- Three modes: **base station** (corrections for several drones at once), **relay station** (extends operating range) and **rover station** (with DJI Enterprise app and DJI Terra for survey work)
| Specification | |
|---|---|
| Positioning | Centimeter-level |
| Satellite systems | GPS, BeiDou, Galileo, GLONASS, QZSS and L-Band |
| Corrections | RTCM3 (sends and receives) |
| Protection | IP67 |
| Battery | 6500 mAh |
| Operating temperature | -20° to 55°C |
| Weight | 1.26 kg |
| Compatible aircraft | Matrice 4 Series, Mavic 3 Enterprise Series, Matrice 30 Series and Matrice 300/350 RTK |
briefing/videos/drtk3-m4t.mp4
- **Brochure:** [DJI D-RTK 3 datasheet](briefing/brochures/dji-d-rtk-3.pdf)

## Drones & robots
### Voliro T
![Voliro T with UT payload](https://cdn.voliro.com/wp-content/uploads/2025/09/Voliro-T-with-UT-payload.webp)
- For contact-based industrial inspection and NDT (Non-Destructive Testing)
- Omnidirectional multirotor drone with 6-DOF (degrees of freedom) flight control
- Can fly and keep stable contact on vertical, inclined and overhead surfaces
- Works with NDT payloads such as EMAT, UT, PEC and DFT sensors
- **Maintenance & repair too:** surface-preparation (Aeroblaster) and coating (roller) payloads for corrosion spot repair at height, without scaffolding or rope access
- **Case study, spot repair on a cement silo** (Voliro field validation): **3 corrosion patches** of about **30 × 30 cm** each on a steel silo were repaired in **under one hour**, from the ground, with **zero production downtime**; conventional repair would take **2–4 days** with scaffolding, or weeks of lead time for rope access
  - Surface prepared to **SSPC-SP 11 (≥ 25 µm profile)** with the Aeroblaster (co-developed with MontiPower), validated by an independent lab and reviewed by SGK (Swiss Society for Corrosion Protection)
  - Coated with **PPG Sigmashield 880** (2K protective coating); photos and video of every patch stored in the Voliro Cloud as a timestamped record
  - Inspection payloads (UT, PEC, DFT) on the same drone mean corrosion can be found and fixed in one visit
  - Read the case study: [Voliro: 3 spot repairs on a cement silo in under one hour](https://voliro.com/blog/drone-based-spot-repair-field-validation-3-spot-repairs-on-a-cement-silo-in-under-one-hour/)
- Optimized for GPS-denied environments (indoor, under structures, tanks, etc)
- Triple-redundant IMU for stability and safety
- Ideal for oil & gas, petrochemical, power plant and ship hull inspection
| Specification | |
|---|---|
| Endurance | Up to 15 minutes (depending on payload) |
| Max payload | Up to 1 kg |
| Contact force | Up to 30 N on a surface |
| Cameras | 4K inspector camera and 2K pilot camera |
briefing/videos/voliro-t.mp4
briefing/videos/voliro-spot-repair.mp4
briefing/videos/voliro-t-intro.mp4
- **More videos:** [The benchmark (short)](briefing/videos/voliro-benchmark.mp4) · [Event-screen compilation 2024](briefing/videos/voliro-lps-2024.mp4) · [Screen loop 2026](briefing/videos/voliro-loop-2026.mp4) · [Event-screen compilation 2023](briefing/videos/voliro-compilation-2023.mp4) · [Introducing Version 5](briefing/videos/voliro-v5.mp4) · [Version 5 (short)](briefing/videos/voliro-v5-short.mp4) · [Compilation hero](briefing/videos/voliro-hero.mp4) · [Payload swapping](briefing/videos/voliro-payload-swap.mp4) · [Short video](briefing/videos/voliro-short.mp4)
- **Photos:** [Top view](briefing/photos/voliro-t-top.jpg) · [With payload](briefing/photos/voliro-t-payload.jpg) · [UT test on a pipe](briefing/photos/voliro-ut-test.jpg)
- **Photos, spot repair:** [Surface prep 1](briefing/photos/voliro-surface-prep-1.jpg) · [Surface prep 2](briefing/photos/voliro-surface-prep-2.jpg) · [Surface prep 3](briefing/photos/voliro-surface-prep-3.jpg) · [Coating 1](briefing/photos/voliro-coating-1.jpg) · [Coating 2](briefing/photos/voliro-coating-2.jpg) · [Coating 3](briefing/photos/voliro-coating-3.jpg)
- **Photos, UT:** [Close-up](briefing/photos/voliro-ut-closeup.jpg) · [Silo](briefing/photos/voliro-ut-silo.jpg) · [Storage tank 1](briefing/photos/voliro-ut-tank-1.jpg) · [Storage tank 2](briefing/photos/voliro-ut-tank-2.jpg) · [Storage tank 3](briefing/photos/voliro-ut-tank-3.jpg) · [Stack](briefing/photos/voliro-ut-stack.jpg) · [High-temperature stack](briefing/photos/voliro-ut-hot-stack.jpg) · [Power line 1](briefing/photos/voliro-ut-powerline-1.jpg) · [Power line 2](briefing/photos/voliro-ut-powerline-2.jpg) · [Power line 3](briefing/photos/voliro-ut-powerline-3.jpg)
- **Photos, EMAT / PEC / DFT:** [EMAT smokestack 1](briefing/photos/voliro-emat-stack-1.jpg) · [EMAT smokestack 2](briefing/photos/voliro-emat-stack-2.jpg) · [EMAT smokestack 3](briefing/photos/voliro-emat-stack-3.jpg) · [EMAT kiln wall](briefing/photos/voliro-emat-kiln.jpg) · [EMAT pipe wall](briefing/photos/voliro-emat-pipe.jpg) · [PEC insulated pipe 1](briefing/photos/voliro-pec-1.jpg) · [PEC insulated pipe 2](briefing/photos/voliro-pec-2.jpg) · [PEC insulated pipe 3](briefing/photos/voliro-pec-3.jpg) · [PEC 4](briefing/photos/voliro-pec-4.jpg) · [PEC 5](briefing/photos/voliro-pec-5.jpg) · [DFT coating thickness on a power pylon](briefing/photos/voliro-dft-pylon.jpg)
- **Photos, lightning protection (LPS) tests:** [LPS 1](briefing/photos/voliro-lps-1.jpg) · [LPS 2](briefing/photos/voliro-lps-2.jpg) · [LPS 3](briefing/photos/voliro-lps-3.jpg) · [LPS 4](briefing/photos/voliro-lps-4.jpg) · [Wind turbine](briefing/photos/voliro-lps-turbine.jpg) · [Offshore wind turbine](briefing/photos/voliro-lps-turbine-offshore.jpg)
- **Photos, smart batteries:** [Batteries 1](briefing/photos/voliro-batteries-1.jpg) · [Batteries 2](briefing/photos/voliro-batteries-2.jpg) · [Batteries 3](briefing/photos/voliro-batteries-3.jpg) · [Batteries 4](briefing/photos/voliro-batteries-4.jpg)
- **Brochure:** [Voliro T datasheet](briefing/brochures/voliro-t.pdf) · [Keynote slides](briefing/brochures/voliro-t-keynote-slides.pdf#pages=5) · [Keynote](briefing/brochures/voliro-t-keynote.pdf)
[[product-faq:voliro]]

### Elios 3
![Flyability Elios 3](https://www.flyability.com/hubfs/Elios%203%20image.png)
- BVLOS (non-entry) confined space visual inspection & 3D modeling
- LiDAR sensor produces a 3D point cloud (for visualization)
- Virtual inspection in the software
| Specification | |
|---|---|
| Flight time | Around 8–12 minutes |
| Minimum manhole | 40 cm (16") |
| Minimum space to maneuver | At least 60 cm (24") |
| Accuracy | Up to 2 cm with the GeoSLAM feature |
briefing/videos/elios3.mp4
briefing/videos/elios3-ut.mp4
briefing/videos/internal-inspection.mp4
- **Photos:** [Elios 3](briefing/photos/elios3-branded.jpg) · [With UT payload](briefing/photos/elios3-ut-payload.jpg) · [Entering a manhole](briefing/photos/elios3-manhole.jpg) · [Manhole close-up](briefing/photos/elios3-manhole-close.jpg) · [Inside a tank](briefing/photos/elios3-tank.jpg) · [In a dark cavity](briefing/photos/elios3-cavity.jpg) · [Studio shot](briefing/photos/elios3-studio.jpg)
- **Brochure:** [Elios 3 datasheet](briefing/brochures/elios3.pdf) · [Elios 3 UT payload datasheet](briefing/brochures/elios3-ut.pdf)
[[product-faq:elios]]

### Nolvis X1
![Nolvis X1 indoor inspection drone](briefing/videos/nolvis-x1.jpg)
- **Indoor inspection drone** by Nolvis (Japan), for confined, dark and dusty spaces without GPS: boilers, tanks, ducts, under-deck structures
- Stable flight without GPS, using **LiDAR + visual odometry**; a protective cage (sold separately) guards the rotors and frame against impact
- **Real-time 3D point cloud** on the operator's tablet, so the pilot sees surrounding obstacles even beyond line of sight
- **4K camera** with 180° vertical tilt and strong LED lighting, for clear footage in darkness
- **Nolvis X1 Cloud**: images and video linked to the 3D point cloud, for visualization, teamwork and sharing with customers
- A **tether** to a power pack is shown in the video for longer flights without battery swaps (confirm availability with the team)
- Kit includes the drone, controller, tablet, 3 batteries and a half-day initial training (required before operation)
- Same job as the **Elios 3**: compare both for the customer's space and budget
| Specification | |
|---|---|
| LiDAR rate | 200,000 points/s |
| LiDAR range | 40 m (10 % reflectivity) to 70 m (80 %) |
| LiDAR precision | 2 cm at 10 m |
| Camera | 4K, 1/1.7-inch, 8 MP |
| Camera tilt | 180° vertical |
| LED lighting | Up to 10,480 lumens |
| Flight time | About 10 min per battery |
| Batteries | 3 in the kit, 1 h charge each |
| Weight | 1.8 kg |
| Dimensions | 36 × 31 × 21 cm |
| Max speed | 2.5 m/s |
| Wind resistance | Up to 3 m/s |
| Operating temperature | 0–45 °C |
briefing/videos/nolvis-x1.mp4
- **More videos:** [Flight demo](briefing/videos/nolvis-x1-flight-demo.mp4) · [Workflow](briefing/videos/nolvis-x1-workflow.mp4)
- **Brochure:** [Nolvis X1 datasheet](briefing/brochures/nolvis-x1.pdf)

### Nolvis M1
![Nolvis M1 industrial drone in flight](briefing/videos/nolvis-m1.jpg)
- **Field-ready industrial drone** for surveying, mapping, inspection and LiDAR missions; one aircraft, many jobs
- Quick-release payloads, swapped without tools or recalibration: **LR1 camera**, **NV1 EO/IR**, **NL1 LiDAR**
- Built-in **NTRIP, RTK and PPK**; dual RTK GNSS
| Specification | |
|---|---|
| Hover time | Up to 90 min (without payload) |
| Max payload | 2500 g (5.5 lb) |
| GNSS accuracy | 1 cm + 1 ppm (dual RTK) |
| Wind resistance | 15 m/s |
| IP rating | IP 44 |
| Max speed | 18 m/s |
| Operating temperature | -10 °C to 50 °C |
| Transmission | Up to 10 km (omnidirectional antenna) or 15 km (directional antenna) |
| Controller | 7-inch, 1,000-nit sunlight-readable |
briefing/videos/nolvis-m1.mp4
- **Brochure:** [Nolvis M1 datasheet](briefing/brochures/nolvis-m1.pdf)

### AheadX QP530
![AheadX QP530A](https://static.aheadx.com/website/pc-ssr/cn-pc/images/qp530a/QP530A.png)
- Real-time surveillance
- VTOL (vertical take-off & landing)
- EO zoom camera and IR camera for night operation
- Live stream to the command center
| Specification | |
|---|---|
| Endurance | Up to 2 hours |
| Radius | Up to 60 km |
| Straight-line distance | 60–80 km in one flight |
| EO camera zoom | 30x optical |
briefing/videos/aheadx-ohl.mp4
- **More videos:** [Showcase](briefing/videos/aheadx-showcase.mp4) · [Use case](briefing/videos/aheadx-use-case.mp4) · [Product video](briefing/videos/aheadx-qp530.mp4)
- **Brochure:** [AheadX QP530 datasheet](briefing/brochures/aheadx-qp530.pdf)
[[product-faq:aheadx]]

### Bramor C4Eye (fixed wing)
![Bramor C4Eye fixed-wing drone in the UAE desert](briefing/videos/c4eye.jpg)
- **Fixed-wing surveillance drone** (C-Astral Bramor C4Eye), for long pipelines, field patrols and large areas where multirotors run out of range
- Catapult launch, no runway needed; recovered by parachute
- Ground control station with live gimbal video (EO camera), target tracking modes and waypoint missions
- Shown here in the UAE desert, operated alongside a multirotor with zoom camera for close-up checks
- Fits the **Surveillance** offer: fixed wing for large areas, multirotor for facilities (confirm endurance and range figures with the team)
briefing/videos/c4eye.mp4
briefing/videos/bramor-launch.mp4
- **More videos:** [Showcase](briefing/videos/c4eye-showcase.mp4) · [Target tracking sample](briefing/videos/c4eye-target-tracking.mp4)
- **Brochure:** [Bramor C4Eye datasheet](briefing/brochures/bramor-c4eye.pdf)

### Trinity Pro (fixed-wing VTOL)
![Trinity Pro fixed-wing VTOL drone carried in the field](briefing/videos/trinity-pro.jpg)
- **Fixed-wing VTOL mapping drone** by Quantum Systems for large-area data collection in agriculture, forestry, mining and construction; takes off and lands vertically
- Modular payloads: **Sony RX1 RII**, **Sony UMC R10C**, **Micasense Altum PT**, **Micasense RedEdge P**, **Oblique D2M**, **Qube 240**
- Mini LiDAR checks the landing zone for obstacles
| Specification | |
|---|---|
| Flight time | Up to 90 min |
| Coverage per flight | 700 ha |
| Waypoints | Up to 300 |
| Max payload | 1000 g |
| Wind resistance | 12 m/s |
| IP rating | IP54 |
| Operating temperature | -12°C to 50°C |
| Command and control range | 5 - 7.5 km |
briefing/videos/trinity-pro.mp4
- **Brochure:** [Trinity Pro datasheet](briefing/brochures/trinity-pro.pdf)

### Rigitech Eiger
![Rigitech Eiger](https://rigi.tech/wp-content/uploads/2024/04/ER03-Closed-Canopy-EDITED_2.png)
- Long-range automated logistics & delivery (day + night, BVLOS)
- VTOL + fixed-wing transition flight
- Takes off vertically, then cruises on wings for speed & range
- Precision landing (vision + GNSS + IMU) for constrained surfaces
- Live video (front- and downward-facing cameras)
- Airspace awareness (ADS-B / FLARM / Remote ID) for regulated airspace
- Safety: ballistic parachute, redundant telemetry, failsafe logic
- Wind-resistant and quiet
- Proven use cases: medical deliveries, offshore logistics, island connectivity
| Specification | |
|---|---|
| Range | Up to 100 km one-way (≈ 54–62 miles) |
| Max payload | Up to 3 kg (≈ 6.6 lb) |
| Cargo volume | ~15 L |
| Wind resistance | ~15 m/s in fixed-wing mode |
| Noise | ~51–55 dB at 135 m |
briefing/videos/eiger.mp4
briefing/videos/eiger-offshore.mp4
- **Brochure:** [Eiger delivery drone datasheet](briefing/brochures/eiger.pdf)
[[product-faq:eiger]]

### TR9S cargo drone
![TR9S cargo drone with a delivery box](briefing/videos/tr9s.jpg)
- Multirotor **logistics drone** by Antwork (China), built on its urban delivery experience (the video cites 600,000 km of city logistics flights)
- Quick-swap batteries and interchangeable cargo boxes, including temperature-controlled boxes with full traceability
- Built for emergency response and medical deliveries, and batch delivery of larger items
- Compare with the **DJI FlyCart 30** for heavier loads (confirm with the team how we offer the TR9S before quoting it)
| Specification | |
|---|---|
| Maximum take-off weight | 24.8 kg |
| Top speed | 60 km/h |
briefing/videos/tr9s.mp4
- **Brochure:** [TR9S delivery drone datasheet](briefing/brochures/tr9s.pdf)

### Aviro E16 spraying drone
![Aviro E16 spraying drone in flight](briefing/videos/aviro-e16-usecase.jpg)
- **Precision agriculture spraying drone** for plantations: sprays fertilisers or pesticides evenly, with less water and chemical waste and up to **40 times faster** than traditional methods
- Built-in **terrain-following sensor**; obstacle avoidance available as an add-on; **RTK** (with RTK base) for centimeter-accurate waypoints
- Flight modes: manual, A-B, waypoints, KML
| Specification | |
|---|---|
| Tank | 16 liter |
| Coverage per flight | Up to 1.6 ha |
| Working time per flight | 8 - 12 minutes |
| Spraying swath | 4 to 6 meter |
| Flying height | 2 to 4 meter above the crop |
| Nozzles | 4, with adjustable flow |
| Rotors | 6 |
| Flight radius | Up to 1.5 km |
briefing/videos/aviro-e16-usecase.mp4
- **More videos:** [Spraying for bagworms](briefing/videos/aviro-e16-showcase.mp4)
- **Brochure:** [Aviro E16 datasheet](briefing/brochures/aviro-e16.pdf)

### Drones for cleaning
![Example of a cleaning drone (ABZ C10)](https://abzinnovation.com/wp-content/uploads/2026/01/C10-1.webp)
- Replaces manual high-altitude work
- High-pressure fast cleaning
- Stable high-altitude operation
- Real-time data display
- Multi-angle, multi-scenario coverage
| Specification | |
|---|---|
| Cleaning rate | 800 m²/h |
| Pressure | 20 MPa |
briefing/videos/drone-cleaning-recap.mp4
briefing/videos/drone-cleaning.mp4
briefing/videos/drone-cleaning-abz.mp4
- **More videos:** [Drone cleaning](briefing/videos/drone-cleaning-2.mp4) · [Raw footage 1](briefing/videos/drone-cleaning-raw-1.mp4) · [Raw footage 2](briefing/videos/drone-cleaning-raw-2.mp4) · [Raw footage 3](briefing/videos/drone-cleaning-raw-3.mp4) · [Raw footage 4](briefing/videos/drone-cleaning-raw-4.mp4)
- **Brochure:** [Drone cleaning datasheet](briefing/brochures/drone-cleaning.pdf)
[[product-faq:cleaning]]

## Terra AI platform
### Terra AI platform overview (on the booth)
![Terra software at a glance: MapX, VMX, Interex, SewerX, Stream PPE and Terra AI](briefing/videos/terra-software.jpg)
- Terra Drone's own software for the data side of drone operations, so customers get usable results, not just raw files
- Tap a name in the table to open its own page, with video, details and visitor FAQ
| Software | What it does |
|---|---|
| [Terra MapX](#products/terra-mapx) | Drone survey processing and reporting for mining and earthworks |
| [Terra Survey Suite](#products/terra-survey-suite) | Drone survey project management, from inquiry to report |
| [TowerSight](#products/towersight) | Drone tower inspection: every tower, payload, defect and thickness reading in one record |
| [Terra SewerX](#products/terra-sewerx) | CCTV sewer inspection, from field footage to graded report |
| [Terra VMX](#products/terra-vmx) | AI video analytics for security: drones, CCTV, bodycams and phones in one console |
| [Interex](#products/interex) | AI traffic analytics from drone or CCTV video |
| [SkyOps](#products/skyops) | Pre-flight checklists and equipment check-out / check-in |
| [Terra Organize](#products/terra-organize) | Drone fleet and operations: drones, batteries, payloads, pilots, maintenance and flight records |
| [Terra Progress](#products/terra-progress) | Site progress monitoring with aerial imagery over time |
| [Terra 360](#products/terra-360) | Adds GPS position and altitude to 360° drone video |
| [Terra Stream PPE](#products/terra-stream-ppe-detection) | Live drone video with PPE detection, alerts and reports |
| [Custom AI applications](#products/custom-ai-applications) | Detection and counting models: palm trees, pipelines, vehicles, oil spills, cracks and more |
- **Terra Organize** also covers projects and data: project dashboards, role-based team access, scheduling and progress tracking, cloud storage with auto-backup, automatic file naming and tagging, a digital checklist, and a branded client portal with secure file sharing and auto-generated progress reports
- **Terra Stream**: live streaming of drone video to the customer or a command center: up to 1080p with adaptive bitrate, sub-second latency, multi-viewer access control, share by link / email / WhatsApp, live telemetry overlay (altitude, speed, battery, GPS), automatic cloud recording
- Use cases: client presentations, emergency response, remote supervision of works, inspection QA, training
- Also: **Terra Checklist**, a digital pre-flight checklist and compliance tool with templates per mission type, digital signatures and an audit trail
briefing/videos/terra-software-reel.mp4
[[product-faq:ai]]
### Terra MapX
![Terra MapX: textured 3D mesh of a bridge](briefing/videos/mapx.jpg)
- **Terra MapX Mining Suite** ("From drone flight to signed report"), by Terra Drone Arabia: process, explore and report on drone survey data in one platform
- **Process**: upload imagery, LiDAR, GNSS observations and ground control; declare the survey and the platform checks every required file before a run (photos, camera events, aircraft and base-station GNSS)
- Ground control checked (e.g. 15 control points marked in 3 or more photographs); process in-platform with adjustable settings, or hand it to the Terra Drone back office and follow every production step (PPK, aerotriangulation, dense cloud, DEM, orthomosaic)
- **Explore**: centimetre-level orthomosaics over a satellite base map, elevation profiles (grades and angles), cut & fill against a design level (red = cut, blue = fill), point clouds and textured 3D meshes in the browser, and walk-through BIM models (tanks, pumps, pipework)
- **Report**: reports built from the data (cut & fill, stockpile volumes with materials and densities, highwall slopes, road alignments and cross sections), with checker and approver named and a revision history
- For mining, quarries, earthworks, construction and plant sites
briefing/videos/mapx.mp4
- **More videos:** [Terra MapX full walkthrough](briefing/videos/mapx-full.mp4)

### Terra Survey Suite
![Terra Survey Suite: slicing the area into mission blocks](briefing/videos/surveysuite.jpg)
- **Terra Survey Suite** ("One project. One platform. Every stage."), by Terra Drone Arabia: runs a drone survey business from first inquiry to final report
- **Sales**: every inquiry in one pipeline; import the client's area (KML, Shapefile, GeoJSON); plan ground control (grid or Voronoi) in minutes; slice the area into flight-sized mission blocks per drone and sensor
- Price the job from the real scope (personnel, equipment, permits, duration) and get a quote-ready pricing summary (contingency, markup, VAT, price per km²), exported to CSV or PDF
- **Work planning**: assign team and fleet; schedule built from the estimate (Gantt); HIRADC risk assessments with risk matrix; permits, site access and NOCs filed with the project; resource use across every project
- **Reporting**: daily logs from the field; progress tracked automatically and shown on the map; plan vs actual per task; deliverables tracked from planned to QC to ready; a live dashboard for management
briefing/videos/surveysuite.mp4

### TowerSight
![TowerSight: tower record with every payload photographed](briefing/videos/towersight.jpg)
- **TowerSight** ("Every tower. Every defect. One platform."), by Terra Drone Arabia: drone-powered tower inspection, from flight to fix
- Every tower in the region on a map, with a live register of every structure (height, status, defects, open tickets)
- A digital record per tower: every antenna, camera and light identified and photographed (payload inventory), defects with photos, severity and assignee
- Ultrasonic thickness: wall loss measured against design thickness, each reading backed by its A-scan trace and GPS position
- 3D digital twin with every finding pinned to its place, point cloud, 360° view from the top of the tower, geotagged photos by category
- Inspection history with scored pass / fail checklists; maintenance tickets prioritised and assigned; drawings, manuals and reports kept with the asset
- For telecom, security and utility towers, masts and other lattice structures
briefing/videos/towersight.mp4

### Terra SewerX
![Terra SewerX: defect gallery, every defect photographed, coded and graded](briefing/videos/sewerx.jpg)
- **Terra SewerX** ("Inspect faster. Report with confidence."), by Terra Drone Arabia: CCTV sewer inspection, from field footage to graded report
- Every CCTV survey in one workspace: progress, crews and inspected length per project
- Network map of the whole network, colour-coded by inspection status, then by condition grade
- Inspection workstation: review the footage frame by frame, capture a frame, code the defect and read the distance from the video (OCR)
- Defect gallery: every defect photographed, coded and graded; filter by severity, code or asset
- Reports generated automatically: project summary (sections, manholes, defects, worst sections), per-section report with manholes, map and equipment, pipe profile with every finding plotted, evidence photos linked to the video timestamp
- Compare inspections to prove the impact of cleaning (e.g. score 121 → 3, grade D → A)
- For municipalities, water and sewer utilities, and pipeline networks
briefing/videos/sewerx.mp4

### Terra VMX
![Terra VMX console: drones, CCTV and bodycams with AI detections, map and findings](https://vmx.terra-drone.com.sa/landing/hero-poster.webp)
- **[Terra VMX](https://vmx.terra-drone.com.sa/)** ("Every feed. One console."): real-time AI video analytics for security and public safety, by Terra Drone Arabia
- Brings drones (DJI via FlightHub 2), CCTV / NVRs (RTSP, RTMP, SRT, HLS), bodycams and field officers' phones into one live console and map
- AI watches every feed 24/7: detects and tracks people and vehicles (speed, dwell, stop time); aerial model for small, distant objects in drone video; custom ONNX (YOLO) models supported
- Draw zones (roads, gates, fences, restricted areas) on the camera view or satellite map and set rules in plain language; templates for restricted areas, crowds, loitering, speeding, no-stopping, jaywalking
- Every finding is logged with evidence: AI-annotated screenshot, time, source, operator and location; register and map view; export to CSV / GeoJSON
- On-premise on the customer's own GPU server, scales by adding GPU nodes; no inbound ports (outbound HTTPS tunnel); admin, supervisor and operator roles
- For control rooms, critical sites and perimeter security, patrols, crowd management, incident review
briefing/videos/vmx.mp4
- **More videos:** [AI lane separation detection](briefing/videos/ai-lane-separation.mp4) · [AI number-plate detection](briefing/videos/ai-plate-detection.mp4)

### Interex
![Interex console: count lines, approaches, speeds and turning movements on a drone video](https://interex.terra-drone.com.sa/static/home/media/console.jpg)
- **[Interex](https://interex.terra-drone.com.sa/)** ("Drone video in. Traffic data out."): AI traffic analytics from drone or CCTV video, by Terra Drone Arabia
- Detects, counts and tracks cars, motorcycles, buses, trucks, vans and bicycles (pedestrians optional), with models fine-tuned on aerial imagery
- Count lines by direction and class, turning movements (origin-destination matrix), per-vehicle speeds (average and 85th percentile), waiting time and indicative HCM level of service
- Filters out parked vehicles; zones with occupancy, entries and dwell time; camera placed on satellite imagery
- Live (RTSP, RTMP, HLS, SRT from drones, docks and IP cameras) or from a recorded flight; PDF reports and CSV exports (crossings, vehicles, zone visits, 15-minute counts)
- Runs on the customer's own Windows / Linux PC with an NVIDIA GPU (real time on a single RTX 4090); web console
- For traffic surveys and transport studies; on an oil & gas site: traffic at gates, plant roads and logistics yards
briefing/videos/interex.mp4
- **More videos:** [Full Interex demo (15 min)](briefing/videos/interex-demo.mp4)

### SkyOps
![SkyOps: equipment checklist recorded at check-out, item by item](briefing/videos/skyops.jpg)
- **SkyOps**, by Terra Drone: web platform for pre-flight checklists and equipment check-out / check-in before drone operations
- Project set-up: project code, type, location on a map, objective and deliverables, then assign the crew (pilot, co-pilot, observer, trainer)
- Stores personnel and equipment data (drones, GPS, payloads, laptops, batteries, PPE and other tools), so pilots just pick from a list
- Checklist for every item at check-out and check-in (status and notes), handover details with photo evidence, exported as a PDF
- Project list shows each job's checklist status; a map shows where projects are and which crew has which equipment, so supervisors can follow fieldwork
briefing/videos/skyops.mp4

### Terra 360
![Terra 360: 360° drone footage with time, latitude, longitude and altitude on every frame](briefing/videos/terra-360.jpg)
- **Terra 360**, by Terra Drone: web app that adds location data (coordinates and elevation) to Insta360 camera videos
- Insta360 cameras do not record GPS; Terra 360 fills that gap using the drone's flight log
- Workflow: the 360° camera flies on the drone; after landing, upload the 360° footage and the flight log
- The app matches the drone's GPS and altitude to each video frame; output video shows time, latitude, longitude and altitude
- Batch mode: process several videos at once and set a time offset per video to line them up
briefing/videos/terra-360.mp4

### Terra Progress
![Terra Progress: comparison slider between two site photos taken on different dates](briefing/videos/terra-progress.jpg)
- **Terra Progress**, by Terra Drone: web platform that monitors project development with aerial imagery, a visual record of the site over time
- Map of all projects; inside each project, geotagged photo locations, 360° panorama locations and data layers (GeoJSON) on satellite imagery
- Timeline by month: step through dates to see how the site changed
- Change detection: compare two dates side by side with a slider, and add annotations to photos
- Helps with audits, reporting and data-driven decisions
briefing/videos/terra-progress.mp4

### Terra Organize
![Terra Organize: fleet dashboard with drones, pilots, projects per month and drone usage](briefing/videos/terra-organize.jpg)
- **Terra Organize** ("Drone Fleet & Operation Management"), by Terra Drone: one platform for drone assets, pilots and operations
- Dashboard: total drones, active projects and pilots, projects per month, monthly drone usage, top pilot flight hours, drones under maintenance
- Pilots and training: pilot profiles with licence and expiry date, training and certification types, training status per person
- Registries for drone models, individual drones (with flight hours and documents), batteries and payloads
- Maintenance and incidents: pilots report an incident on a drone, it goes into maintenance and is tracked in the incidents log
- Flight records: log each flight (date, project, crew, location, weather, flight time, battery), or bulk upload from a CSV template
briefing/videos/terra-organize.mp4

### Terra Stream (PPE detection)
![Terra Stream: live drone feed with helmet, vest and coverall detected on each worker](briefing/videos/terra-stream-ppe.jpg)
- **Terra Stream PPE**, by Terra Drone: web platform that runs live detection on drone video streams (RTMP) to check PPE on site
- Detects helmets, safety vests and coveralls on workers, and flags missing items (e.g. "no-helmet", "no-vest")
- Pop-up alerts in real time when a watched item is detected (e.g. NO-HELMET), with live counts of frames and detections
- Downloadable PDF reports for documentation and further analysis
- Detection models can be customised to the client's needs; everything runs in one web platform from any device
briefing/videos/terra-stream-ppe.mp4

### Custom AI applications
![Terra Drone AI: every palm tree detected, boxed and counted from a drone image](briefing/videos/terra-ai.jpg)
- **Terra Drone AI**, by Terra Drone: web platform for machine-learning detection; upload an image or video, the platform finds and counts objects
- Ready models shown: palm oil trees and fruits, vehicles, pipelines, boxes, oil spills, people (ground and aerial), powerlines, insulator defects, PPE, cracks
- Example on a palm plantation: every tree marked with a box and a confidence score, total count, results table, and manual correction for higher accuracy
- Users can upload or train their own models for other industries and use cases; no installation, all in the browser
- Also shown: a QGIS plugin that counts oil palm trees with a quality-control step, and pipeline centreline mapping from drone orthophotos (results as a map layer for GIS)
briefing/videos/terra-ai.mp4
- **More videos:** [Palm tree counting in QGIS](briefing/videos/palm-detection.mp4) · [Pipeline centreline mapping](briefing/videos/pipeline-feature-extraction.mp4)

## Airspace management
### Unifly UTM
![Unifly UTM: drones and manned aviation sharing the city airspace](briefing/videos/unifly.jpg)
- **Unmanned Traffic Management (UTM)** platform by Unifly (Belgium), part of the Terra Drone group
- Drone operators plan, track and validate their drones and flights in line with international and local regulation
- Reliable data from worldwide sources: weather, NOTAMs, obstacles and no-fly zones, plus hyper-local aeronautical data
- Real-time, two-way communication with operators and drones; proximity and collision alerts, including with manned aviation
- Connects air navigation service providers (ANSPs) and authorities with drone operators, using SWIM, the aviation standard for data exchange
- For authorities, airports and large operators that run many drones at once (e.g. a drone center with BVLOS flights)
briefing/videos/unifly-utm.mp4
- **Brochure:** [Unifly UTM platform](briefing/brochures/unifly-utm.pdf)

## Inspection & NDT
### Digital RT (digital radiography) (on the booth)
![Portable digital radiography at a refinery](briefing/videos/digital-rt.jpg)
- Radiography with a **Digital Detector Array** (flat panel) or computed radiography plates instead of film: the image is on the laptop in seconds, with no chemical processing
- **In service**: no shutdown, no draining and no insulation removal; standardised in ISO 20769-2
- Much shorter exposure times than film for the same source (Ir-192, Co-60 or a portable X-ray tube): lower dose, smaller exclusion zones, more shots per shift
- **Profile (tangential) radiography** images the pipe wall edge to measure remaining wall thickness, pitting and internal / external corrosion through insulation and cladding
- **CUI screening**: finds corrosion under insulation, wet insulation and cladding damage on insulated lines and pipe racks
- Real-time radiography and motorised crawlers carry the detector along long pipe runs for fast go / no-go screening (see ART crawler services below)
- Software measurement (wall thickness, density profiles), contrast enhancement and a permanent digital archive with full traceability, so campaigns can be compared
- Also used for weld quality, flow-accelerated corrosion, erosion, blockages, valves and small-bore fittings
- Still a radiation method: controlled areas and licensed radiographers apply
briefing/videos/digital-rt.mp4
[[product-faq:digital-rt]]

### IRIS (Internal Rotary Inspection System) (on the booth)
![IRIS probes and centering devices](https://www.eddyfi.com/doc/ProductImages/STP_IRIS_CD_800x645-01.png)
- Ultrasonic inspection of tubes **from the inside**: a probe with a rotating mirror, driven by water flow, scans the full circumference as it is pulled through the tube
- Measures the remaining wall thickness and finds corrosion, erosion, pitting and other wall loss on both the inner and the outer surface
- For tubes in heat exchangers, boilers and air coolers (fin-fans), ferrous and non-ferrous
- Tubes must be cleaned and filled with water first
- Very accurate sizing: often used together with faster screening methods (eddy current, RFET) to confirm and size what they find
- Benefit: wall-thickness data for every tube, so the customer plugs or replaces only the tubes that need it and plans shutdowns with confidence
briefing/videos/iris.mp4
[[product-faq:iris]]

### ART crawler services
![ART crawler on an insulated pipe](https://www.mistrasgroup.com/media/noqm4ukp/masthead-art-crawler.png)
- Digital radiography to screen for internal corrosion and corrosion under insulation (CUI) in insulated & uninsulated above-ground piping and pipelines, **even with product flowing**
- Internal corrosion crawler: through-wall technique
- CUI crawler: tangential OD radiography
- 360° crawler: tangential OD radiography
- Rapid large-scale screening
- Lines stay in service
- Permanent digital image archive
| Specification | |
|---|---|
| Pipe size, internal corrosion crawler | 4–48" |
| Pipe size, CUI crawler | 2–48" |
| Pipe size, 360° crawler | 12–60" |
briefing/videos/art-crawler.mp4
[[product-faq:art]]

### LiDAR & visual inspection robot (pipe crawler)
![Example of a pipe inspection crawler](https://envirosight.com/wp-content/uploads/2021/07/laser_main-2-scaled.jpg)
- LiDAR gives the robot mapping and navigation (Light Detection and Ranging: **a remote sensing method** that measures distances with pulsed laser light)
- Clear 2D & 3D profile mapping
- Auto-analysis software to identify flaws
- Flaw measurement / location detection
- Dimensional measurement
- Clear, accurate cross-sectional view
| Specification | |
|---|---|
| Travel distance | Up to 1,000 m |
| Minimum pipe diameter | 12 inch |
briefing/videos/pipe-crawler.mp4
[[product-faq:crawler]]

### Underwater robot
![QYSEA FIFISH V6 Expert underwater robot](https://store.qysea.com/cdn/shop/files/fifish-v6-expert.png)
- Carries visual inspection and NDT tools to analyze material / equipment deterioration
- 6 vector thrusters™: 6-DoF omnidirectional maneuverability
- Depth rating covers 95 % of underwater work
- Dual cameras for a larger field of view
- High-capacity, swappable lithium battery
- Standard laser scaler for underwater measurement
- Robotic arm to collect samples or lost items
- Q-BOX underwater connector hub for a customized robotic arm with NDT tools. Accessories include 2D imaging sonar, Station Lock™, U-QPS, 360° scanning sonar, compass ruler clamp, OPSS (on-shore power supply), mud sampler, water sampler (500 mL), salinity, pH and dissolved oxygen sensors, hydrophone, etc
| Specification | |
|---|---|
| Speed | 3 knots (1.5 m/s) |
| Depth rating | 350 m (over 1,100 ft) |
| Camera | 4K UHD |
| Field of view | Up to 166° (one camera alone) |
| Laser scaler | 10 cm (standard) |
| Robotic arm lift | 10 kg |
| Q-BOX connector hub | 6 ports |
briefing/videos/underwater-robot.mp4
briefing/videos/fifish-w6.mp4
briefing/videos/fifish-v6-expert.mp4
- **More videos:** [Subsea footage 2021](briefing/videos/subsea-2021.mp4) · [Subsea footage 2023](briefing/videos/subsea-2023.mp4) · [Robot inspection in a crude oil tank (2021)](briefing/videos/tank-robot-inspection.mp4) · [Robot tank cleaning, 1.5 m sludge (2021)](briefing/videos/tank-robot-cleaning.mp4) · [FIFISH PRO W6 official ad](briefing/videos/fifish-w6-ad.mp4) · [FIFISH PRO W6 (short)](briefing/videos/fifish-w6-short.mp4)
- **Photos:** [FIFISH PRO W6](briefing/photos/fifish-w6-branded.jpg) · [Front view](briefing/photos/fifish-w6-front.jpg) · [Side view](briefing/photos/fifish-w6-side.jpg) · [With robotic arm](briefing/photos/fifish-w6-arm.jpg) · [Deployed from a boat](briefing/photos/fifish-w6-boat.jpg) · [Payloads and accessories](briefing/photos/fifish-w6-payloads.jpg) · [Key features](briefing/photos/fifish-w6-features.jpg)
- **Brochure:** [FIFISH W6 datasheet](briefing/brochures/fifish-w6.pdf)
[[product-faq:rov]]

### NDTCCS Solutions Centre
![NDTCCS Solutions Centre: ground-penetrating radar demo](briefing/videos/ndtccs-centre.jpg)
- NDTCCS's demo centre, where customers see the inspection technology working before a project
- **Ground-penetrating radar** (GPR) cart with display unit, and a sandbox with buried targets to show how GPR finds them
- **Tube inspection** on a heat-exchanger tube-bundle mock-up, with handheld instruments and flaw detectors
- Internal **camera inspection** of pipes and vessels
- **Underwater ROV** in a test tank, driven from a tablet controller
- Offer a visit to the centre as a next step after ADIPEC (confirm the location and how to book with NDTCCS)
briefing/videos/ndtccs-centre.mp4

## Equipment protection
### VALSEM (on the booth)
![ValStrong-protected equipment crate](https://www.valsem.com/_img/uf2boiHKRGIuVb50gE8kPdjiQIc=/844_x_475/filters:quality(95):strip_exif()/reboot/media/922c517a-414f-11e8-a99b-fa163e14ea56/b202d782-251a-11ec-8348-0242ac130004/1-1-572669612.jpg)
- VALSEM Industries (France, since 1977) protects critical equipment during transport and storage, and keeps proof of its condition over time
- **ValStrong** membranes (e.g. ValStrong TITAN, VCX anti-corrosion film) shield equipment from corrosion, humidity and damage, crated or crate-less
- **EXA-AIR**: inflatable anti-shock bags and sheets that cushion equipment inside its packaging
- **ValTRACK**: embedded sensors record the conditions the equipment is exposed to, as a continuous, traceable record for audits and commissioning
- Standards: NF H00 310, MIL-PRF-131K, DEF STAN 82-75/2, DIN 55 531, PMUC (nuclear); ~980 industrial customers in energy, nuclear, aerospace and infrastructure
- **NDTCCS is VALSEM's strategic partner in the GCC**: talk to the team at the VALSEM counter
- Benefit for the customer: equipment arrives, and stays, in the condition it left the factory, with data to prove it: less corrosion damage in storage and fewer surprises at commissioning
briefing/videos/valsem-corporate.mp4
briefing/videos/valsem-titan.mp4
[[product-faq:valsem]]

## Training
### Drone flight simulator (on the booth)
![Pilot training on the DJI Flight Simulator](briefing/videos/flight-simulator.jpg)
- Part of our **drone training & consultancy** offer: visitors can try flying at the booth
- Builds stick skills, procedures and muscle memory with zero risk to aircraft, payloads, people or property
- Uses the pilot's real DJI remote controller via USB, so the control response matches the real aircraft; DJI's physics engine reproduces each model's flight behaviour
- Training modules: skills training (take-off, landing, path following, tests), free flight, and application training such as powerline inspection and search & rescue
- Same flight modes as real flight (P, A, S); simulated wind, ground effect and crash physics can be switched on
- Emergency drills: loss of GNSS, return-to-home, low battery, ATTI-mode recovery; night and bad-weather conditions
- Repeatable scoring to assess trainees, and lower training cost and insurance exposure before real flight hours and licence practical tests (e.g. GCAA)
briefing/videos/flight-simulator.mp4
[[product-faq:simulator]]

## Folders, brochures and videos
| Product | On booth | Folder | Brochure | Video |
|---|---|---|---|---|
| [VALSEM](https://www.valsem.com/) | Yes | [Folder]() | [Brochure]() | [Video]() |
| [DJI Dock 4](https://enterprise.dji.com/dock-4) | Yes | [Folder]() | [Brochure]() | [Video]() |
| Digital RT | Yes | [Folder]() | [Brochure]() | [Video]() |
| [IRIS](https://eddyfi.com/en/technology/internal-rotary-inspection-system-iris) | Yes | [Folder]() | [Brochure]() | [Video]() |
| [AI solutions](https://terra-drone.co.id/software/) | Yes | [Folder]() | [Brochure]() | [Video]() |
| [Drone flight simulator](https://www.dji.com/simulator) | Yes | [Folder]() | [Brochure]() | [Video]() |
| [Voliro T](https://voliro.com/voliro-solution/) | | [Folder]() | [Brochure](briefing/brochures/voliro-t.pdf) | [Video]() |
| [Rigitech Eiger](https://rigi.tech/eiger/) | | [Folder]() | [Brochure](briefing/brochures/eiger.pdf) | [Video]() |
| [DJI M400](https://enterprise.dji.com/matrice-400) | | [Folder]() | [Brochure](briefing/brochures/dji-m400.pdf) | [Video]() |
| Drones for cleaning | | [Folder]() | [Brochure](briefing/brochures/drone-cleaning.pdf) | [Video]() |
| [AheadX QP530](https://www.aheadx.com/product/qp530a) | | [AheadX]() | [AheadX – QP530.pdf](briefing/brochures/aheadx-qp530.pdf) | [Showcase]() · [Use case: powerline inspection]() |
| [Elios 3](https://www.flyability.com/elios-3) | | [Elios 3 – UT]() | [Elios 3 UT Payload.pdf](briefing/brochures/elios3-ut.pdf) | [Elios 3 – Digitizing the industry]() |
| [DJI FlyCart 30](https://www.dji.com/flycart-30) | | [DJI FlyCart 30]() | [DJI FlyCart 30.pdf](briefing/brochures/dji-flycart-30.pdf) | [Introducing DJI FlyCart 30]() · [Use case: shore-based last mile delivery]() |`,
    quiz: [
      {
        q: "What does VALSEM protect, and when?",
        choices: ["Critical equipment during transport and storage", "Pipelines during welding", "Drones during flight", "Tanks during cleaning"],
        answer: 0,
        explain: "ValStrong membranes and EXA-AIR anti-shock packaging protect equipment in transit and storage; ValTRACK sensors keep proof of its condition.",
      },
      {
        q: "What is new about the DJI Dock 4 compared with Dock 3?",
        choices: ["It swaps the battery automatically in under 25 seconds", "It is half the size", "It flies a fixed-wing drone", "It does not need a ground station"],
        answer: 0,
        explain: "Dock 4 swaps batteries instead of recharging: landing to takeoff in under 45 s, versus about 30 minutes on Dock 3.",
      },
      {
        q: "Which drone does the DJI Dock 4 fly?",
        choices: ["DJI Matrice 5TD", "DJI Matrice 4TD", "DJI M400", "DJI Avata 2"],
        answer: 0,
      },
      {
        q: "What is the big advantage of digital RT for in-service piping?",
        choices: ["No shutdown, no draining and no insulation removal", "It works without any radiation", "It replaces ultrasonic testing completely", "It only works on empty pipes"],
        answer: 0,
      },
      {
        q: "What does IRIS measure, and what must be done to the tubes first?",
        choices: ["Remaining wall thickness; tubes must be cleaned and filled with water", "Surface hardness; tubes must be dried", "Flow rate; tubes must be pressurised", "Paint thickness; tubes must be removed"],
        answer: 0,
      },
      {
        q: "Which Terra Drone software streams live drone video to a client or command center?",
        choices: ["Terra Stream", "Terra Organize", "Terra Checklist", "Terra MapX"],
        answer: 0,
        explain: "Terra Stream: live video with telemetry overlay. Terra Organize manages projects and data, Terra MapX processes mapping data.",
      },
      {
        q: "How much contact force can the Voliro T apply to a surface?",
        choices: ["Up to 5 N", "Up to 30 N", "Up to 300 N", "It does not touch surfaces"],
        answer: 1,
      },
      {
        q: "Which NDT payloads does the Voliro T work with?",
        choices: ["EMAT, UT, PEC and DFT", "Only visual cameras", "Radiography only", "Sonar and hydrophone"],
        answer: 0,
      },
      {
        q: "What is the DJI M400’s maximum flight time?",
        choices: ["Up to 15 minutes", "Up to 30 minutes", "Up to 59 minutes", "Up to 2 hours"],
        answer: 2,
      },
      {
        q: "What can the DJI FlyCart 30 carry on one battery?",
        choices: ["Up to 3 kg for 100 km", "Up to 35 kg for 7.5 km", "Up to 6 kg for 20 km", "Up to 80 kg for 1 km"],
        answer: 1,
      },
      {
        q: "How far can the Rigitech Eiger fly one way?",
        choices: ["5 km", "20 km", "Up to 100 km", "500 km"],
        answer: 2,
      },
      {
        q: "What makes ART crawler services special?",
        choices: ["They screen pipes for corrosion with product still flowing", "They need the line to be shut down and drained", "They only work underwater", "They inspect flares from the air"],
        answer: 0,
      },
      {
        q: "How deep can the underwater robot go?",
        choices: ["35 m", "100 m", "350 m", "3,500 m"],
        answer: 2,
      },
    ],
  },
  {
    id: 'visitors',
    title: "At the booth: talking to visitors",
    body: `### What visitors need to know
- We have a team in the UAE ready to be deployed.
- All pilots are licensed & all drones are registered with GCAA and CICPA.
- We are familiar with the authorization process (MOIAT, GCAA / DCAA, MOD, CICPA, etc).
- Specifically for ADNOC, we obtained the blanket permit.

> **We have all the required compliance to provide drone services in the UAE.**

### How to handle any visitor
Every visitor should leave with **a concrete next step**, and we should leave with **their contact and their need written down**. Use the visitor check below while you talk, or right after: it tells you how much time to give them and what to agree on before they walk away.

[[visitor-check]]

#### The 5 steps with every visitor
1. **Greet**: smile, introduce your name and job title, give your business card.
2. **Qualify**: who are they, what is their problem, what is their role, when could it happen? (The four questions of the visitor check.)
3. **Show**: one relevant thing only: a demo on the booth, a video, or the same job we did for another customer (see [Drone work experience](#experience)).
4. **Agree a next step**: a date for a follow-up meeting, an on-site POC, the demo day, or at least an email next week. Never end with just "thank you".
5. **Log**: scan their badge, write the need and the next step on the back of their card or in VisitConnect (use *Copy lead note*). Tell the team lead about hot leads the same day.

#### Priority at a glance
| Priority | Who | How long | Next step to agree |
|---|---|---|---|
| **Hot** | Buyer with a specific project, decision role and a near timeline | As long as it takes; meeting table, bring a director | Follow-up meeting within 2 weeks (date), or on-site POC |
| **Warm** | Interested buyer, or technical person, or next-year timeline | 10–15 min with a demo | Follow-up meeting after ADIPEC, or demo day + brochure |
| **Cold** | Just looking, no project, no role in the decision | A few minutes | Badge scan, demo day invitation |
| **Partner** | Supplier, maker, distributor | Short; get the right contact | Meeting with our BD lead after ADIPEC |
| **Official** | Government, regulator, authority | Important: compliance message, director if senior | Demo day; director follows up |
| **Competitor** | Drone / inspection / NDT service company | Short and polite | None: no prices, no customer details |

> **Golden rule:** if you can't say what happens next and when, the conversation is not finished.

### Example conversation
#### Visitor: "Tell me who you are."
- Introduce your name & job title
- Give your business card
- Briefly introduce the company (see [Who we are](#who))

#### Visitor: "What do you do?"
- "We offer drone solutions, including survey & mapping, inspection, surveillance, agriculture services, training & consultancy, and many more. Which one are you interested in?"
- Based on their answer, see [What do we offer?](#offer)

#### Visitor: "What is this?" (about a drone)
- Depends on the drone: see [Our booth](#booth) and the [Product reference](#products)

#### Visitor: "Can you do ___?" (a specific requirement)
- **If we have done it:** explain our experience: how we did it, what outputs the customer received, what benefit they got (see [Work experience](#experience))
- **If it is something new:** "We can always look for, or even develop, a tailored solution based on your needs. If you don't mind, we can discuss it further after ADIPEC."

#### Visitor: "OK, thank you."
- Ask for their business card (if not given yet), scan their QR code, or at least ask their name
- Ask for a follow-up:
  - **If a meeting was discussed:** "I will reach out to you to schedule a follow-up meeting. When would suit you? Does 2 weeks after ADIPEC sound good?"
  - **If a POC / trial was discussed:** "I will send you an email to confirm our interest in providing a POC. We will need some information to plan it. Is it okay to send it next week, after ADIPEC?"
  - Offer an invitation to the demo day in Abu Dhabi at the end of this month

### What to do every day
- Scan visitors' QR badges (VisitConnect app)
- Always give our business card
- Always ask for their business card (if they don't have one, scan their QR)
- Give souvenirs only to important visitors. **Tumblers only from director(s)**
- Always ask for a follow-up:
  - If ADNOC: we have a contract with ADNOC Onshore and soon will have a framework agreement
  - Offer a follow-up meeting in 2 weeks
  - Invite them to the demo day in Abu Dhabi at the end of the month
  - Offer an on-site trial / POC
- Full photos and documentation: Adi
- Social media post every day: Adi (during the event, daily summary, after the event)`,
    quiz: [
      {
        q: 'Where are all our drones registered?',
        choices: ['GCAA and CICPA', 'FAA and EASA', 'Only with ADNOC', 'Nowhere, it is not required'],
        answer: 0,
      },
      {
        q: 'What special permit do we hold for ADNOC work?',
        choices: ['A blanket permit', 'A one-time event permit', 'A tourist permit', 'None'],
        answer: 0,
      },
      {
        q: 'What is the one key message about compliance?',
        choices: [
          'We have all the required compliance to provide drone services in the UAE',
          'We are still applying for licenses',
          'Customers must get the permits themselves',
          'We only fly outside the UAE',
        ],
        answer: 0,
      },
      {
        q: "An ADNOC Onshore integrity manager has a flare inspection coming up in 3 months. What do you do before they leave?",
        choices: ["Agree a follow-up meeting within 2 weeks (with a date) or an on-site POC", "Give a brochure and say we will be in touch", "Scan their badge only", "Ask them to email our office"],
        answer: 0,
        explain: "Hot lead: specific project, decision role, near timeline. Agree a dated next step at the meeting table, with a director.",
      },
      {
        q: "What must every visitor conversation end with?",
        choices: ["A concrete next step, and their need written down", "A souvenir", "A photo for social media", "A price quote"],
        answer: 0,
      },
      {
        q: "A competitor asks about our team size and current ADNOC projects. What do you do?",
        choices: ["Stay polite, keep it general, share nothing beyond public information, and tell the team lead", "Answer everything, it is good publicity", "Ask them to leave the booth", "Give them our price list"],
        answer: 0,
      },
      {
        q: "A drone maker wants to become our supplier, but the person is a sales engineer. What is the next step?",
        choices: ["Get the name and email of their BD or partnership contact", "Sign a distribution agreement at the booth", "Promise exclusivity in the UAE", "Ignore them, we only want customers"],
        answer: 0,
      },
      {
        q: "Where do you log the visitor's need and next step?",
        choices: ["VisitConnect (or the back of their business card), using the lead note", "Nowhere, we will remember", "The ADIPEC Wi-Fi", "On the booth whiteboard"],
        answer: 0,
      },
      {
        q: 'A visitor asks for something we have never done. What do you say?',
        choices: [
          'We can look for or develop a tailored solution, and discuss it after ADIPEC',
          'Sorry, we can’t do that',
          'Yes, we do it all the time',
          'Ask them to email the head office',
        ],
        answer: 0,
      },
      {
        q: 'If a POC was discussed, what is the follow-up?',
        choices: [
          'An email next week, after ADIPEC, confirming our interest and asking for details',
          'Start the POC the same day',
          'Wait for them to call us',
          'Send a quotation immediately',
        ],
        answer: 0,
      },
      {
        q: 'Who may give out the tumblers?',
        choices: ['Only the director(s)', 'Anyone on the booth', 'Only Adi', 'Al Masaood staff'],
        answer: 0,
      },
      {
        q: 'A visitor has no business card. What do you do?',
        choices: ['Scan their QR badge', 'Let them go', 'Ask them to come back tomorrow', 'Give them a souvenir instead'],
        answer: 0,
      },
      {
        q: 'Which follow-up do we offer by default?',
        choices: ['A follow-up meeting in 2 weeks', 'A call in 6 months', 'A quotation on the spot', 'Nothing until they contact us'],
        answer: 0,
      },
      {
        q: 'Who handles photos, documentation and the daily social media posts?',
        choices: ['Adi', 'The director', 'Al Masaood', 'Each person posts their own'],
        answer: 0,
      },
    ],
  },
  {
    id: 'visit',
    title: "Who to visit at ADIPEC",
    body: `Who to go and see when you are not needed at the booth. Agree in the morning who covers which hall, take notes in VisitConnect, and invite good contacts to our meeting table.

**Our stand: 4210, Hall 4** (Al Masaood Energy pavilion, with NDTCCS as co-exhibitor). Terra Drone Corporation (Japan HQ) is also in the **Japan Pavilion, 10710, Hall 10**, next to Liberaware (confined-space drones), Synspective (SAR satellites), JGC and HORIBA.

> Where things are: operators and NOCs in the **Atrium and Hall 6**; inspection and NDT companies in **Halls 1, 3, 4, 8 and 9**; subsea and marine robotics in **Hall 15**; AI and robotics partners in **Hall AI**.

### Find any exhibitor
[[exhibitor-finder]]

### A. Operators, NOCs and EPCs that buy inspection and drone services
| Company | Stand | Hall | Country | Why visit |
|---|---|---|---|---|
| [ADNOC](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3283) | **A210** | Atrium | UAE | Host NOC; also at AI M6 (Hall AI) and 16401 (Hall 16, Young ADIPEC). Primary target for drone inspection / methane / robotics frameworks. |
| [XRG](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3287) | **A110** | Atrium | UAE | ADNOC's international gas/chemicals investment arm; owner of overseas assets needing integrity services. |
| [Borouge International](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3707) | **5352** | Hall 5 | UAE | ADNOC/Borealis petrochemicals (Ruwais); Platinum sponsor; plant inspection, tank/flare/stack inspection buyer. |
| [Mubadala Energy](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4038) | **A130** | Atrium | UAE | Abu Dhabi upstream operator (SE Asia, Egypt, UAE); shares A130 with Dolphin Energy. |
| [Dolphin Energy](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2337) | **A130** | Atrium | UAE | Operator of the Qatar-UAE-Oman gas pipeline and Taweelah plant; pipeline ROW survey, methane and corrosion inspection buyer. |
| [Sharjah National Oil Corporation (SNOC)](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2638) | **CN47** | Concourse | UAE | Sharjah NOC (Sajaa gas, storage); Bronze sponsor; GCC operator with onshore fields and gas storage. |
| [Dragon Oil](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2342) | **4345** | Hall 4 | UAE | Dubai-government upstream operator (Caspian, Egypt, Iraq); offshore platform inspection buyer. |
| [Occidental of Abu Dhabi (Oxy)](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2539) | **A120** | Atrium | UAE | Shah sour gas / Al Hosn partner with ADNOC; onshore asset integrity and methane programmes. |
| [TotalEnergies](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2696) | **A232** | Atrium | UAE | ADNOC concession partner; strong drone methane (AUSEA) and robotics agenda; also AI P28 in Hall AI. |
| [Shell](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2639) | **A230** | Atrium | UAE | ADNOC gas/LNG partner; global robotics & inspection technology buyer. |
| [bp Exploration](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2296) | **A20** | Atrium | UAE | ADNOC Onshore/LNG partner; Platinum sponsor. |
| [ExxonMobil (Al Khalij)](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2385) | **A142** | Atrium | UAE | Upper Zakum partner; Platinum sponsor. |
| [Eni](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2364) | **A300** | Atrium | Italy | ADNOC offshore concession partner. |
| [INPEX Corporation](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2448) | **6230** | Hall 6 | Japan | Japan's largest E&P, ADNOC offshore partner; natural Japanese-pavilion-to-operator bridge for Terra Drone. |
| [Chevron MEASA E&P](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3142) | **13410** | Hall 13 | USA | Partner-level sponsor; regional E&P with Platinum meeting suite. |
| [Bapco Energies](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2287) | **6110** | Hall 6 | Bahrain | Bahrain national energy company (refinery, Awali field, gas); GCC operator with Gold meeting suite. |
| [CNOOC Iraq](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2320) | **9434** | Hall 9 | Iraq | Missan oilfields operator; Iraq onshore inspection and surveillance demand. |
| [CNPC International (Dubai)](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3708) | **A10** | Atrium | UAE | ADNOC onshore/offshore concession partner; also BGP (seismic/survey) at 4210. |
| [EOG Resources](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2369) | **12715** | Hall 12 | UAE | US shale operator with new Abu Dhabi unconventional concession; LDAR/methane-driven culture. |
| [NMDC Group](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2532) | **6130** | Hall 6 | UAE | ADNOC-linked offshore EPC/marine contractor (ex-NPCC); buys survey, subsea inspection and construction monitoring. |
| [Petrofac](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2564) | **12640** | Hall 12 | UAE | Major GCC EPC/O&M contractor; subcontracts inspection and progress-survey drones. |
| [Saipem](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3251) | **6234** | Hall 6 | Italy | Offshore/onshore EPC with ADNOC (Hail & Ghasha); subsea robotics programme (Hydrone). |
| [TechnipFMC](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3168) | **4420** | Hall 4 | UAE | EPC/subsea; shares 4420 with Fugro. |
| [Samsung E&A](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2623) | **9420** | Hall 9 | South Korea | Platinum-sponsor EPC; exhibits an 'RX (Robotics Transformation) Monitoring Center' - explicit construction-robotics interest. |
| [Tecnicas Reunidas](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2685) | **4256** | Hall 4 | Spain | EPC for ADNOC Refining/Borouge projects. |
| [Worley](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2841) | **5240** | Hall 5 | UAE | Engineering/PMC house for ADNOC; digital asset and integrity consulting (shared stand 5240 with Linde, Descon, TAQANA, GruppOmega). |
| [Wood](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2739) | **6350** | Hall 6 | UK | Engineering/asset-integrity consultancy for GCC operators; also AI P33. |
| [KBR](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3525) | **7254** | Hall 7 | USA | PMC/EPC for ADNOC programmes. |
| [Kent](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2795) | **8230** | Hall 8 | UAE | Abu Dhabi EPC/O&M contractor; Kent International Arabia (AI P9) pitches digital twins and autonomous systems. |
| [Chiyoda Corporation](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2317) | **16455** | Hall 16 | UAE | Japanese EPC offering O&M via plantOS predictive maintenance; data-capture partner candidate. |
| [JGC Corporation](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4086) | **10710** | Hall 10 | Japan | Japanese EPC in the same Japan Pavilion as Terra Drone - easy introduction. |
| [AD Ports Group](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3296) | **A405** | Atrium | UAE | Platinum sponsor; ports/maritime asset owner (drone survey, hydrographic, surveillance). |
| [Department of Energy Abu Dhabi](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3820) | **A305** | Atrium | UAE | Regulator; relevant for methane/emissions reporting and drone-operations policy. |

Also exhibiting (no description yet on the ADIPEC site): SLB 4330 Hall 4, Halliburton 5250 Hall 5, Weatherford 4340 Hall 4, NESR 5350 Hall 5, Petronas 6322 Hall 6, Sinopec 8210 Hall 8, NNPC A400 Atrium, KNOC 8320 Hall 8, PTTEP 5220 Hall 5.

### B. Competitors and peers: drones, robotics, inspection, NDT, asset integrity
Know what they show, what they charge and who they talk to.

| Company | Stand | Hall | Country | Why visit |
|---|---|---|---|---|
| [NDT Corrosion Control Services (NDTCCS)](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3578) | **4210** | Hall 4 | UAE | Our partner: advanced NDT, drone inspection, underwater robotic inspection. Co-exhibitor at 4210 with BGP/CNPC, Cosasco, EGA Master. |
| [Sigma Enterprises (Mazrui)](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3923) | **1130** | Hall 1 | UAE | Closest local competitor: core segments 'Robotics, Drones & Spatial Intelligence / NDT / Geomatics'; 45+ represented brands. Sister co. Sigma Specialized Inspection (NDT services) and Evident/Olympus also at 1130. |
| [Velosi Asset Integrity](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2717) | **16560** | Hall 16 | UAE | Asset integrity, inspection and digital solutions; second stand 11044 (Hall 11). |
| [TRE Energies](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2697) | **15104** | Hall 15 | UAE | UAE energy services incl. NDT, integrity and surveillance. |
| [Aries Oil Field Services](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2276) | **240** | Hall 2 | UAE | Claims to be the largest Engineering, Inspection & Maintenance firm in the Middle East. |
| [Acumen International](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2214) | **16192** | Hall 16 | UAE | Third-party inspection, testing & certification (lifting, MRT, NDT). |
| [Sap & Kaps Petroleum Services](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2624) | **810** | Hall 8 | UAE | Tank and pipeline integrity solutions. |
| [Bureau Veritas](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3379) | **9330** | Hall 9 | UAE | TIC major with drone/ROV inspection lines; Bronze sponsor. |
| [DNV](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3405) | **9150** | Hall 9 | UAE | Integrity/assurance; certification of drone & robotic inspection methods. |
| [TUV Rheinland Middle East](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3034) | **8856** | Hall 8 | UAE | Testing, inspection and certification; NDT and asset integrity. |
| [SGS](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2820) | **8250** | Hall 8 | UAE | TIC major; inspection services. |
| [RINA](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3249) | **1313** | Hall 1 | Italy | Inspection, certification and engineering for energy. |
| [Baker Hughes](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2286) | **3432** | Hall 3 | UAE | Owner of Waygate Technologies (NDT, robotic/UT inspection) and Avitas; Gold meeting suite. |
| [Rosenxt - IDS](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2615) | **16531** | Hall 16 | Germany | ROSEN group NDT systems; 'autonomous robotics, physical AI' - also Rosenxt Group at AI P27. |
| [EMPIT](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2972) | **13484** | Hall 13 | Germany | Current Magnetometry Inspection of buried/unpiggable pipelines with AI 3D mapping. |
| [EVIDENT Europe (Olympus)](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3767) | **3115** | Hall 3 | Czech Republic | NDT instruments (UT, PAUT, videoscopes); also at 1130 via Sigma. |
| [DURR NDT](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2968) | **13471** | Hall 13 | Germany | Digital radiography systems for NDT. |
| [Dakota NDT](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2330) | **CN6** | Concourse | UK | Ultrasonic thickness gauges / UT equipment. |
| [T-ALL Inspection Group](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3702) | **12827** | Hall 12 | China | Chinese inspection group entering GCC. |
| [Mena3D](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3007) | **8735** | Hall 8 | Germany | 3D scanning, surveying, UAV, GIS, BIM for asset digitisation - direct survey/mapping peer. |
| [Geosoft Surtech International](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2675) | **12702** | Hall 12 | UAE | UAE survey firm: terrestrial/marine/aerial capture into digital twins. |
| [Fugro](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3160) | **4420** | Hall 4 | UAE | Geo-data, survey, ROV/USV and asset inspection major (shares 4420 with TechnipFMC). |
| [Dulam International](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4034) | **15009** | Hall 15 | UAE | Subsea integrity, hydrographic and ROV surveys. |
| [IKM Subsea Middle East](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2442) | **15315** | Hall 15 | UAE | Independent ROV & subsea operator. |
| [Sealien Robotics](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3697) | **15132** | Hall 15 | China | Subsea intelligent robots / ROVs. |
| [QYSEA Technology](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2640) | **15005** | Hall 15 | China | Underwater ROV platforms with AI software (FIFISH). |
| [OceanAlpha Group](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2747) | **15348** | Hall 15 | China | Unmanned surface vessels for survey. |
| [Frogmen Technologies](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2395) | **15432** | Hall 15 | UAE | Sole GCC distributor for CHASING ROVs. |
| [DeepOcean](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3948) | **AI S2** | Hall AI | Norway | Ocean survey/IMR services, AI strategic partner; resident-ROV/USV competitor offshore. |
| [Liberaware](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4088) | **10710** | Hall 10 | Japan | Japanese indoor/confined-space inspection drone maker (IBIS) in the same Japan Pavilion as Terra Drone. |
| [KT Photonics](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2858) | **3257** | Hall 3 | Canada | OGI/thermal detector cores for UAV gas-leak detection - competitor sensor supplier and potential payload partner. |
| [SENSIA Solutions](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2632) | **AI P2** | Hall AI | Spain | AI-powered optical gas imaging (handheld & continuous) - methane monitoring peer. |
| [Fluenta](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3408) | **9152** | Hall 9 | Norway | Ultrasonic flare gas measurement - emissions quantification peer. |
| [LiveEO](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2484) | **AI P26** | Hall AI | Germany | Satellite-based infrastructure monitoring (pipeline ROW, encroachment) - alternative to drone surveillance. |
| [Detect Technologies](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3620) | **AI P21** | Hall AI | India | Industrial AI for safety/reliability (computer vision on site cameras & drones). |
| [ALTAVE](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3358) | **16305** | Hall 16 | Brazil | AI monitoring (aerostat/camera) for O&G sites - surveillance peer. |
| [ANTEA](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3626) | **1160** | Hall 1 | UAE | RBI / asset integrity management software with digital twin (Italian pavilion stand 1160). |
| [Cenosco](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2311) | **16556** | Hall 16 | Netherlands | Asset integrity management software (IMS) - data destination for inspection results. |

### C. Potential partners and suppliers
| Company | Stand | Hall | Country | Why visit |
|---|---|---|---|---|
| [Unitree](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4220) | **AI P11** | Hall AI | China | Quadruped/humanoid robot maker - ground-robot platform supplier for plant inspection. |
| [HappyRobot](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4065) | **AI S6** | Hall AI | Spain | Robotics/AI startup in the AI zone (shared S6 with Microsoft, Celonis, IFS, KPMG). |
| [Sinaha Technology](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4056) | **AI P15** | Hall AI | UAE | UAE AI-agent and robotics orchestration/automation integrator. |
| [AIQ](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3164) | **AIQ Co-Host** | Hall AI | UAE | ADNOC x G42 AI joint venture, co-host of Hall AI; gatekeeper for AI/computer-vision deployments at ADNOC. |
| [Honeywell](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2436) | **AI S10** | Hall AI | UAE | AI strategic partner and Gold sponsor (main stand 4150, Hall 4); gas detection, Forge APM, integration partner. |
| [Siemens](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2648) | **12616** | Hall 12 | UAE | Industrial AI, digital twin; also AI P5; Siemens Energy at 3550. |
| [Emerson](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3508) | **7351** | Hall 7 | UAE | Automation/instrumentation; wireless corrosion & gas sensing, AspenTech software. |
| [Yokogawa UAE](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2744) | **12710** | Hall 12 | UAE | Japanese automation major with ADNOC footprint; drone/robot data integration into plant systems. |
| [AVEVA](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3155) | **4410** | Hall 4 | UAE | Industrial software / digital twin (also AI P30) - integration target for inspection data. |
| [Cognite](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2322) | **12540** | Hall 12 | Norway | Industrial DataOps (Cognite Data Fusion), used by Aker BP for robotics data; also AI P14. |
| [SUPCON](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3952) | **AI S9** | Hall AI | Singapore/China | Industrial automation + robotics, AI strategic partner. |
| [Microsoft](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3950) | **AI S6** | Hall AI | UAE | AI strategic partner; Azure/AI stack for inspection analytics. |
| [Nvidia](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4242) | **(sponsor, no stand listed)** | Sponsor | USA | Edge AI compute (Jetson) for drones/robots; AI Innovators sponsor. |
| [Etisalat (e&)](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4238) | **(sponsor, no stand listed)** | Sponsor | UAE | AI strategic partner; private 5G / BVLOS connectivity for UAE sites. |
| [Speedcast Telecommunications](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3151) | **15302** | Hall 15 | UAE | Satcom/critical comms for remote and offshore drone ops. |
| [IEC Telecom](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3387) | **9253** | Hall 9 | UAE | Satellite communication operator (remote-site connectivity). |
| [IS-Wireless](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3945) | **15130** | Hall 15 | Poland | Private 5G (Liquid RAN) for critical infrastructure. |
| [Al Wafa Technical Systems Services](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2242) | **CN4** | Concourse | UAE | UAE telecom/satellite/security & ELV integrator for O&G since 1992 - channel for surveillance drones. |
| [Fortis Telecommunication Equipment Trading](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2394) | **12943** | Hall 12 | UAE | Abu Dhabi distributor of Moxa, Westermo, RealWear industrial networking. |
| [Hanwei Electronics Group](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3732) | **12747** | Hall 12 | China | Gas sensors / methane detection hardware; digital twin cloud. |
| [HORIBA Middle East](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4085) | **10710** | Hall 10 | Japan | Gas analyzers / emission measurement (Japan Pavilion neighbour). |
| [Synspective](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4090) | **10710** | Hall 10 | Japan | SAR satellite data (ground deformation, pipeline/facility monitoring) - complements drone survey; Japan Pavilion neighbour. |
| [Exail](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2380) | **15007** | Hall 15 | France | Inertial navigation, robotics, maritime and photonics - INS/payload supplier. |
| [Three Lions Trading Company](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2691) | **16718** | Hall 16 | Bahrain | Bahrain APM/IoT integrator reselling drones & robotics - potential GCC channel partner. |
| [United Synergy Companies Representation](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4036) | **6270** | Hall 6 | UAE | UAE exclusive agent for engineering manufacturers (robotics, NDT) - distribution partner candidate. |
| [Kent International Arabia](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=3949) | **AI P9** | Hall AI | UAE | Digital twins, industrial AI, autonomous systems consulting. |
| [Shape Digital](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=4183) | **AI P8** | Hall AI | Brazil | Industrial AI decision platforms for asset-heavy industries. |
| [New York University Abu Dhabi](https://www.adipec.com/exhibition/exhibitordetails?exhibitorid=2527) | **12910** | Hall 12 | UAE | AI & robotics research; local R&D / talent partner. |

### Not exhibiting under their own name
Aramco, QatarEnergy, KOC, PDO, OQ, ENOC, TAQA, EDGE / ADASI, Bayanat / Space42, DJI, Flyability, Skydio, Percepto, Gecko Robotics, ANYbotics, Voliro, Cyberhawk, Applus+, Intertek, Oceaneering, Mistras, Eddyfi, Aerodyne. ADNOC Onshore / Offshore / Gas / Drilling have no separate stands: meet them at the ADNOC stand (A210, Atrium).

Source: the ADIPEC exhibitor list on adipec.com, 1,927 exhibitors as of 20 October 2026. Stands can still change: check the [ADIPEC exhibitor list](https://www.adipec.com/exhibition/exhibitor-list/) or the app on the day.`,
    quiz: [
      {
        q: "Where is our booth at ADIPEC 2026?",
        choices: ["Stand 4210, Hall 4 (Al Masaood Energy pavilion)", "Stand 10710, Hall 10 (Japan Pavilion)", "A210, Atrium", "Hall AI"],
        answer: 0,
        explain: "4210 in Hall 4 is the Al Masaood Energy pavilion. Terra Drone Corporation (Japan) is also in the Japan Pavilion at 10710, Hall 10.",
      },
      {
        q: "Where do you find ADNOC and most of the operators?",
        choices: ["Atrium (ADNOC at A210) and Hall 6", "Hall 15", "Hall AI", "Concourse"],
        answer: 0,
      },
      {
        q: "Which hall has the subsea and marine robotics companies (QYSEA, IKM, OceanAlpha)?",
        choices: ["Hall 15", "Hall 1", "Hall 10", "Atrium"],
        answer: 0,
      },
      {
        q: "Which local company is our closest competitor on drones, NDT and geomatics?",
        choices: ["Sigma Enterprises (Mazrui), Hall 1", "Bureau Veritas, Hall 9", "Unitree, Hall AI", "Fugro, Hall 4"],
        answer: 0,
      },
    ],
  },
  {
    id: 'tips',
    title: 'Other tips',
    body: `- Download the app: **VisitConnect**
- Use a tablet or iPad to quickly show videos, photos or documents. Or at least a laptop
- Put a tablet on each piece of equipment to loop videos
- Invite key customers to the meeting table
- **Always take notes** of your conversation with a visitor. Most important: write down their inquiry or request, on the back of their business card or in the app's notes
- Show real equipment in action:
  - Voliro → take some measurements on the calibration block
  - DJI Dock 4 → open and close the dock, show the battery swap
  - Bring the DJI Avata
- The internet connection is poor there, even on the ADIPEC Wi-Fi: **download videos and files to your device beforehand**`,
    quiz: [
      {
        q: 'Why should videos and documents be saved on your tablet before the show?',
        choices: ['The internet at ADNEC is poor, even on ADIPEC Wi-Fi', 'Streaming is not allowed', 'Files are too big for email', 'Visitors can’t see the screen'],
        answer: 0,
      },
      {
        q: 'How do we demonstrate the Voliro live?',
        choices: ['Measure on the calibration block', 'Fly it over the visitors', 'Show a video only', 'Open and close it'],
        answer: 0,
      },
      {
        q: 'What is the single most important thing to write down after a conversation?',
        choices: ['Their inquiry or request', 'Their favorite drone', 'The time of day', 'How long they stayed'],
        answer: 0,
      },
    ],
  },
]

/** Default sections, spaced by 10 so new ones can go in between. */
export const DEFAULT_BRIEFING: BriefingSection[] = SEED.map((s, i) => ({
  id: s.id,
  pos: (i + 1) * 10,
  kind: s.kind ?? 'text',
  title: s.title,
  body: s.body,
  images: [],
  quiz: s.quiz ?? [],
  room: null,
}))
