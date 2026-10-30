import type { Answer, FaqQuestion, ServiceTopic } from './serviceFaq'

/**
 * Visitor FAQ per product ("Product reference" section). Facts come from the product entries of
 * the briefing and our project list; nothing here quotes prices, delivery times or new specs.
 */

const q = (id: string, question: string, answer: Answer): FaqQuestion => ({ id, q: question, answer })

const PRICE = (name: string): FaqQuestion =>
  q('price', 'How much is it? When can we have it?', {
    say: `We'll send a quotation for the ${name} after ADIPEC, based on your use case and quantities. We don't quote at the booth.`,
    facts: ['Never give a price or a delivery time at the booth.', 'Ask whether they want to buy it, or use it as a service with our pilots and permits.'],
    ask: ['What will they use it for, and where?', 'Buy, or service?', 'Who signs off on the purchase?'],
    next: 'Quotation or proposal by email after ADIPEC; follow-up meeting.',
  })

const OTHER: FaqQuestion = q('other', 'Something else / not on this list', {
  say: "Good question. Let me check with our specialist and come back to you, so you get the exact answer.",
  facts: ['Never guess a spec or a capability.', 'Write the question down on the back of their card or in VisitConnect.'],
  next: 'Send the answer by email next week.',
})

const TOPICS: ServiceTopic[] = [
  {
    id: 'valsem',
    label: 'VALSEM',
    questions: [
      q('what', 'What is VALSEM?', {
        say: 'VALSEM Industries, from France, protects critical equipment during transport and storage, and keeps proof of its condition over time.',
        facts: [
          'Founded in 1977; around 980 industrial customers in energy, nuclear, aerospace and infrastructure.',
          'ValStrong membranes, EXA-AIR anti-shock packaging and ValTRACK condition records.',
        ],
        show: ['VALSEM counter: the membranes and samples'],
        next: 'Introduce them to the team at the VALSEM counter.',
      }),
      q('corrosion', 'How does it stop corrosion in storage?', {
        say: 'ValStrong membranes wrap the equipment and shield it from corrosion, humidity and damage, crated or crate-less.',
        facts: [
          'ValStrong TITAN membranes and VCX anti-corrosion film.',
          'Standards: NF H00 310, MIL-PRF-131K, DEF STAN 82-75/2, DIN 55 531, PMUC (nuclear).',
        ],
        ask: ['What equipment, and how long is it stored or shipped?', 'Have they had corrosion damage at commissioning?'],
        next: 'Follow-up meeting with the VALSEM team.',
      }),
      q('proof', 'Can I prove the condition of my equipment later?', {
        say: 'Yes, with ValTRACK: embedded sensors record the conditions the equipment is exposed to, as a continuous, traceable record.',
        facts: ['Useful for audits, warranty discussions and commissioning.'],
        next: 'Follow-up meeting with the VALSEM team.',
      }),
      q('shock', 'What is EXA-AIR?', {
        say: 'Inflatable anti-shock bags and sheets that cushion equipment inside its packaging.',
      }),
      q('who', 'Who supplies it in the region?', {
        say: 'NDTCCS is VALSEM’s strategic partner in the GCC. Talk to the team at the VALSEM counter.',
        next: 'Exchange cards and agree a follow-up meeting.',
      }),
      PRICE('VALSEM solution'),
      OTHER,
    ],
  },
  {
    id: 'dock4',
    label: 'DJI Dock 4',
    questions: [
      q('new', 'What is new compared with Dock 3?', {
        say: 'Dock 4 swaps the battery automatically: the drone is back in the air within about a minute, instead of waiting around 30 minutes to recharge.',
        facts: [
          'Battery swap in under 25 s; landing to take-off in under 45 s.',
          'Stores up to 3 batteries with 2 charging channels; each charges 15–95 % in 27 minutes.',
          'Same 400 × 400 mm mounting pattern as Dock 3, so it fits existing sites.',
        ],
        show: ['The Dock 4 on the booth: open and close it, show the battery swap'],
      }),
      q('drone', 'Which drone does it fly, and what can it see?', {
        say: 'The DJI Matrice 5TD: up to 59 minutes of flight, 10 km operating radius, with zoom, thermal and a laser rangefinder.',
        facts: [
          'Three 50 MP cameras (wide, medium tele, 252 mm tele; up to 176x hybrid zoom).',
          '1280 × 1024 thermal camera; 3,000 m laser rangefinder.',
          'Wire-level obstacle sensing: mmWave radar, rotating LiDAR and 6-direction vision.',
          'Onboard AI detects 17 object classes in real time; 450 g payload (speaker, spotlight, parachute); IP55.',
        ],
      }),
      q('climate', 'Will it survive our heat and dust?', {
        say: 'Yes, it is built for harsh sites: it operates from −40 °C to +50 °C, the dock is IP56, and it has battery pre-heating and air-conditioning built in.',
        facts: ['Lands in winds up to 12 m/s.'],
        ask: ['Where would it be installed: plant, wellsite, remote area?'],
      }),
      q('remote', 'How do we control it remotely?', {
        say: 'Through DJI FlightHub 2: you schedule missions, watch live video and get AI alerts, from any office.',
        facts: [
          'Virtual cockpit, image / text object search, real-time AI alerts by SMS, email or push.',
          'Needs the DJI O4 Ground Station (RTK base, Ethernet, edge-computing slot); 4G via DJI Cellular Dongle 2.',
          'Live sharing to clients or a command center with Terra Stream.',
        ],
      }),
      q('use', 'What would we use it for?', {
        say: 'Routine, automated flights where sending people is slow or risky: patrols, inspections and monitoring, 24/7.',
        facts: ['Oil & gas facilities, pipelines, utilities, security patrols, remote assets.'],
        proof: ['ADNOC Onshore: more than 3,000 km of in-field security patrolling.'],
        ask: ['How many sites, and what should it detect?'],
        next: 'Follow-up meeting to plan a pilot site.',
      }),
      q('permit', 'Is remote (BVLOS) flying allowed?', {
        say: 'It needs the right approvals, and we know the process: our pilots are licensed, our drones registered with GCAA and CICPA, and we hold the ADNOC blanket permit.',
        next: 'Follow-up meeting to plan the site and permits.',
      }),
      PRICE('DJI Dock 4'),
      OTHER,
    ],
  },
  {
    id: 'digital-rt',
    label: 'Digital RT',
    questions: [
      q('film', 'How is it different from film radiography?', {
        say: 'A digital detector replaces the film: the image is on the laptop in seconds, with no chemical processing and much shorter exposures.',
        facts: [
          'Digital Detector Array (flat panel) or computed radiography plates.',
          'Shorter exposure for the same source (Ir-192, Co-60 or X-ray tube): lower dose, smaller exclusion zones, more shots per shift.',
          'Software measurement, contrast enhancement and a permanent digital archive.',
        ],
      }),
      q('service', 'Can you do it while the line is running?', {
        say: 'Yes. No shutdown, no draining and no insulation removal.',
        facts: ['In-service radiography is standardised in ISO 20769-2.'],
        ask: ['Which lines, which diameters, insulated or not?'],
        next: 'Follow-up meeting with our NDT team.',
      }),
      q('cui', 'Can it find corrosion under insulation?', {
        say: 'Yes. Profile radiography images the pipe wall through the insulation and cladding, and measures the remaining wall thickness.',
        facts: [
          'Finds CUI, pitting, wet insulation and cladding damage on insulated lines and pipe racks.',
          'For long runs, the ART crawler carries the detector along the pipe.',
        ],
        next: 'Follow-up meeting; offer a trial on a known problem area.',
      }),
      q('more', 'What else can it inspect?', {
        say: 'Welds, flow-accelerated corrosion, erosion, blockages and deposits, valves and small-bore fittings.',
      }),
      q('safety', 'Is it safe for our people?', {
        say: 'It is still a radiation method, so controlled areas apply and licensed radiographers do the work. Digital needs shorter exposures than film, so the zones are smaller.',
      }),
      PRICE('digital RT service'),
      OTHER,
    ],
  },
  {
    id: 'iris',
    label: 'IRIS',
    questions: [
      q('what', 'What is IRIS?', {
        say: 'Internal Rotary Inspection System: an ultrasonic probe with a rotating mirror, driven by water, scans each tube from the inside as it is pulled through.',
        facts: ['Measures the remaining wall thickness around the full circumference.'],
        show: ['IRIS counter on the booth'],
      }),
      q('find', 'What does it find?', {
        say: 'Corrosion, erosion, pitting and other wall loss, on both the inner and the outer surface of the tube.',
      }),
      q('where', 'Which equipment is it for?', {
        say: 'Tubes in heat exchangers, boilers and air coolers (fin-fans), in ferrous and non-ferrous materials.',
        ask: ['How many bundles and tubes? Which material?'],
      }),
      q('prep', 'What preparation is needed?', {
        say: 'The tubes must be cleaned and filled with water, so it is done during a shutdown.',
        ask: ['When is their next shutdown?'],
        next: 'Plan the inspection into the shutdown: follow-up meeting.',
      }),
      q('ect', 'Why not just eddy current?', {
        say: 'IRIS sizes wall loss very accurately and shows exactly where it is. It is often used with faster screening (eddy current, RFET) to confirm and size what they find.',
      }),
      PRICE('IRIS inspection'),
      OTHER,
    ],
  },
  {
    id: 'ai',
    label: 'AI solutions',
    about: 'our AI solutions',
    questions: [
      q('what', 'What software do you have?', {
        say: 'The Terra AI platform: software for every step from survey to decision. Terra MapX processes survey data, Survey Suite runs survey projects, TowerSight and SewerX manage inspections, Terra VMX and Interex analyse video, and Terra Stream shares it live.',
        facts: ['Also Terra Organize (projects and data) and Terra Checklist (digital pre-flight checklists and compliance).'],
        show: ['The product videos in the Product reference: MapX, Survey Suite, TowerSight, SewerX'],
      }),
      q('mapx', 'What does Terra MapX do?', {
        say: 'It takes drone survey data from flight to signed report: processing, then orthomosaics, elevation profiles, cut & fill, point clouds and 3D meshes in the browser, then volume and slope reports.',
        facts: [
          'The platform checks every required file (photos, GNSS, ground control) before a run.',
          'Process in-platform, or hand it to the Terra Drone back office and follow each step.',
          'Reports: cut & fill, stockpile volumes (materials, densities), highwall slopes, road alignments; checker and approver named.',
        ],
        ask: ['What do you survey: mines, stockpiles, earthworks?', 'How do you calculate volumes today?'],
      }),
      q('surveysuite', 'How do you manage survey projects?', {
        say: 'With Terra Survey Suite: one platform from first inquiry to final report: quote, plan, fly, track and deliver.',
        facts: [
          'Import the client area (KML, Shapefile, GeoJSON), plan ground control and mission blocks in minutes.',
          'Pricing from the real scope, with a quote-ready summary (contingency, markup, VAT, price per km²).',
          'Team and fleet, Gantt schedule, risk assessments, permits; daily logs, progress on the map, plan vs actual.',
        ],
      }),
      q('towersight', 'Can you inspect our towers?', {
        say: 'Yes: we fly the towers and deliver the results in TowerSight, a digital record per tower with every payload, defect, thickness reading and ticket.',
        facts: [
          'Payload inventory: every antenna, camera and light identified and photographed.',
          'Ultrasonic thickness against design, with A-scan trace and GPS; findings pinned on a 3D twin; 360° view from the top.',
          'Maintenance tickets prioritised and assigned; drawings and reports kept with the asset.',
        ],
        ask: ['How many towers, and what type: telecom, security, power?'],
      }),
      q('sewerx', 'Do you do sewer inspection?', {
        say: 'Yes: Terra SewerX turns CCTV sewer footage into graded reports, with every defect photographed, coded and mapped.',
        facts: [
          'Network map colour-coded by inspection status and condition grade.',
          'Frame-by-frame review; distance read from the video (OCR); evidence photos linked to the video timestamp.',
          'Automatic project and section reports; compare inspections to prove cleaning (e.g. grade D → A).',
        ],
        ask: ['How long is the network, and how is it inspected today?'],
      }),
      q('organize', 'What does Terra Organize do?', {
        say: 'It manages drone projects and data from planning to delivery, with a client portal to share results.',
        facts: [
          'Project dashboards, role-based team access, scheduling and progress tracking.',
          'Cloud storage with auto-backup; automatic file naming and tagging.',
          'Digital checklist; branded client portal with secure sharing and auto-generated progress reports.',
        ],
      }),
      q('stream', 'Can we watch the drone live from our office?', {
        say: 'Yes, with Terra Stream: live drone video to any viewer, with sub-second latency.',
        facts: [
          'Up to 1080p with adaptive bitrate; multi-viewer access control.',
          'Share by link, email or WhatsApp; live telemetry overlay (altitude, speed, battery, GPS); automatic cloud recording.',
        ],
        ask: ['Who would watch: control room, management, clients?'],
      }),
      q('vmx', 'Can AI watch our cameras and drones for us?', {
        say: 'Yes, with Terra VMX: drones, CCTV, bodycams and phones in one live console and map, and AI watches every feed 24/7 against your rules.',
        facts: [
          'Detects and tracks people and vehicles; aerial model for small objects in drone video; custom YOLO models.',
          'Draw zones on the camera or map and set rules in plain language: restricted areas, crowds, loitering, speeding, no-stopping.',
          'Every finding is logged with an annotated screenshot, time, source and location; export to CSV / GeoJSON.',
          'Runs on-premise on your own GPU server; no inbound ports; admin, supervisor and operator roles.',
        ],
        show: ['vmx.terra-drone.com.sa'],
        ask: ['How many cameras and drones do you have today?', 'Who watches them, and what do you want to be alerted about?'],
      }),
      q('interex', 'Can you measure traffic from drone video?', {
        say: 'Yes, with Interex: drone or CCTV video in, traffic data out, live or from a recorded flight.',
        facts: [
          'Counts and tracks cars, motorcycles, buses, trucks, vans and bicycles by line, direction and class.',
          'Turning movements, speeds (average and 85th percentile), waiting time and indicative level of service.',
          'PDF reports and CSV exports, including 15-minute counts.',
          'Runs on your own PC with an NVIDIA GPU, in real time on one RTX 4090.',
        ],
        show: ['interex.terra-drone.com.sa'],
        ask: ['Where: site gates, plant roads, logistics yards, or public roads?'],
      }),
      PRICE('software'),
      OTHER,
    ],
  },
  {
    id: 'simulator',
    label: 'Drone flight simulator',
    about: 'the drone flight simulator',
    questions: [
      q('try', 'Can I try it?', {
        say: 'Of course, have a go. It uses a real DJI remote controller, so it feels like the real drone.',
        next: 'While they fly, ask about their drone plans and offer training.',
      }),
      q('why', 'Why train on a simulator?', {
        say: 'Pilots build skills, procedures and muscle memory with zero risk to aircraft, payloads, people or property, before real flight hours and the licence practical test.',
        facts: [
          'Training modules: skills (take-off, landing, path following, tests), free flight, and applications like powerline inspection and search & rescue.',
          'Emergency drills: loss of GNSS, return-to-home, low battery, ATTI-mode recovery; night and bad weather.',
          'Repeatable scoring to assess trainees.',
        ],
      }),
      q('real', 'Is it like flying the real drone?', {
        say: 'Very close: it uses your real DJI controller via USB, and DJI’s physics engine reproduces each model’s flight behaviour, with the same P, A and S modes.',
        facts: ['Wind, ground effect and crash physics can be switched on.'],
      }),
      q('course', 'Do you run training courses?', {
        say: 'Yes: from short workshops to a 2–3 month academy, and we trained drone pilots for ADNOC personnel.',
        proof: ['ADNOC Onshore: drone pilot training for ADNOC personnel.'],
        next: 'Send a training proposal after ADIPEC.',
      }),
      PRICE('simulator and training'),
      OTHER,
    ],
  },
  {
    id: 'voliro',
    label: 'Voliro T',
    questions: [
      q('what', 'What does it do?', {
        say: 'It is a contact drone: it flies up to a surface, presses an NDT probe against it and takes measurements, with no scaffolding or rope access.',
        facts: [
          'Omnidirectional, 6-DOF flight control: stable contact on vertical, inclined and overhead surfaces.',
          'Up to 30 N contact force.',
        ],
        show: ['Voliro on the calibration block'],
      }),
      q('ndt', 'Which measurements can it take?', {
        say: 'UT thickness, plus EMAT, PEC and DFT (coating thickness) with the matching payloads.',
        proof: ['Equate (Kuwait): UT using Voliro on several pipes.', 'ADNOC Offshore: UT measurement of caisson legs and void spaces.'],
      }),
      q('specs', 'How long does it fly, and what can it carry?', {
        say: 'Up to 15 minutes, depending on the payload, with payloads up to 1 kg.',
        facts: ['4K inspector camera and 2K pilot camera; triple-redundant IMU.'],
      }),
      q('where', 'Can it work indoors or under structures?', {
        say: 'Yes, it is optimised for GPS-denied places: indoors, under structures, inside tanks.',
        facts: ['Ideal for oil & gas, petrochemical, power plants and ship hulls.'],
      }),
      q('poc', 'Can you show it on our asset?', {
        say: 'Yes, we can do an on-site trial: a few UT points on one of your assets, compared with your current method.',
        ask: ['Which asset, and how many points?', 'What does it cost them today with scaffolding or rope access?'],
        next: 'On-site POC: agree the asset and a date.',
      }),
      PRICE('Voliro T'),
      OTHER,
    ],
  },
  {
    id: 'eiger',
    label: 'Rigitech Eiger',
    questions: [
      q('what', 'What is it for?', {
        say: 'Long-range automated delivery, day and night, beyond visual line of sight.',
        facts: ['Proven for medical deliveries, offshore logistics and island connectivity.'],
      }),
      q('range', 'How far, and how much can it carry?', {
        say: 'Up to 100 km one way, with up to 3 kg in a ~15 L cargo box.',
      }),
      q('land', 'Does it need a runway?', {
        say: 'No. It takes off and lands vertically, then flies on its wings for speed and range, with precision landing on small surfaces.',
        facts: ['Precision landing with vision, GNSS and IMU.', 'Live video from front and downward cameras.'],
      }),
      q('safe', 'Is it safe in shared airspace?', {
        say: 'Yes: it has airspace awareness (ADS-B, FLARM, Remote ID), a ballistic parachute, redundant telemetry and failsafe logic.',
        facts: ['Wind-resistant (~15 m/s in fixed-wing mode) and quiet (~51–55 dB at 135 m).'],
      }),
      q('use', 'Where would we use it?', {
        say: 'Spare parts, samples and urgent items between sites, offshore platforms or remote locations.',
        proof: ['ADNOC Offshore: drone delivery and cargo delivery (with FlyCart 30).', 'ADNOC Onshore: delivery of goods by drone on Bu Hasa field.'],
        ask: ['Which routes, distances and items?'],
        next: 'Follow-up meeting to map their delivery routes.',
      }),
      PRICE('Rigitech Eiger'),
      OTHER,
    ],
  },
  {
    id: 'm400',
    label: 'DJI M400',
    questions: [
      q('specs', 'How long does it fly, and what can it carry?', {
        say: 'Up to 59 minutes of flight, and up to 6 kg of payload.',
        facts: ['Hot-swappable batteries: no downtime in the field.'],
      }),
      q('weather', 'Does it work in our conditions?', {
        say: 'Yes: IP55 against dust and drizzle, and it operates from −20 °C to +50 °C.',
      }),
      q('safe', 'How does it avoid obstacles?', {
        say: 'LiDAR plus millimeter-wave radar give it 360° obstacle awareness and avoidance.',
      }),
      q('range', 'How far can it fly from the pilot?', {
        say: 'O4 Enterprise transmission gives a stable HD video link up to 20 km, with automatic frequency switching.',
      }),
      q('accuracy', 'Is it accurate enough for survey?', {
        say: 'Yes, RTK gives centimeter-grade positioning for survey and inspection.',
        facts: ['AI flight assistance: automatic route planning, repeatable inspection paths, AI object recognition.'],
      }),
      q('use', 'What is it used for?', {
        say: 'Powerline inspection, oil & gas surveys, mapping, emergency response and asset monitoring.',
        proof: ['ADNOC Onshore: more than 400 OHL units inspected, more than 8,000 km of pipeline surveyed.'],
      }),
      PRICE('DJI M400'),
      OTHER,
    ],
  },
  {
    id: 'cleaning',
    label: 'Drones for cleaning',
    about: 'cleaning drones',
    questions: [
      q('what', 'What does it clean?', {
        say: 'High surfaces that people normally clean at height: it replaces manual high-altitude work.',
        facts: ['Multi-angle, multi-scenario coverage.'],
        ask: ['What surface: tanks, stacks, building facades, solar panels?'],
      }),
      q('fast', 'How fast is it?', {
        say: 'High-pressure cleaning at around 800 m² per hour, at 20 MPa.',
        facts: ['Stable high-altitude operation; real-time data display.'],
      }),
      q('why', 'Why use a drone for cleaning?', {
        say: 'Nobody works at height, and you need no scaffolding, cranes or rope access.',
      }),
      PRICE('cleaning drone'),
      OTHER,
    ],
  },
  {
    id: 'aheadx',
    label: 'AheadX QP530',
    questions: [
      q('range', 'How long and how far can it fly?', {
        say: 'Up to 2 hours, within a 60 km radius; 60–80 km in a straight line in one flight.',
      }),
      q('takeoff', 'Does it need a runway?', {
        say: 'No, it takes off and lands vertically (VTOL), then flies like a plane for range.',
      }),
      q('night', 'Can it see at night?', {
        say: 'Yes: a 30x optical zoom camera plus an infra-red camera for night operation.',
      }),
      q('live', 'Can we watch the video live?', {
        say: 'Yes, it streams live to your command center.',
        facts: ['Terra Stream can share the feed with more viewers.'],
      }),
      q('use', 'What is it for?', {
        say: 'Real-time surveillance of large areas: pipeline routes, power lines, field security.',
        proof: ['ADNOC Onshore: more than 3,000 km of in-field security patrolling.'],
        show: ['AheadX OHL video'],
        next: 'Follow-up meeting; offer a demo flight.',
      }),
      PRICE('AheadX QP530'),
      OTHER,
    ],
  },
  {
    id: 'elios',
    label: 'Elios 3',
    questions: [
      q('size', 'What size opening does it need?', {
        say: 'A 40 cm (16") manhole to get in, and at least 60 cm (24") of space to maneuver.',
      }),
      q('flight', 'How long can it fly inside?', {
        say: 'Around 8–12 minutes per flight.',
      }),
      q('3d', 'Do we get a 3D model?', {
        say: 'Yes, its LiDAR builds a 3D point cloud; with the GeoSLAM feature accuracy reaches up to 2 cm, and you can do a virtual inspection in the software.',
      }),
      q('ut', 'Can it measure thickness inside?', {
        say: 'Yes, Elios 3 has a UT payload for spot thickness measurements in confined spaces.',
      }),
      q('done', 'Have you used it?', {
        say: 'Yes, for confined space inspections in the UAE.',
        proof: [
          'ADNOC Refining: internal inspection of cyclone, boiler, reactor, snubber, drying and absorbing towers.',
          'Lafarge Holcim: confined space inspection inside EP and silo.',
          'ADNOC Offshore: void space and caisson leg inspection.',
        ],
        show: ['Confined Space video and sample reports'],
        next: 'Plan an inspection into their next shutdown.',
      }),
      PRICE('Elios 3'),
      OTHER,
    ],
  },
  {
    id: 'flycart',
    label: 'DJI FlyCart 30',
    questions: [
      q('load', 'How much can it carry, and how far?', {
        say: 'With one battery up to 35 kg for 7.5 km; with two batteries up to 25 kg for 15 km.',
        facts: ['Endurance 7.5 min (1 battery) or 15 min (2 batteries); maximum operation radius 5 km.'],
      }),
      q('done', 'Have you used it?', {
        say: 'Yes, offshore for ADNOC.',
        proof: ['ADNOC Offshore: cargo delivery using FlyCart 30.', 'ADNOC Onshore: delivery of goods by drone on Bu Hasa field.'],
        show: ['Drone Delivery Bu Hasa video'],
      }),
      q('use', 'What would we deliver?', {
        say: 'Tools, spare parts and supplies between ships, platforms and shore, or across a large site: faster than a boat or a truck for short hops.',
        ask: ['Which routes and distances? How heavy are the items?'],
        next: 'Follow-up meeting to map their routes.',
      }),
      PRICE('FlyCart 30'),
      OTHER,
    ],
  },
  {
    id: 'rov',
    label: 'Underwater robot',
    about: 'the underwater robot',
    questions: [
      q('depth', 'How deep can it go?', {
        say: 'Down to 350 m (over 1,100 ft), which covers about 95 % of underwater work.',
        facts: ['6 vector thrusters: omnidirectional movement at up to 3 knots (1.5 m/s).'],
      }),
      q('see', 'What can it see and measure?', {
        say: '4K video with dual cameras, a 10 cm laser scaler for measurements, and NDT tools such as a UT thickness gauge.',
      }),
      q('tools', 'What tools can it carry?', {
        say: 'A robotic arm that lifts 10 kg, plus sonar, positioning and sampling tools.',
        facts: [
          '2D imaging sonar, 360° scanning sonar, Station Lock, U-QPS positioning.',
          'Mud and water samplers, salinity, pH and dissolved-oxygen sensors, hydrophone; on-shore power supply option.',
        ],
      }),
      q('divers', 'Does it replace divers?', {
        say: 'For many inspection tasks it reduces or removes the need for divers: safer and faster to deploy, with video and data recorded.',
        ask: ['What structures do they inspect underwater, and how often?'],
        next: 'Follow-up meeting with our NDT team.',
      }),
      PRICE('underwater robot'),
      OTHER,
    ],
  },
  {
    id: 'crawler',
    label: 'Pipe crawler',
    about: 'the LiDAR pipe crawler',
    questions: [
      q('size', 'Which pipes can it go into?', {
        say: 'Pipes of at least 12 inches, travelling up to 1,000 m.',
      }),
      q('measure', 'What does it measure?', {
        say: 'Clear 2D and 3D profiles of the pipe, with flaw measurement, location and dimensions, and accurate cross-sections.',
        facts: ['LiDAR measures distances with pulsed laser light.', 'Auto-analysis software identifies flaws.'],
      }),
      PRICE('pipe crawler inspection'),
      OTHER,
    ],
  },
  {
    id: 'art',
    label: 'ART crawler',
    about: 'ART crawler services',
    questions: [
      q('what', 'What does it do?', {
        say: 'It screens pipes for internal corrosion and corrosion under insulation with digital radiography, even with product flowing.',
        facts: ['Rapid large-scale screening; lines stay in service; permanent digital image archive.'],
      }),
      q('sizes', 'Which pipe sizes?', {
        say: 'Internal corrosion crawler: 4–48". CUI crawler: 2–48". 360° crawler: 12–60".',
      }),
      q('insul', 'Do we need to remove the insulation?', {
        say: 'No. It works through insulation, on insulated and uninsulated above-ground piping and pipelines.',
        next: 'Follow-up meeting with our NDT team.',
      }),
      PRICE('ART crawler service'),
      OTHER,
    ],
  },
]

/** Product names keep their capitals in the title ("Visitor asks about DJI Dock 4"). */
export const PRODUCT_TOPICS: ServiceTopic[] = TOPICS.map((t) => ({ about: t.label, ...t }))
