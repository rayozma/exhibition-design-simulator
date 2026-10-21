/**
 * Visitor FAQ per service ("What do we offer?" section): common visitor questions with the answer
 * to give, facts, proof from our own projects, what to show, questions to ask back and the next step.
 * Facts come from the team briefing; nothing here quotes prices or durations.
 */

export type Answer = {
  /** What to say, in a sentence or two. */
  say: string
  facts?: string[]
  /** Our own projects that prove it. */
  proof?: string[]
  /** What to show on the booth or tablet. */
  show?: string[]
  /** Questions to ask back to qualify the need. */
  ask?: string[]
  next?: string
}

/** A visitor question; either answered directly, or narrowed down with one more choice. */
export type FaqQuestion = {
  id: string
  q: string
  answer?: Answer
  follow?: { q: string; options: { id: string; label: string; hint?: string; answer: Answer }[] }
}

export type ServiceTopic = {
  id: string
  label: string
  /** How the title names it ("Visitor asks about …"); default: the label in lower case. */
  about?: string
  questions: FaqQuestion[]
}

// Shared answers ------------------------------------------------------------------------------

const PRICE = (what: string): FaqQuestion => ({
  id: 'price',
  q: 'How much does it cost? How long does it take?',
  answer: {
    say: `It depends on the scope, so we don't quote at the booth. Let us understand your ${what}, and we will send a proposal with price and schedule.`,
    facts: [
      'Never give a price or a duration at the booth: a wrong number is hard to take back.',
      'Drone work usually saves cost against scaffolding, rope access, cranes or manned aircraft. Say this, without numbers.',
    ],
    ask: ['Which asset or area, and where?', 'What do you need at the end (deliverables, report format)?', 'Is there a deadline, shutdown or tender?', 'Who else is involved in the decision?'],
    next: 'Follow-up meeting 2 weeks after ADIPEC to scope it, then a proposal.',
  },
})

const PERMITS: FaqQuestion = {
  id: 'permits',
  q: 'Do you have the permits to fly here?',
  answer: {
    say: 'Yes. We have all the required compliance to provide drone services in the UAE, and a team in the UAE ready to deploy.',
    facts: [
      'All pilots are licensed and all drones are registered with GCAA and CICPA.',
      'We know the authorization process: MOIAT, GCAA / DCAA, MOD, CICPA, etc.',
      'For ADNOC we hold the blanket permit.',
    ],
    next: 'Offer a follow-up meeting or the demo day in Abu Dhabi at the end of the month.',
  },
}

const OTHER: FaqQuestion = {
  id: 'other',
  q: 'Something else / not on this list',
  answer: {
    say: "We can always look for, or even develop, a tailored solution based on your needs. If you don't mind, we can discuss it further after ADIPEC.",
    facts: ['Write the exact question down on the back of their card or in VisitConnect.', 'If you are not sure of the answer, say so and promise to follow up; never guess.'],
    next: 'Follow-up meeting after ADIPEC; send the answer by email next week.',
  },
}

// Topics --------------------------------------------------------------------------------------

