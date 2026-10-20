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
https://youtu.be/suRPKB9GTec`,
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
    title: 'Who are we?',
    body: `We are **Terra Drone x NDTCCS**, a partnership between Terra Drone Indonesia & NDT Corrosion Control Services UAE to serve the market in the UAE, especially Abu Dhabi.

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
- **Key customers:** Aramco, SABIC, ADNOC, Nawah, etc`,
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
    ],
  },
  {
    id: 'al-masaood',
    title: 'Why are we in the Al Masaood pavilion?',
    body: `Terra Drone & NDTCCS have been working closely with Al Masaood **as their strategic partner** in securing some major contracts with ADNOC:

1. Drone center contract with ADNOC Onshore
2. Framework agreement with ADNOC Group`,
    quiz: [
      {
        q: 'Which ADNOC contract did we secure together with Al Masaood?',
        choices: ['Drone center contract with ADNOC Onshore', 'Offshore helicopter services', 'Pipeline construction', 'Refinery maintenance staffing'],
        answer: 0,
      },
    ],
  },
  {
    id: 'why-adipec',
    title: 'Why are we at ADIPEC?',
    body: `We want to **showcase drone solutions** and their benefits for the oil & gas industry.

We want to **introduce the drones that are currently available in Abu Dhabi**, and the solutions that we can offer to customers.`,
  },
  {
    id: 'booth',
    kind: 'booth',
    title: 'Our booth & what we showcase',
    body: `Open the live 3D design to walk through the booth before the show. The numbered items below come straight from that design, so this list always matches what is on the stand.

To change an item's description, photos or FAQ, edit its **Info card** in the 3D design (select it, then *Info card* in the Selected tab). Upload the booth render below with *Edit*.`,
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
    body: `### Survey & mapping (photogrammetry & LiDAR survey)
- Provides a **high resolution, accurate, up-to-date map** / imagery (like Google Maps)
- Drones achieve **better resolution**: 1 cm/pixel (Google Earth is 0.5–1 m/pixel, the best satellite imagery (Quickbird) is 30 cm/pixel, airborne is 10–15 cm/pixel)
- Drones produce a **very detailed 3D model** for visualization (a very high Level of Detail / LOD) that other methods can't match
- Drones produce an **accurate topographic map** (Digital Elevation Model, contours, etc) with cm resolution & accuracy (Google Earth is 10 m/pixel with 30 m accuracy), with minimum interpolation (airborne involves a lot of interpolation to increase resolution & accuracy)
- Good to discuss with the **survey dept / GIS dept / facility engineering dept / pipeline integrity dept / etc**
- Use cases:
  - Pipeline ROW mapping → 3D mapping, topographic map, encroachment, etc
  - Facility mapping → plan layout, topographic map, inventory, etc
  - Construction topography survey for initial design
  - Construction progress monitoring (periodic)
  - Exploration / seismic → reconnaissance, planning, supporting data collection, etc
  - Exploration using infra-red data (NDVI, thermal, etc)
  - Agriculture → tree counting, health assessment, estate design, etc

### Inspection
- **External visual**
  - Detailed high-resolution images from an ultra-zoom camera to visually inspect & identify defects / damage on structures from a safe distance
  - Mostly for vertical structures (OHL, comm towers, bridges, underdecks, overhanging pipes, etc). Drones remove the need for human inspectors to work at height
  - Drones cover large areas in a fraction of the time of a manual inspection, and greatly reduce the need for scaffolding, ladders, cranes or other expensive access equipment
- **External thermal**
  - Thermal images from an infra-red camera to find temperature / heat anomalies
  - Mostly for objects that deal with heat (flares, thermal oxidizers, etc)
- **Internal (confined space) close-up visual**
  - Detailed high-resolution images of internal surfaces in confined spaces (storage tanks, boilers, stacks (shutdown), air ducts, void spaces, caisson legs, etc) without human entry, reducing exposure to toxic gases, high temperatures or structural instability
- **UT thickness measurement**
  - Spot UT thickness measurement of a surface (storage tank wall, roof, IPA beam, boiler wall tube)
- **Underwater inspection**
  - High-resolution photo & video to visually inspect underwater structures & objects

### Surveillance
- Real-time live-stream video for security & safety
- First response in emergencies: real-time information to the command center
- **Fixed wing** for large areas (e.g. pipelines), **multirotor** for small areas (e.g. facility, plant, complex)
- Both have a zoom surveillance camera, plus an infra-red thermal camera for night operation

### Gas leak & methane monitoring
- Real-time data collection and transmission: leaks are found instantly, without exposing personnel
- Comprehensive reports with geotagged data, aerial images and detailed analysis of detected leaks, for asset integrity

### Drone training & consultancy
- Training / workshops for employees: how to operate drones and how to use them in their business
- An academy (e.g. 2–3 months) for complete knowledge of drone operations
- Consultancy to build an internal drone program: choosing the right drone, meeting compliance requirements, etc

### Selling drones
- We are an **official reseller of DJI Enterprise**
- We also sell our own fixed-wing drone technology

### Service materials
| Service | Folder | Video | Sample data |
|---|---|---|---|
| Flare inspection | [FLARE INSPECTION]() | [Flare Inspection.mp4]() | [Inspection report – Flare]() |
| Overhead power lines inspection | [OVERHEADLINES]() | [OHL Inspection.mp4]() · [AheadX OHL.mp4]() | [Report visual inspection]() |
| Pipeline inspection | [PIPELINE INSPECTION]() | [Pipeline Inspection.mp4]() | [ADNOC-DC MOL report]() |
| In-field patrolling | [INFIELD PATROL]() | [Wellhead Surveillance.mp4]() | [BUH In-field patrol]() |
| Confined space | [Confined Space Inspection]() | [TDID – Confined Space Inspection]() | [Report inspection]() · [Inspection report]() |
| Methane gas detection | [METHANE GAS DETECTION]() | [Falcon Methane Gas Detection]() | [ADNOC Onshore – BAB]() |
| Drone delivery | [DELIVERY]() | [Drone Delivery Bu Hasa]() | [ADNOC-DC BUH final]() |
| Seismic | | | [ADNOC-SEISMIC report]() |
| Renewable energy | [Renewable Energy]() | [TDID – Renewable Energy]() | |
| Vegetation management | [Vegetation management]() | [TDID – Vegetation Management]() | |

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
    body: `Specs of the products we can offer, to answer visitor questions. Not all of them are on the booth: see [Our booth & what we showcase](#booth) for what's on the stand.

| Product | Folder | Brochure | Video |
|---|---|---|---|
| [Voliro T](https://voliro.com/voliro-solution/) | [Folder]() | [Brochure]() | [Video]() |
| [Rigitech Eiger](https://rigi.tech/eiger/) | [Folder]() | [Brochure]() | [Video]() |
| [DJI M400](https://enterprise.dji.com/matrice-400) | [Folder]() | [Brochure]() | [Video]() |
| Drones for cleaning | [Folder]() | [Brochure]() | [Video]() |
| [DJI Dock 3](https://enterprise.dji.com/dock-3) | [Folder]() | [Brochure]() | [Video]() |
| [AheadX QP530](https://www.aheadx.com/product/qp530a) | [AheadX]() | [AheadX – QP530.pdf]() | [Showcase]() · [Use case: powerline inspection]() |
| [Aviro E16](https://terra-droneagri.com/shop/terra-agri-e16-spraying-drone/) | [Aviro]() | [Brochure Aviro E16.pdf]() | [Showcase: Terra Agri E16 spraying]() · [Use case: E16 spraying demo]() |
| [Elios 3](https://www.flyability.com/elios-3) | [Elios 3 – UT]() | [Elios 3 UT Payload.pdf]() | [Elios 3 – Digitizing the industry]() |
| [DJI FlyCart 30](https://www.dji.com/flycart-30) | [DJI FlyCart 30]() | [DJI FlyCart 30.pdf]() | [Introducing DJI FlyCart 30]() · [Use case: shore-based last mile delivery]() |

### Voliro T
![Voliro T with UT payload](https://cdn.voliro.com/wp-content/uploads/2025/09/Voliro-T-with-UT-payload.webp)
- For contact-based industrial inspection and NDT (Non-Destructive Testing)
- Omnidirectional multirotor drone with 6-DOF (degrees of freedom) flight control
- Can fly and keep stable contact on vertical, inclined and overhead surfaces
- Up to 15 minutes endurance (depending on payload)
- Supports payloads up to 1 kg
- Can apply up to 30 N contact force on a surface
- 4K inspector camera and 2K pilot camera
- Works with NDT payloads such as EMAT, UT, PEC and DFT sensors
- Optimized for GPS-denied environments (indoor, under structures, tanks, etc)
- Triple-redundant IMU for stability and safety
- Ideal for oil & gas, petrochemical, power plant and ship hull inspection
https://youtu.be/Q29N_pTc6kA

### Rigitech Eiger
![Rigitech Eiger](https://rigi.tech/wp-content/uploads/2024/04/ER03-Closed-Canopy-EDITED_2.png)
- Long-range automated logistics & delivery (day + night, BVLOS)
- VTOL + fixed-wing transition flight
- Up to 100 km one-way range (≈ 54–62 miles)
- Payload up to 3 kg (≈ 6.6 lb), ~15 L cargo volume
- Takes off vertically, then cruises on wings for speed & range
- Precision landing (vision + GNSS + IMU) for constrained surfaces
- Live video (front- and downward-facing cameras)
- Airspace awareness (ADS-B / FLARM / Remote ID) for regulated airspace
- Safety: ballistic parachute, redundant telemetry, failsafe logic
- Wind-resistant (~15 m/s in fixed-wing mode) and quiet (~51–55 dB at 135 m)
- Proven use cases: medical deliveries, offshore logistics, island connectivity
https://youtu.be/oHd-QIXVNoc

### DJI M400
![DJI Matrice 400](https://www-cdn.djiits.com/cms/uploads/3c9712c308bac3e36007c3a9ded88d9d.png)
- For powerline inspection, oil & gas surveys, mapping, emergency response and asset monitoring
- Up to 59 minutes flight time
- Heavy lift: up to 6 kg payload
- All-weather (IP55): dust, drizzle and harsh environments
- LiDAR + millimeter-wave radar for 360° obstacle awareness and avoidance
- O4 Enterprise transmission: stable HD video up to 20 km, automatic frequency switching
- Hot-swappable batteries: no downtime in the field
- RTK: centimeter-grade positioning
- AI flight assistance & mission automation: route planning, repeatable inspection paths, AI object recognition
- Operates from −20 °C to +50 °C
https://youtu.be/3UrKq7xj7TI

### Drones for cleaning
![Example of a cleaning drone (ABZ C10)](https://abzinnovation.com/wp-content/uploads/2026/01/C10-1.webp)
- Replaces manual high-altitude work
- High-pressure fast cleaning: 800 m²/h, 20 MPa
- Stable high-altitude operation
- Real-time data display
- Multi-angle, multi-scenario coverage
https://youtu.be/WnYeOUIdnoI

### DJI Dock 3
![DJI Dock 3](https://www-cdn.djiits.com/cms/uploads/596a276ec8d8577111cfa9bc19f147dd.png)
- Fully autonomous, 24/7 remote drone operations (static or mobile)
- Vehicle-mounted or fixed deployment
- Built for harsh conditions: −30 °C to +50 °C, IP56 dock
- Paired with DJI Matrice 4D / 4TD drones: IP55, anti-ice propellers, extended flight time
- Fast charging: ~15 % to 95 % in about 27 minutes
- Dual-dock setup alternates drones for continuous operation
- Cloud management (DJI FlightHub 2): remote mission scheduling, health monitoring, data transfer & analytics
- Connectivity: Ethernet, optional 4G/5G dongle, remote-site ready
- Open ecosystem: third-party payloads, custom integration via PSDK / E-Port
- Ideal for utilities (power, oil & gas), infrastructure (bridges, roads), public safety, remote assets where manned access is difficult or risky
https://youtu.be/OwUwgpqgcMA

### AheadX QP530
![AheadX QP530A](https://static.aheadx.com/website/pc-ssr/cn-pc/images/qp530a/QP530A.png)
- Real-time surveillance
- VTOL (vertical take-off & landing)
- Up to 2 hours endurance
- Up to 60 km radius; 60–80 km straight line in one flight
- 30x optical EO zoom camera and IR camera for night operation
- Live stream to the command center
https://youtu.be/r3k7v1WPDMk

### Aviro E16 (Terra Agri E16)
![Terra Agri E16 spraying drone](https://terra-droneagri.com/wp-content/uploads/2025/06/Frame-4-1024x1024.png)
- Terra Drone's own agricultural spraying drone (Aviro / Terra Agri)
- For crop spraying and plantation work (e.g. palm oil, bagworm control)
- More: [terra-droneagri.com](https://terra-droneagri.com/shop/terra-agri-e16-spraying-drone/)
https://youtu.be/1dSnaJsqZks

### Elios 3
![Flyability Elios 3](https://www.flyability.com/hubfs/Elios%203%20image.png)
- BVLOS (non-entry) confined space visual inspection & 3D modeling
- Around 8–12 minutes flight time
- Needs a 40 cm (16") manhole
- Needs at least 60 cm (24") space to maneuver
- LiDAR sensor produces a 3D point cloud (for visualization)
- Up to 2 cm accuracy with the GeoSLAM feature
- Virtual inspection in the software
https://youtu.be/B5s-69mQTSc

### Avata INS
![DJI Avata 2](https://www-cdn.djiits.com/cms/uploads/ac5a1e8f3668952185dbaba1c36ae2e3.png)
- Narrow confined space inspection, internal & external
- Around 15 minutes flight time
- 48 MP camera with oblique lighting
- Similar to Elios, but no thermal camera and no LiDAR
- Fits through a 20 cm (8") space
https://youtu.be/RNhmV4yCP6M

### DJI FlyCart 30
![DJI FlyCart 30](https://www-cdn.djiits.com/cms/uploads/6309da752b25bee607f0c785de57085e.png)
- Cargo delivery
- 1 battery: up to 35 kg payload, 7.5 km travel distance, 7.5 minutes endurance
- 2 batteries: up to 25 kg payload, 15 km travel distance, 15 minutes endurance
- Maximum operation radius 5 km
https://youtu.be/Hhp11I-vGHA

### Underwater robot
![QYSEA FIFISH V6 Expert underwater robot](https://store.qysea.com/cdn/shop/files/fifish-v6-expert.png)
- Carries visual inspection and NDT tools to analyze material / equipment deterioration
- 6 vector thrusters™: 6-DoF omnidirectional maneuverability at 3 knots (1.5 m/s)
- 350 m (over 1,100 ft) depth rating covers 95 % of underwater work
- Dual cameras for a larger field of view; one camera alone sees up to 166°
- 4K UHD camera
- High-capacity, swappable lithium battery
- Standard 10 cm laser scaler for underwater measurement
- Robotic arm lifts 10 kg to collect samples or lost items
- Q-BOX underwater connector hub with 6 ports for a customized robotic arm with NDT tools. Accessories include 2D imaging sonar, Station Lock™, U-QPS, 360° scanning sonar, compass ruler clamp, OPSS (on-shore power supply), mud sampler, water sampler (500 mL), salinity, pH and dissolved oxygen sensors, hydrophone, etc
https://youtu.be/k3rUdNZaBg4

### LiDAR & visual inspection robot (pipe crawler)
![Example of a pipe inspection crawler](https://envirosight.com/wp-content/uploads/2021/07/laser_main-2-scaled.jpg)
- LiDAR gives the robot mapping and navigation (Light Detection and Ranging: **a remote sensing method** that measures distances with pulsed laser light)
- Travels up to 1,000 m
- Pipes of at least 12 inch diameter
- Clear 2D & 3D profile mapping
- Auto-analysis software to identify flaws
- Flaw measurement / location detection
- Dimensional measurement
- Clear, accurate cross-sectional view
https://youtu.be/9HBf8kSVeos

### ART crawler services
![ART crawler on an insulated pipe](https://www.mistrasgroup.com/media/noqm4ukp/masthead-art-crawler.png)
- Digital radiography to screen for internal corrosion and corrosion under insulation (CUI) in insulated & uninsulated above-ground piping and pipelines, **even with product flowing**
- Internal corrosion crawler: through-wall technique, pipes 4–48"
- CUI crawler: tangential OD radiography, pipes 2–48"
- 360° crawler: tangential OD radiography, pipes 12–60"
- Rapid large-scale screening
- Lines stay in service
- Permanent digital image archive
https://youtu.be/JA7Zu1fhfHU`,
    quiz: [
      {
        q: 'How much contact force can the Voliro T apply to a surface?',
        choices: ['Up to 5 N', 'Up to 30 N', 'Up to 300 N', 'It does not touch surfaces'],
        answer: 1,
      },
      {
        q: 'Which NDT payloads does the Voliro T work with?',
        choices: ['EMAT, UT, PEC and DFT', 'Only visual cameras', 'Radiography only', 'Sonar and hydrophone'],
        answer: 0,
      },
      {
        q: 'What is the DJI M400’s maximum flight time?',
        choices: ['Up to 15 minutes', 'Up to 30 minutes', 'Up to 59 minutes', 'Up to 2 hours'],
        answer: 2,
      },
      {
        q: 'What can the DJI FlyCart 30 carry on one battery?',
        choices: ['Up to 3 kg for 100 km', 'Up to 35 kg for 7.5 km', 'Up to 6 kg for 20 km', 'Up to 80 kg for 1 km'],
        answer: 1,
      },
      {
        q: 'How far can the Rigitech Eiger fly one way?',
        choices: ['5 km', '20 km', 'Up to 100 km', '500 km'],
        answer: 2,
      },
      {
        q: 'What is the smallest opening the Avata INS can fly through?',
        choices: ['About 20 cm (8")', 'About 40 cm (16")', 'About 60 cm (24")', 'About 1 m'],
        answer: 0,
        explain: 'Avata: 20 cm. Elios 3 needs a 40 cm manhole and 60 cm to maneuver.',
      },
      {
        q: 'How long does the DJI Dock 3 take to charge a drone from ~15 % to 95 %?',
        choices: ['About 5 minutes', 'About 27 minutes', 'About 2 hours', 'Overnight'],
        answer: 1,
      },
      {
        q: 'What makes ART crawler services special?',
        choices: [
          'They screen pipes for corrosion with product still flowing',
          'They need the line to be shut down and drained',
          'They only work underwater',
          'They inspect flares from the air',
        ],
        answer: 0,
      },
      {
        q: 'How deep can the underwater robot go?',
        choices: ['35 m', '100 m', '350 m', '3,500 m'],
        answer: 2,
      },
    ],
  },
  {
    id: 'key-info',
    title: 'What visitors need to know',
    body: `- We have a team in the UAE ready to be deployed.
- All pilots are licensed & all drones are registered with GCAA and CICPA.
- We are familiar with the authorization process (MOIAT, GCAA / DCAA, MOD, CICPA, etc).
- Specifically for ADNOC, we obtained the blanket permit.

> **We have all the required compliance to provide drone services in the UAE.**`,
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
    ],
  },
  {
    id: 'daily',
    title: 'What to do every day',
    body: `- Scan visitors' QR badges (VisitConnect app)
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
    id: 'tips',
    title: 'Other tips',
    body: `- Download the app: **VisitConnect**
- Use a tablet or iPad to quickly show videos, photos or documents. Or at least a laptop
- Put a tablet on each piece of equipment to loop videos
- Invite key customers to the meeting table
- **Always take notes** of your conversation with a visitor. Most important: write down their inquiry or request, on the back of their business card or in the app's notes
- Show real equipment in action:
  - Voliro → take some measurements on the calibration block
  - DJI Dock 3 → open and close the dock
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
  {
    id: 'conversation',
    title: 'Example conversation',
    body: `### Visitor: "Tell me who you are."
- Introduce your name & job title
- Give your business card
- Briefly introduce the company (see [Who are we?](#who))

### Visitor: "What do you do?"
- "We offer drone solutions, including survey & mapping, inspection, surveillance, agriculture services, training & consultancy, and many more. Which one are you interested in?"
- Based on their answer, see [What do we offer?](#offer)

### Visitor: "What is this?" (about a drone)
- Depends on the drone: see [Our booth](#booth) and the [Product reference](#products)

### Visitor: "Can you do ___?" (a specific requirement)
- **If we have done it:** explain our experience: how we did it, what outputs the customer received, what benefit they got (see [Work experience](#experience))
- **If it is something new:** "We can always look for, or even develop, a tailored solution based on your needs. If you don't mind, we can discuss it further after ADIPEC."

### Visitor: "OK, thank you."
- Ask for their business card (if not given yet), scan their QR code, or at least ask their name
- Ask for a follow-up:
  - **If a meeting was discussed:** "I will reach out to you to schedule a follow-up meeting. When would suit you? Does 2 weeks after ADIPEC sound good?"
  - **If a POC / trial was discussed:** "I will send you an email to confirm our interest in providing a POC. We will need some information to plan it. Is it okay to send it next week, after ADIPEC?"
  - Offer an invitation to the demo day in Abu Dhabi at the end of this month`,
    quiz: [
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
