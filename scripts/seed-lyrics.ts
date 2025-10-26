import { storage } from '../server/storage';

// Sample lyrics data
const sampleLyrics = [
  {
    title: "Warning Shots",
    content: `Warning shots fired, no retreat, no surrender
    Words cut deep like December's cold splendor
    Bars heavy, gravity bending the spectrum
    Check the vectors, my trajectory's electoral

    [Chorus]
    Warning shots echo through the night
    Truth in every word that I write
    Can't silence what's meant to ignite
    Warning shots, bringing dark to light

    [Verse 2]
    Metaphysical, lyrical, spiritual ammunition
    Every syllable critical, traditional composition
    Flipping scripts like encryption, description's my addiction
    Fiction? Nah, this is non-fiction jurisdiction

    Breaking barriers, various scenarios I'm crafting
    Rafting through the rapids, mapping out what's happening
    Captains of industry trying to capture my energy
    Centrifugally spinning, winning's my only remedy`,
    metadata: {
      track: "Warning Shots",
      album: "Singles",
      category: "conscious-rap",
      url: "https://aetherscrolls.pages.dev/singles/warning-shots"
    }
  },
  {
    title: "Full Disclosure",
    content: `Full disclosure, no composure when I enter
    Center of attention, dimension bender, remember
    September's agenda, defender of the rejected
    Protected intellect, respected, never neglected

    [Chorus]
    Full disclosure, cards on the table
    No fables, just facts from the cable
    Unable to disable what I'm able
    To say, full disclosure, break the label

    [Verse 2]
    Transparency, apparently a rarity
    Clarity in my sincerity, tearing through disparities
    Charities start with honesty, modesty's a policy
    But honestly, monopolies on truth? That's an oddity

    Speaking freely, completely, no deletion
    Completion of my mission, admission of my vision
    Precision in decision, incision through division
    Revision? Nah, this is the final edition`,
    metadata: {
      track: "Full Disclosure",
      album: "Singles",
      category: "conscious-rap",
      url: "https://aetherscrolls.pages.dev/singles/full-disclosure"
    }
  },
  {
    title: "Shadow Banned",
    content: `Shadow banned but still standing, commanding attention
    Intention to mention the tension in this dimension
    Suspension of comprehension, extension of suppression
    Expression through progression, teaching through each lesson

    [Chorus]
    Shadow banned but the light breaks through
    Can't hide the truth when the truth is due
    View from the shadows shows a different hue
    Shadow banned but I'm coming through

    [Verse 2]
    Algorithm's rhythm got 'em living in a prison
    Vision limited, prohibited, inhibited transmission
    Admission of omission, commission of division
    Precision in the system, wisdom through collision

    Underground sound, profound, unbound by the mainstream
    Dream team supreme, gleam through the smokescreen
    Seen what they mean, lean into the unseen
    Clean slate debate, create fate, that's my regime`,
    metadata: {
      track: "Shadow Banned",
      album: "Phase II",
      category: "conscious-rap",
      url: "https://aetherscrolls.pages.dev/phase2/shadow-banned"
    }
  },
  {
    title: "The Reckoning",
    content: `The reckoning beckoning, second-guessing's lessening
    Blessing every lesson, progressing through the questioning
    Festering suggestions, congestion of deception
    Reception of perception, inception to conception

    [Chorus]
    The reckoning is here, crystal clear
    No fear when the end is near
    Persevere through another year
    The reckoning, time to interfere

    [Verse 2]
    Calculations, implications of the revelations
    Foundations of nations shaking from vibrations
    Creations of sensations, citations of ovations
    Translations of rotations, causation correlations

    Time's up, climb up, line up for the finale
    Rally in the valley, tally up the folly
    Volley after volley, holy monopoly
    Possibly an odyssey, honestly, it's prophecy`,
    metadata: {
      track: "The Reckoning",
      album: "The Reckoning",
      category: "conscious-rap",
      url: "https://aetherscrolls.pages.dev/reckoning/the-reckoning"
    }
  },
  {
    title: "Digital Prophets",
    content: `Digital prophets, profit off the process
    Progress through the congress of the conscious
    Subconscious downloads, overloads, episodes
    Code flows, soul shows through the windows

    [Chorus]
    Digital prophets speak in binary
    Primary library of the diary
    Fiery inquiry, no expiry
    Digital prophets, modern day piracy

    [Verse 2]
    Encrypted scripted, gifted, shifted, lifted
    Drifted through the gifted, sifted, twisted
    Listed as restricted, predicted, conflicted
    Addicted to the fiction, conviction, benediction

    Servers as preservers, observers, fervor
    Merger of the cursor, parser, traverser
    Disperser of the curser, rehearser, reverser
    Nurser of the verser, universe disperser`,
    metadata: {
      track: "Digital Prophets",
      album: "The Mixtape Sessions",
      category: "cyber-rap",
      url: "https://aetherscrolls.pages.dev/mixtape/digital-prophets"
    }
  },
  {
    title: "Martyr Mechanism",
    content: `Martyr mechanism, schism through the prism
    Wisdom through the system, rhythm of the victim
    Dictum, symptom of the kingdom's wisdom
    Freedom through the anthem, phantom, random

    [Chorus]
    Martyr mechanism, gears keep turning
    Learning through the burning, yearning
    Discerning what's concerning, earning
    Martyr mechanism, no returning

    [Verse 2]
    Sacrifice the artifice, practice this, activist
    Catalyst, analyst, panelist, finalist
    Rationalist, naturalist, fatalist, specialist
    Generalist, federalist, medalist, vocalist

    Systematic, automatic, static, dramatic
    Pragmatic, enigmatic, symptomatic, chromatic
    Diplomatic, aristocratic, democratic, erratic
    Emphatic, mathematic, systematic, climactic`,
    metadata: {
      track: "Martyr Mechanism",
      album: "Phase II",
      category: "conscious-rap",
      url: "https://aetherscrolls.pages.dev/phase2/martyr-mechanism"
    }
  },
  {
    title: "Behold A Pale Horse",
    content: `Behold a pale horse, force through the source
    Course correction, resurrection, no remorse
    Endorse the discourse, resource of the force
    Divorce from the norm, transform, reinforce

    [Chorus]
    Behold a pale horse riding through
    True view of what we're coming to
    Due clues in the morning dew
    Behold a pale horse, breaking through

    [Verse 2]
    Apocalyptic, cryptic, mystic, linguistic
    Realistic, holistic, artistic, ballistic
    Statistic, sadistic, simplistic, logistic
    Optimistic, futuristic, characteristic, ritualistic

    Revelation, innovation, preservation, observation
    Conversation, transformation, information, reformation
    Dedication, medication, education, liberation
    Celebration, generation, constellation, destination`,
    metadata: {
      track: "Behold A Pale Horse",
      album: "The Reckoning",
      category: "apocalyptic-rap",
      url: "https://aetherscrolls.pages.dev/reckoning/pale-horse"
    }
  },
  {
    title: "Milabs",
    content: `Milabs, mind traps, perhaps we overlap
    Synapse collapse, relapse, maps of the gaps
    Caps on the facts, tax on the acts
    Contracts, impacts, artifacts, parallax

    [Chorus]
    Milabs, military industrial complex
    Perplex, reflex, what comes next?
    Context, subtext, ancient hex
    Milabs, connecting all the specs

    [Verse 2]
    Classified, magnified, identified, verified
    Terrified, justified, modified, amplified
    Simplified, purified, glorified, fortified
    Satisfied? Pacified, nullified, crucified

    Operations, accusations, investigations, revelations
    Implications, publications, ramifications, organizations
    Experimentations, documentations, representations
    Manipulations, installations, configurations, explanations`,
    metadata: {
      track: "Milabs",
      album: "Singles",
      category: "conspiracy-rap",
      url: "https://aetherscrolls.pages.dev/singles/milabs"
    }
  },
  {
    title: "Everlight",
    content: `Everlight, shining bright through the night
    Sight beyond sight, might of the right
    Flight to new height, tight grip on the light
    Write what's right, fight the good fight

    [Chorus]
    Everlight, eternal flame
    Never the same, playing the game
    Frame by frame, stake your claim
    Everlight, remember the name

    [Verse 2]
    Luminescent, effervescent, incandescent presence
    Essence of lessons, blessings, expressions
    Impressions, progressions, sessions, confessions
    Possessions, obsessions, recessions, successions

    Illuminate, ruminate, culminate, fascinate
    Demonstrate, concentrate, penetrate, contemplate
    Celebrate, accelerate, generate, perpetuate
    Radiate, meditate, levitate, emanate`,
    metadata: {
      track: "Everlight",
      album: "The Mixtape Sessions",
      category: "spiritual-rap",
      url: "https://aetherscrolls.pages.dev/mixtape/everlight"
    }
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding database with sample lyrics...');
  
  try {
    for (const lyric of sampleLyrics) {
      const document = await storage.createDocument({
        title: lyric.title,
        content: lyric.content,
        metadata: lyric.metadata,
        embedding: null // In production, this would be generated using an embedding model
      });
      console.log(`✅ Added: ${document.title}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${sampleLyrics.length} lyrics documents!`);
    console.log('\n📚 Available tracks:');
    sampleLyrics.forEach(l => {
      console.log(`  - ${l.title} (${l.metadata.album})`);
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if executed directly
seedDatabase().then(() => {
  console.log('\n✨ Seeding complete!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

export { seedDatabase, sampleLyrics };