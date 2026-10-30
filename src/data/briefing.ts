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
[[service-faq:survey]]

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
[[service-faq:inspection]]

### Surveillance
- Real-time live-stream video for security & safety
- First response in emergencies: real-time information to the command center
- **Fixed wing** for large areas (e.g. pipelines), **multirotor** for small areas (e.g. facility, plant, complex)
- Both have a zoom surveillance camera, plus an infra-red thermal camera for night operation
[[service-faq:surveillance]]

### Gas leak & methane monitoring
- Real-time data collection and transmission: leaks are found instantly, without exposing personnel
- Comprehensive reports with geotagged data, aerial images and detailed analysis of detected leaks, for asset integrity
[[service-faq:methane]]

### Drone training & consultancy
- Training / workshops for employees: how to operate drones and how to use them in their business
- An academy (e.g. 2–3 months) for complete knowledge of drone operations
- Consultancy to build an internal drone program: choosing the right drone, meeting compliance requirements, etc
[[service-faq:training]]

### Selling drones
- We are an **official reseller of DJI Enterprise**
- We also sell our own fixed-wing drone technology
[[service-faq:selling]]

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
    body: `Every product we offer, to answer visitor questions. Search, or pick a category, then open a product. Products marked **On the booth** are on our stand (see [Our booth](#booth)); the rest we can offer from Abu Dhabi.

[[product-catalog]]

## Drones & docks
### DJI Dock 4 (on the booth)
![DJI Dock 4 with Matrice 5TD](https://www-cdn.djiits.com/cms/uploads/6d68a59801b5acf6962b51b00080b6f9.png)
- DJI's newest drone-in-a-box (launched October 2026) for fully autonomous, 24/7 remote operations
- First DJI dock with **automatic battery swap**: swap in under 25 s, landing-to-takeoff in under 45 s (Dock 3 needs ~30 min to recharge)
- Stores up to 3 batteries with 2 charging channels; a battery charges 15–95 % in 27 minutes
- Paired aircraft: **DJI Matrice 5TD**: up to 59 min flight time, 10 km operating radius, IP55, 450 g payload (speaker, spotlight, parachute)
- M5TD sensors: three 50 MP cameras (wide, medium tele, 252 mm tele; up to 176x hybrid zoom), 1280×1024 thermal, 3,000 m laser rangefinder
- Wire-level obstacle sensing: millimeter-wave radar + rotating LiDAR + 6-direction vision; onboard AI detects 17 object classes in real time
- Built for harsh sites: −40 °C to +50 °C, dock IP56, landing in winds up to 12 m/s, battery pre-heating and air-conditioning built in
- Needs the DJI O4 Ground Station (RTK base, Ethernet, edge-computing slot); 4G via DJI Cellular Dongle 2
- Managed in DJI FlightHub 2: virtual cockpit, image/text object search, real-time AI alerts by SMS / email / push
- Same 400 × 400 mm mounting pattern as Dock 3, so it fits existing sites
- Ideal for oil & gas facilities, pipelines, utilities, security patrols and remote assets where sending people is slow or risky
https://youtu.be/rIznH_5IniM
[[product-faq:dock4]]

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
[[product-faq:m400]]

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
[[product-faq:voliro]]

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
[[product-faq:elios]]

### AheadX QP530
![AheadX QP530A](https://static.aheadx.com/website/pc-ssr/cn-pc/images/qp530a/QP530A.png)
- Real-time surveillance
- VTOL (vertical take-off & landing)
- Up to 2 hours endurance
- Up to 60 km radius; 60–80 km straight line in one flight
- 30x optical EO zoom camera and IR camera for night operation
- Live stream to the command center
https://youtu.be/r3k7v1WPDMk
[[product-faq:aheadx]]

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
[[product-faq:eiger]]

### DJI FlyCart 30
![DJI FlyCart 30](https://www-cdn.djiits.com/cms/uploads/6309da752b25bee607f0c785de57085e.png)
- Cargo delivery
- 1 battery: up to 35 kg payload, 7.5 km travel distance, 7.5 minutes endurance
- 2 batteries: up to 25 kg payload, 15 km travel distance, 15 minutes endurance
- Maximum operation radius 5 km
https://youtu.be/Hhp11I-vGHA
[[product-faq:flycart]]

### Drones for cleaning
![Example of a cleaning drone (ABZ C10)](https://abzinnovation.com/wp-content/uploads/2026/01/C10-1.webp)
- Replaces manual high-altitude work
- High-pressure fast cleaning: 800 m²/h, 20 MPa
- Stable high-altitude operation
- Real-time data display
- Multi-angle, multi-scenario coverage
https://youtu.be/WnYeOUIdnoI
[[product-faq:cleaning]]

## Terra AI platform
### Terra AI platform overview (on the booth)
![Terra Drone Indonesia team with drones](https://img.youtube.com/vi/CZL859mbue4/maxresdefault.jpg)
- Terra Drone's own software for the data side of drone operations, so customers get usable results, not just raw files
- [Terra MapX](#products/terra-mapx): drone survey processing and reporting for mining and earthworks
- [Terra Survey Suite](#products/terra-survey-suite): drone survey project management, from inquiry to report
- [TowerSight](#products/towersight) and [Terra SewerX](#products/terra-sewerx): inspection platforms for towers and sewer networks
- [Terra VMX](#products/terra-vmx): AI video analytics for security; [Interex](#products/interex): AI traffic analytics from drone video
- **Terra Organize**: project and data management for drone operations: project dashboards, role-based team access, scheduling and progress tracking, cloud storage with auto-backup, automatic file naming and tagging, a digital checklist, and a branded client portal with secure file sharing and auto-generated progress reports
- **Terra Stream**: live streaming of drone video to the customer or a command center: up to 1080p with adaptive bitrate, sub-second latency, multi-viewer access control, share by link / email / WhatsApp, live telemetry overlay (altitude, speed, battery, GPS), automatic cloud recording
- Use cases: client presentations, emergency response, remote supervision of works, inspection QA, training
- Also: **Terra Checklist**, a digital pre-flight checklist and compliance tool with templates per mission type, digital signatures and an audit trail
https://youtu.be/CZL859mbue4
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

## Inspection & NDT
### Digital RT (digital radiography) (on the booth)
![Portable digital radiography at a refinery](https://img.youtube.com/vi/cJyVyBaAnfM/maxresdefault.jpg)
- Radiography with a **Digital Detector Array** (flat panel) or computed radiography plates instead of film: the image is on the laptop in seconds, with no chemical processing
- **In service**: no shutdown, no draining and no insulation removal; standardised in ISO 20769-2
- Much shorter exposure times than film for the same source (Ir-192, Co-60 or a portable X-ray tube): lower dose, smaller exclusion zones, more shots per shift
- **Profile (tangential) radiography** images the pipe wall edge to measure remaining wall thickness, pitting and internal / external corrosion through insulation and cladding
- **CUI screening**: finds corrosion under insulation, wet insulation and cladding damage on insulated lines and pipe racks
- Real-time radiography and motorised crawlers carry the detector along long pipe runs for fast go / no-go screening (see ART crawler services below)
- Software measurement (wall thickness, density profiles), contrast enhancement and a permanent digital archive with full traceability, so campaigns can be compared
- Also used for weld quality, flow-accelerated corrosion, erosion, blockages, valves and small-bore fittings
- Still a radiation method: controlled areas and licensed radiographers apply
https://youtu.be/dndIQ5X3pcM
[[product-faq:digital-rt]]

### IRIS (Internal Rotary Inspection System) (on the booth)
![IRIS probes and centering devices](https://www.eddyfi.com/doc/ProductImages/STP_IRIS_CD_800x645-01.png)
- Ultrasonic inspection of tubes **from the inside**: a probe with a rotating mirror, driven by water flow, scans the full circumference as it is pulled through the tube
- Measures the remaining wall thickness and finds corrosion, erosion, pitting and other wall loss on both the inner and the outer surface
- For tubes in heat exchangers, boilers and air coolers (fin-fans), ferrous and non-ferrous
- Tubes must be cleaned and filled with water first
- Very accurate sizing: often used together with faster screening methods (eddy current, RFET) to confirm and size what they find
- Benefit: wall-thickness data for every tube, so the customer plugs or replaces only the tubes that need it and plans shutdowns with confidence
https://youtu.be/yhTewrjTRMQ
[[product-faq:iris]]

### ART crawler services
![ART crawler on an insulated pipe](https://www.mistrasgroup.com/media/noqm4ukp/masthead-art-crawler.png)
- Digital radiography to screen for internal corrosion and corrosion under insulation (CUI) in insulated & uninsulated above-ground piping and pipelines, **even with product flowing**
- Internal corrosion crawler: through-wall technique, pipes 4–48"
- CUI crawler: tangential OD radiography, pipes 2–48"
- 360° crawler: tangential OD radiography, pipes 12–60"
- Rapid large-scale screening
- Lines stay in service
- Permanent digital image archive
https://youtu.be/JA7Zu1fhfHU
[[product-faq:art]]

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
[[product-faq:crawler]]

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
[[product-faq:rov]]

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
https://youtu.be/JYsudQpknpU
[[product-faq:valsem]]

## Training
### Drone flight simulator (on the booth)
![Pilot training on the DJI Flight Simulator](https://img.youtube.com/vi/Zb_XKPgr0oo/maxresdefault.jpg)
- Part of our **drone training & consultancy** offer: visitors can try flying at the booth
- Builds stick skills, procedures and muscle memory with zero risk to aircraft, payloads, people or property
- Uses the pilot's real DJI remote controller via USB, so the control response matches the real aircraft; DJI's physics engine reproduces each model's flight behaviour
- Training modules: skills training (take-off, landing, path following, tests), free flight, and application training such as powerline inspection and search & rescue
- Same flight modes as real flight (P, A, S); simulated wind, ground effect and crash physics can be switched on
- Emergency drills: loss of GNSS, return-to-home, low battery, ATTI-mode recovery; night and bad-weather conditions
- Repeatable scoring to assess trainees, and lower training cost and insurance exposure before real flight hours and licence practical tests (e.g. GCAA)
https://youtu.be/Zb_XKPgr0oo
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
| [Voliro T](https://voliro.com/voliro-solution/) | | [Folder]() | [Brochure]() | [Video]() |
| [Rigitech Eiger](https://rigi.tech/eiger/) | | [Folder]() | [Brochure]() | [Video]() |
| [DJI M400](https://enterprise.dji.com/matrice-400) | | [Folder]() | [Brochure]() | [Video]() |
| Drones for cleaning | | [Folder]() | [Brochure]() | [Video]() |
| [AheadX QP530](https://www.aheadx.com/product/qp530a) | | [AheadX]() | [AheadX – QP530.pdf]() | [Showcase]() · [Use case: powerline inspection]() |
| [Elios 3](https://www.flyability.com/elios-3) | | [Elios 3 – UT]() | [Elios 3 UT Payload.pdf]() | [Elios 3 – Digitizing the industry]() |
| [DJI FlyCart 30](https://www.dji.com/flycart-30) | | [DJI FlyCart 30]() | [DJI FlyCart 30.pdf]() | [Introducing DJI FlyCart 30]() · [Use case: shore-based last mile delivery]() |`,
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