export const SERVICE_TOPICS: ServiceTopic[] = [
  {
    id: 'survey',
    label: 'Survey & mapping',
    questions: [
      {
        id: 'accuracy',
        q: 'How accurate is it? Better than satellite or Google Earth?',
        answer: {
          say: 'Much better: drones reach about 1 cm per pixel, and topographic maps with centimeter resolution and accuracy.',
          facts: [
            'Drone: ~1 cm/pixel. Google Earth: 0.5–1 m/pixel. Best satellite (Quickbird): 30 cm/pixel. Airborne: 10–15 cm/pixel.',
            'Topographic maps (DEM, contours) with cm resolution & accuracy; Google Earth elevation is 10 m/pixel with 30 m accuracy.',
            'Minimum interpolation; airborne surveys interpolate a lot to reach their resolution.',
            'RTK gives centimeter-grade positioning (DJI M400).',
          ],
          show: ['DJI M400 specs (RTK, LiDAR) in the Product reference', 'A sample map or 3D model on the tablet'],
          ask: ['What accuracy does your design or report need?', 'Which coordinate system and file formats do you use?'],
          next: 'Follow-up meeting to define the accuracy and deliverables.',
        },
      },
      {
        id: 'deliverables',
        q: 'What do I get at the end?',
        answer: {
          say: 'High resolution, up-to-date maps and models of your site, ready for your engineering, GIS or integrity teams.',
          facts: [
            'Orthophoto (an up-to-date, very sharp "Google Maps" of your site)',
            'Topographic map: digital elevation model, contours',
            'Very detailed 3D model / point cloud (high level of detail)',
            'Analyses: encroachment on pipeline ROW, plan layout, inventory, volumes, progress',
            'Processing and sharing in our own software (Terra MapX, Terra Organize)',
          ],
          ask: ['Who will use the data: survey, GIS, facility engineering, pipeline integrity?', 'Which formats does your team work with?'],
          next: 'Send a sample dataset after ADIPEC.',
        },
      },
      {
        id: 'lidar',
        q: 'Photogrammetry or LiDAR: which one do I need?',
        answer: {
          say: 'Both are drone surveys. Photogrammetry builds maps and 3D models from photos; LiDAR measures the ground directly with laser pulses. We choose based on your site and the accuracy you need.',
          facts: [
            'Photogrammetry: photo-realistic orthophotos and textured 3D models; best for open areas and visual records.',
            'LiDAR: dense, accurate point clouds; better for complex structures, vegetation and surfaces with little texture.',
            'Many projects combine both.',
          ],
          proof: ['ADNOC Drilling: high resolution and accuracy mapping and LiDAR.', 'ADNOC Drilling: pipeline automatic feature extraction.'],
          ask: ['What is on the site: open desert, vegetation, plant structures?', 'What will the data be used for?'],
          next: 'Follow-up meeting to choose the method for their site.',
        },
      },
      {
        id: 'uses',
        q: 'What can we use it for?',
        answer: {
          say: 'Anything where you need an accurate, current picture of a site: pipelines, facilities, construction, exploration.',
          facts: [
            'Pipeline ROW mapping: 3D mapping, topographic map, encroachment',
            'Facility mapping: plan layout, topographic map, inventory',
            'Construction: topography survey for initial design, and periodic progress monitoring',
            'Exploration / seismic: reconnaissance, planning, supporting data collection',
            'Infra-red data (NDVI, thermal) for exploration; agriculture: tree counting, health assessment, estate design',
          ],
          ask: ['Which department are you in?', 'Which of these comes up most for you?'],
        },
      },
      {
        id: 'done',
        q: 'Have you done this in the UAE?',
        answer: {
          say: 'Yes, at large scale, mostly for ADNOC.',
          proof: [
            'ADNOC Onshore Drone Center: more than 8,000 km of pipeline surveyed, more than 400 wellheads surveyed.',
            'ADNOC Drilling: high resolution mapping and LiDAR, pipeline automatic feature extraction.',
            'Seismic survey report for ADNOC (see Service materials).',
          ],
          show: ['Pipeline inspection video and the ADNOC sample report (Service materials table)'],
          next: 'Offer a follow-up meeting; invite them to the demo day.',
        },
      },
      PRICE('area, accuracy and deliverables'),
      PERMITS,
      OTHER,
    ],
  },
  {
    id: 'inspection',
    label: 'Inspection',
    questions: [
      {
        id: 'asset',
        q: 'Can you inspect my …?',
        follow: {
          q: 'Which asset?',
          options: [
            {
              id: 'flare',
              label: 'Flare or stack',
              hint: 'Often while in operation',
              answer: {
                say: 'Yes. A drone with a zoom and a thermal camera inspects the flare from a safe distance, usually while it is running.',
                facts: [
                  'External visual: ultra-zoom images to find defects from a safe distance.',
                  'External thermal: heat anomalies on flares, thermal oxidizers, stacks.',
                  'No scaffolding, cranes or work at height.',
                ],
                proof: ['ADNOC Onshore: more than 60 flares inspected.', 'ADNOC Refining: flare inspection (accomplished).'],
                show: ['Flare Inspection video and sample report (Service materials)', 'DJI Dock 4 / M400 zoom and thermal cameras'],
                ask: ['How many flares, and where?', 'Is a shutdown planned, or must it be online?'],
                next: 'Follow-up meeting or on-site POC on one flare.',
              },
            },
            {
              id: 'confined',
              label: 'Tank, vessel, boiler or other confined space',
              hint: 'Internal inspection',
              answer: {
                say: 'Yes, without anyone entering. A caged drone flies inside and records the internal surface in detail, with a 3D model.',
                facts: [
                  'Elios 3: non-entry confined space inspection and 3D modeling; needs a 40 cm (16") manhole and 60 cm (24") to maneuver; LiDAR point cloud, up to 2 cm accuracy with GeoSLAM.',
                  'Avata INS for very narrow spaces: fits through 20 cm (8").',
                  'No human entry: no exposure to toxic gases, heat or unstable structures; much less scaffolding.',
                  'Done during a shutdown, in a gas-free space.',
                ],
                proof: [
                  'ADNOC Refining: internal inspection of cyclone, boiler, reactor, snubber, drying and absorbing towers.',
                  'ADNOC Offshore: void space and caisson leg inspection.',
                  'Lafarge Holcim: confined space inspection inside EP and silo.',
                ],
                show: ['Confined Space video and sample reports (Service materials)', 'Elios 3 in the Product reference'],
                ask: ['What is the manhole size and the internal size?', 'When is the next shutdown?'],
                next: 'Plan the inspection into their next shutdown: follow-up meeting within 2 weeks.',
              },
            },
            {
              id: 'piping',
              label: 'Piping, pipe racks or pipelines',
              answer: {
                say: 'Yes, from the outside with drones, and through the wall with digital radiography, while the line stays in service.',
                facts: [
                  'Drone visual for pipe racks, overhanging pipes and pipeline routes.',
                  'Digital RT / ART crawler: corrosion and CUI screening in service, through insulation, pipes 2–60".',
                  'LiDAR & visual crawler for inside pipes of at least 12", up to 1,000 m.',
                ],
                proof: ['ADNOC Offshore: piperack inspection.', 'ADNOC Onshore: more than 8,000 km of pipeline surveyed.'],
                show: ['Digital RT and ART crawler in the Product reference', 'Pipeline Inspection video'],
                ask: ['Insulated or not? Diameter?', 'Can the line be stopped, or must it stay in service?'],
                next: 'Follow-up meeting with our NDT team.',
              },
            },
            {
              id: 'ohl',
              label: 'Overhead power lines or towers',
              answer: {
                say: 'Yes. Zoom cameras inspect lines, insulators and towers from a safe distance, much faster than climbing.',
                facts: ['Ultra-zoom visual inspection of vertical structures.', 'Fixed-wing VTOL (AheadX QP530) for long lines; multirotor for detail.'],
                proof: ['ADNOC Onshore: more than 400 OHL units inspected.'],
                show: ['OHL Inspection and AheadX OHL videos', 'Sample visual inspection report'],
                ask: ['How many km or towers?', 'What defects worry them most?'],
                next: 'Follow-up meeting or a POC on one line section.',
              },
            },
            {
              id: 'offshore',
              label: 'Offshore platform',
              hint: 'Underdeck, caisson legs, void spaces',
              answer: {
                say: 'Yes, we have done it offshore for ADNOC: underdeck, caisson legs, void spaces, piperacks, even UT measurement and cargo delivery.',
                proof: [
                  'ADNOC Offshore: void space (external & internal), underdeck, caisson leg (external & internal), piperack.',
                  'ADNOC Offshore: UT measurement of caisson legs and void spaces.',
                  'ADNOC Offshore: drone delivery and cargo delivery with FlyCart 30.',
                ],
                show: ['Voliro T for contact UT', 'Elios 3 for internal spaces', 'FlyCart 30 for deliveries'],
                ask: ['Which platform and which areas?', 'Any campaign or shutdown planned?'],
                next: 'Follow-up meeting within 2 weeks.',
              },
            },
            {
              id: 'underwater',
              label: 'Underwater structure',
              hint: 'Jetty, hull, subsea pipeline',
              answer: {
                say: 'Yes, with our underwater robot: 4K video and UT thickness, down to 350 m, with fewer divers.',
                facts: [
                  '350 m depth rating, 4K camera, laser scaler for measurement.',
                  'Carries NDT tools such as a UT thickness gauge, plus a robotic arm, sonar and sampling tools.',
                ],
                show: ['Underwater robot in the Product reference'],
                ask: ['What structure, what depth, what visibility?', 'What do divers do for them today?'],
                next: 'Follow-up meeting with our NDT team.',
              },
            },
            {
              id: 'tubes',
              label: 'Heat exchanger, boiler or fin-fan tubes',
              answer: {
                say: 'Yes, with IRIS: an ultrasonic probe measures the wall thickness of every tube from the inside.',
                facts: [
                  'Finds corrosion, erosion, pitting and wall loss on the inner and outer surface.',
                  'Tubes must be cleaned and filled with water; done during a shutdown.',
                  'Very accurate sizing: often used to confirm what faster screening (eddy current, RFET) finds.',
                ],
                show: ['IRIS counter on the booth'],
                ask: ['How many bundles and tubes? Material?', 'When is the shutdown?'],
                next: 'Follow-up meeting with our NDT team.',
              },
            },
          ],
        },
      },
      {
        id: 'ut',
        q: 'Can a drone measure thickness (UT)?',
        answer: {
          say: 'Yes. Contact drones press a UT probe against the surface and take spot thickness readings, without scaffolding or rope access.',
          facts: [
            'Voliro T: stable contact on vertical, inclined and overhead surfaces, up to 30 N contact force; UT, EMAT, PEC and DFT payloads.',
            'Elios 3 also has a UT payload for confined spaces.',
            'Spot UT on tank walls and roofs, beams, boiler wall tubes.',
          ],
          proof: ['ADNOC Offshore: UT measurement of caisson legs and void spaces.', 'Equate (Kuwait): UT using Voliro on several pipes.'],
          show: ['Voliro T: measure on the calibration block'],
          ask: ['Which structure and how many points?', 'Which UT method do they use today?'],
          next: 'On-site POC: a few UT points on one asset.',
        },
      },
      {
        id: 'shutdown',
        q: 'Do we need a shutdown?',
        answer: {
          say: 'It depends on the method. Many external inspections and radiography screening are done in operation; internal inspections need a shutdown, but no human entry.',
          facts: [
            'No shutdown: external visual and thermal (flares, stacks, structures), digital RT / ART crawler (lines stay in service).',
            'Shutdown, gas-free: internal confined space inspection (Elios 3), IRIS tube inspection.',
          ],
          ask: ['When is your next shutdown?', 'What would you inspect online if you could?'],
        },
      },
      {
        id: 'why',
        q: 'Why a drone instead of scaffolding or rope access?',
        answer: {
          say: 'Safer, faster and cheaper: nobody works at height or enters a confined space, and you get better data.',
          facts: [
            'Removes the need for inspectors at height or in hazardous spaces (toxic gas, heat, unstable structures).',
            'Covers large areas in a fraction of the time of manual inspection.',
            'Greatly reduces scaffolding, ladders, cranes and other access equipment.',
            'High-resolution images, thermal data and 3D models, repeatable for comparison over time.',
          ],
          next: 'Offer an on-site POC so they can compare with their current method.',
        },
      },
      {
        id: 'report',
        q: 'What report do I get?',
        answer: {
          say: 'A full inspection report with the images, findings and their location; we have sample reports to show.',
          show: ['Sample reports in the Service materials table: flare, OHL, pipeline, confined space'],
          ask: ['Which report format or standard does their integrity team use?'],
          next: 'Send a sample report after ADIPEC.',
        },
      },
      PRICE('assets, access and reporting needs'),
      PERMITS,
      OTHER,
    ],
  },
  {
    id: 'surveillance',
    label: 'Surveillance',
    questions: [
      {
        id: 'how',
        q: 'How does it work?',
        answer: {
          say: 'The drone streams live video to your control room or command center, for security patrols, safety checks and emergencies.',
          facts: [
            'Fixed wing for large areas such as pipelines (AheadX QP530: up to 2 h endurance, 60 km radius, 30x zoom + IR).',
            'Multirotor for small areas: facilities, plants, complexes.',
            'Live sharing to any viewer with Terra Stream.',
          ],
          show: ['Wellhead Surveillance video', 'AheadX QP530 in the Product reference'],
          ask: ['What area: a plant, or a long pipeline?', 'Who watches the video today, and where?'],
          next: 'Follow-up meeting; offer a demo flight.',
        },
      },
      {
        id: 'night',
        q: 'Does it work at night?',
        answer: {
          say: 'Yes. Our surveillance drones carry an infra-red thermal camera for night operation, next to the zoom camera.',
          next: 'Offer a demo flight.',
        },
      },
      {
        id: 'auto',
        q: 'Can it run automatically, without a pilot on site?',
        answer: {
          say: 'Yes, with a drone-in-a-box. DJI Dock 4 flies scheduled patrols 24/7 from the site and is managed remotely.',
          facts: [
            'Automatic battery swap: back in the air within about a minute.',
            'DJI FlightHub 2: remote mission scheduling, live view, real-time AI alerts by SMS / email / push.',
            'Built for harsh sites: −40 °C to +50 °C, IP56.',
            'Remote operations need the right permits; we know the process and handle it.',
          ],
          show: ['DJI Dock 4 on the booth: open and close it, show the battery swap'],
          ask: ['How many sites, and how far apart?', 'What should it detect: intruders, leaks, vehicles?'],
          next: 'Follow-up meeting to plan a pilot site.',
        },
      },
      {
        id: 'done',
        q: 'Have you done this before?',
        answer: {
          say: 'Yes, for ADNOC Onshore.',
          proof: ['ADNOC Onshore: more than 3,000 km of in-field security patrolling.', 'ADNOC Onshore: in-field patrol report (Service materials).'],
          show: ['In-field patrol sample report and Wellhead Surveillance video'],
        },
      },
      {
        id: 'emergency',
        q: 'Can it help in an emergency?',
        answer: {
          say: 'Yes. A drone is often the fastest first responder: it gives the command center real-time video of the incident before people are sent in.',
          ask: ['Who runs their emergency response today?'],
          next: 'Invite them to the demo day.',
        },
      },
      PRICE('area, hours and how you want to watch the video'),
      PERMITS,
      OTHER,
    ],
  },
  {
    id: 'methane',
    label: 'Gas leak & methane monitoring',
    questions: [
      {
        id: 'how',
        q: 'How do you detect leaks?',
        answer: {
          say: 'A drone with a gas detector flies over the site and sends the data in real time, so leaks are found quickly without sending people into the area.',
          facts: ['Real-time data collection and transmission.', 'No exposure of personnel to potential risks.'],
          show: ['Falcon Methane Gas Detection video (Service materials)'],
          ask: ['Which sites, and how often do they survey today?', 'Handheld LDAR, fixed sensors, or nothing yet?'],
          next: 'Follow-up meeting; offer a POC on one site.',
        },
      },
      {
        id: 'ogmp',
        q: 'Does it help with OGMP 2.0 / emissions reporting?',
        answer: {
          say: 'Yes, we already monitor methane emissions for OGMP for ADNOC Gas.',
          proof: [
            'ADNOC Gas: methane emission monitoring for OGMP in Fujairah, Das Island and Habshan.',
            'ADNOC Onshore: methane gas detection on BAB & Bu Hasa fields.',
          ],
          show: ['ADNOC Onshore BAB sample report (Service materials)'],
          ask: ['Which OGMP level are they aiming for?', 'Who owns emissions reporting in their company?'],
          next: 'Follow-up meeting with their emissions / HSE team.',
        },
      },
      {
        id: 'report',
        q: 'What do we get?',
        answer: {
          say: 'A comprehensive report: geotagged data, aerial images and a detailed analysis of every detected leak, for your asset integrity records.',
          show: ['ADNOC Onshore BAB sample report'],
          next: 'Send the sample report after ADIPEC.',
        },
      },
      PRICE('sites and how often they need to be surveyed'),
      PERMITS,
      OTHER,
    ],
  },
  {
    id: 'training',
    label: 'Training & consultancy',
    questions: [
      {
        id: 'train',
        q: 'Can you train our staff to fly drones?',
        answer: {
          say: 'Yes: from short workshops to a 2–3 month academy that covers drone operations completely.',
          facts: [
            'Training / workshops: how to operate drones and how to use them in their business.',
            'Academy (e.g. 2–3 months): complete knowledge of drone operations.',
            'Simulator training first: no risk to aircraft or people.',
          ],
          proof: ['ADNOC Onshore: drone pilot training for ADNOC personnel.'],
          show: ['Drone flight simulator on the booth: let them try it'],
          ask: ['How many people, and what level?', 'What will they use drones for?'],
          next: 'Send a training proposal after ADIPEC.',
        },
      },
      {
        id: 'program',
        q: 'Can you help us set up our own drone program?',
        answer: {
          say: 'Yes. Our consultancy helps you build an internal drone program: choosing the right drones, meeting compliance requirements and setting up operations.',
          proof: ['ADNOC Onshore Drone Center: we run it, including training and drone purchasing.'],
          ask: ['Where are they today: no drones, a few pilots, or a program to scale?'],
          next: 'Follow-up meeting with a director.',
        },
      },
      {
        id: 'license',
        q: 'How do we get licensed in the UAE?',
        answer: {
          say: 'We know the authorization process well and can guide you through it, and the training prepares pilots for it.',
          facts: ['Authorities: MOIAT, GCAA / DCAA, MOD, CICPA, etc.', 'All our own pilots are licensed and drones registered with GCAA and CICPA.'],
          next: 'Follow-up meeting.',
        },
      },
      PRICE('number of trainees and the goal of the program'),
      OTHER,
    ],
  },
  {
    id: 'selling',
    label: 'Buying drones',
    questions: [
      {
        id: 'buy',
        q: 'Can we buy drones from you?',
        answer: {
          say: 'Yes. We are an official DJI Enterprise reseller, and we also sell our own fixed-wing drone technology.',
          proof: ['ADNOC Onshore: drone purchasing.'],
          ask: ['Which use case?', 'Do they have licensed pilots, or do they also need training?'],
          next: 'Send a quotation after ADIPEC.',
        },
      },
      {
        id: 'which',
        q: 'Which drone should we buy?',
        follow: {
          q: 'What will they use it for?',
          options: [
            {
              id: 'map',
              label: 'Mapping and survey',
              answer: { say: 'DJI M400 with RTK (and a LiDAR payload for point clouds).', show: ['DJI M400 in the Product reference'], next: 'Quotation and training proposal.' },
            },
            {
              id: 'inspect',
              label: 'Visual and thermal inspection',
              answer: { say: 'DJI M400 with a zoom and thermal payload; up to 59 min flight time, IP55.', show: ['DJI M400 in the Product reference'], next: 'Quotation and training proposal.' },
            },
            {
              id: 'auto',
              label: 'Automated patrols, 24/7',
              answer: { say: 'DJI Dock 4 with the Matrice 5TD: drone-in-a-box with automatic battery swap.', show: ['DJI Dock 4 on the booth'], next: 'Follow-up meeting to plan a pilot site.' },
            },
            {
              id: 'confined',
              label: 'Confined space',
              answer: { say: 'Flyability Elios 3 (40 cm manhole); Avata INS for very narrow spaces.', show: ['Elios 3 in the Product reference'], next: 'Follow-up meeting.' },
            },
            {
              id: 'contact',
              label: 'Contact UT / NDT',
              answer: { say: 'Voliro T: contact inspection with UT, EMAT, PEC or DFT payloads.', show: ['Voliro T on the calibration block'], next: 'On-site POC.' },
            },
            {
              id: 'delivery',
              label: 'Delivery and logistics',
              answer: {
                say: 'DJI FlyCart 30 for heavy loads at short range (up to 35 kg); Rigitech Eiger for long range (up to 100 km, 3 kg).',
                show: ['FlyCart 30 and Rigitech Eiger in the Product reference'],
                next: 'Follow-up meeting.',
              },
            },
            {
              id: 'long',
              label: 'Long-range surveillance',
              answer: { say: 'AheadX QP530: VTOL fixed wing, up to 2 h, 60 km radius, 30x zoom + IR.', show: ['AheadX QP530 in the Product reference'], next: 'Follow-up meeting.' },
            },
          ],
        },
      },
      {
        id: 'service',
        q: 'Buy a drone, or use your service?',
        answer: {
          say: 'Both work. Service is fastest when you need results now, with our licensed pilots and permits. Buying makes sense for frequent, routine flights, and we can train your team and help set up the program.',
          ask: ['How often would they fly?', 'Do they have licensed pilots today?'],
          next: 'Follow-up meeting to compare both options.',
        },
      },
      PRICE('use case and quantities'),
      OTHER,
    ],
  },
]
