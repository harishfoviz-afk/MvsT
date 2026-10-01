import { BookTheme } from '../../types/book';

export interface WordDefinition {
  word: string;
  icon: string;
  imageUrl?: string;
  phonetic: string;
  syllables?: string;
  partOfSpeech?: string;
  category: string;
  definition: string;
  exampleSentence?: string;
  rhymesWith?: string[];
  funFact: string;
  theme: BookTheme;
}

export interface EnrichedWordDefinition extends WordDefinition {
  syllables: string;
  partOfSpeech: string;
  exampleSentence: string;
  rhymesWith: string[];
}

// Comprehensive dictionary for age-appropriate kids vocabulary across themes
export const WORD_DICTIONARY: Record<string, WordDefinition> = {
  // --- ANIMALS ---
  BEE: {
    word: 'BEE',
    icon: '🐝',
    phonetic: '[bee]',
    category: 'Insects & Pollinators',
    definition: 'A hardworking insect with fuzzy yellow and black stripes that collects flower nectar and makes sweet golden honey!',
    funFact: 'Bees communicate with their hive friends by doing a special little waggle dance! 🌸',
    theme: 'animals',
  },
  FOX: {
    word: 'FOX',
    icon: '🦊',
    phonetic: '[foks]',
    category: 'Woodland Animals',
    definition: 'A clever and agile animal with reddish-orange fur, pointy ears, and a big bushy tail called a brush.',
    funFact: 'Foxes have super-hearing and can even hear tiny mice squeaking beneath deep winter snow! ❄️',
    theme: 'animals',
  },
  MULE: {
    word: 'MULE',
    icon: '🐴',
    phonetic: '[myool]',
    category: 'Farm & Working Animals',
    definition: 'A strong, sure-footed working animal that is the child of a horse and a donkey, famous for carrying packs up mountains.',
    funFact: 'Mules have incredible memories and can remember other animals and trails for many years! 🏔️',
    theme: 'animals',
  },
  SWAN: {
    word: 'SWAN',
    icon: '🦢',
    phonetic: '[swon]',
    category: 'Waterfowl',
    definition: 'A large, graceful water bird with pure snowy feathers and a long, elegant curved neck that glides across lakes.',
    funFact: 'Swans often stay with their best friend partner for their entire lives! 💕',
    theme: 'animals',
  },
  BULL: {
    word: 'BULL',
    icon: '🐂',
    phonetic: '[bool]',
    category: 'Farm Animals',
    definition: 'A powerful male cattle animal with strong curved horns, known for guarding and protecting the farm herd.',
    funFact: 'Bulls are actually color-blind to red; they only react to the movement of the cloth! 🚩',
    theme: 'animals',
  },
  CAT: {
    word: 'CAT',
    icon: '🐱',
    phonetic: '[kat]',
    category: 'Pets & Felines',
    definition: 'A gentle, furry companion with soft paws, sharp claws, and whiskers that loves to purr when happy.',
    funFact: 'Cats can jump up to six times their own height in a single leap! 🐾',
    theme: 'animals',
  },
  DOG: {
    word: 'DOG',
    icon: '🐶',
    phonetic: '[dawg]',
    category: 'Pets & Canines',
    definition: 'A loyal, friendly four-legged friend who loves to wag their tail, play fetch, and protect their human family.',
    funFact: 'Every dog has a completely unique nose print, just like human fingerprints! 👃',
    theme: 'animals',
  },
  LION: {
    word: 'LION',
    icon: '🦁',
    phonetic: '[ly-uhn]',
    category: 'Big Cats',
    definition: 'Known as the King of the Jungle, a majestic big cat with a golden furry mane and a thunderous roar.',
    funFact: 'A lion roar is so loud and powerful that it can be heard over 5 miles away! 📢',
    theme: 'animals',
  },
  BEAR: {
    word: 'BEAR',
    icon: '🐻',
    phonetic: '[bair]',
    category: 'Forest Mammals',
    definition: 'A large, strong forest animal covered in thick fur that loves eating fresh berries, wild salmon, and sweet honey.',
    funFact: 'Some bears sleep for up to 7 months during winter hibernation without waking up! 💤',
    theme: 'animals',
  },
  FROG: {
    word: 'FROG',
    icon: '🐸',
    phonetic: '[frawg]',
    category: 'Amphibians',
    definition: 'A green amphibian with long springy legs for jumping high, webbed feet for swimming, and a quick sticky tongue.',
    funFact: 'Frogs drink water right through their skin instead of swallowing it through their mouth! 💧',
    theme: 'animals',
  },
  BIRD: {
    word: 'BIRD',
    icon: '🐦',
    phonetic: '[burd]',
    category: 'Winged Wildlife',
    definition: 'A feathered creature with two wings that builds cozy nests in trees and sings cheerful songs at sunrise.',
    funFact: 'Birds have hollow bones which make them light enough to soar high up into the clouds! ☁️',
    theme: 'animals',
  },
  DUCK: {
    word: 'DUCK',
    icon: '🦆',
    phonetic: '[duhk]',
    category: 'Water Birds',
    definition: 'A friendly water bird with a flat bill and webbed feet that makes cheerful quacking sounds as it waddles.',
    funFact: 'Ducks have waterproof feathers covered in a natural oil that keeps them completely dry in water! 🌊',
    theme: 'animals',
  },
  PIG: {
    word: 'PIG',
    icon: '🐷',
    phonetic: '[pig]',
    category: 'Farm Animals',
    definition: 'An intelligent farm animal with a cute curly tail, a round pink snout, and a habit of rolling in cool mud.',
    funFact: 'Pigs are among the smartest animals in the world and can even learn how to play simple video games! 🎮',
    theme: 'animals',
  },
  COW: {
    word: 'COW',
    icon: '🐮',
    phonetic: '[kow]',
    category: 'Farm Animals',
    definition: 'A peaceful farm animal that grazes on green pasture grass and gives us creamy, healthy milk.',
    funFact: 'Cows have best friends in their herd and get sad when they are separated from them! 🌾',
    theme: 'animals',
  },
  BAT: {
    word: 'BAT',
    icon: '🦇',
    phonetic: '[bat]',
    category: 'Nocturnal Flying Animals',
    definition: 'The only mammal on Earth capable of true flight, sleeping upside down in caves during daytime.',
    funFact: 'Bats use echolocation, bouncing sound waves off objects to "see" in total pitch darkness! 🌙',
    theme: 'animals',
  },
  OWL: {
    word: 'OWL',
    icon: '🦉',
    phonetic: '[owl]',
    category: 'Nocturnal Birds',
    definition: 'A wise nighttime hunting bird with giant forward-facing eyes and whisper-quiet wings that make no sound.',
    funFact: 'Owls can turn their heads almost all the way around—up to 270 degrees! 👀',
    theme: 'animals',
  },
  WOLF: {
    word: 'WOLF',
    icon: '🐺',
    phonetic: '[woolf]',
    category: 'Wild Canines',
    definition: 'A wild canine that lives and hunts together in a supportive family group called a pack, howling at the moon.',
    funFact: 'Wolves howl to talk to their family members and tell other packs where their territory is! 🌲',
    theme: 'animals',
  },
  SEAL: {
    word: 'SEAL',
    icon: '🦭',
    phonetic: '[seel]',
    category: 'Marine Mammals',
    definition: 'A sleek ocean mammal with smooth waterproof fur and flippers that allow it to perform underwater acrobatics.',
    funFact: 'Seals can sleep floating upright in the ocean like floating corks! 🌊',
    theme: 'animals',
  },
  DEER: {
    word: 'DEER',
    icon: '🦌',
    phonetic: '[deer]',
    category: 'Forest Wildlife',
    definition: 'A gentle, swift-running forest animal where males grow impressive branches of antlers on their heads every year.',
    funFact: 'Baby deer (fawns) are born with white camouflage spots to hide from predators in sunny forest patches! 🌿',
    theme: 'animals',
  },
  HARE: {
    word: 'HARE',
    icon: '🐇',
    phonetic: '[hair]',
    category: 'Grassland Mammals',
    definition: 'A fast-running cousin of the rabbit with long back legs and tall ears that help it leap across open fields.',
    funFact: 'Hares can sprint at incredible speeds up to 45 miles per hour to escape danger! ⚡',
    theme: 'animals',
  },
  APES: {
    word: 'APES',
    icon: '🦍',
    phonetic: '[ayps]',
    category: 'Primates',
    definition: 'Clever primates with nimble hands and expressive faces that live in rainforests and form tight family bonds.',
    funFact: 'Apes can learn sign language and use twigs and rocks as clever tools to solve problems! 🧠',
    theme: 'animals',
  },
  LYNX: {
    word: 'LYNX',
    icon: '🐱',
    phonetic: '[links]',
    category: 'Wild Cats',
    definition: 'A beautiful wild cat with tufted ears, a short bobtail, and huge furry paws that work like natural snowshoes.',
    funFact: 'The tufts of black hair on a lynx’s ears act like antennas to help them pinpoint faint sounds! 👂',
    theme: 'animals',
  },
  TIGER: {
    word: 'TIGER',
    icon: '🐅',
    phonetic: '[ty-ger]',
    category: 'Big Cats',
    definition: 'The largest wild cat on Earth, adorned with bold orange and black camouflage stripes, and an expert swimmer.',
    funFact: 'Just like human fingerprints, no two tigers in the world have the exact same stripe pattern! 🧡',
    theme: 'animals',
  },
  ZEBRA: {
    word: 'ZEBRA',
    icon: '🦓',
    phonetic: '[zee-bruh]',
    category: 'African Grasslands',
    definition: 'A wild cousin of the horse that lives on the African plains, famous for its dazzling black-and-white striped coat.',
    funFact: 'A zebra’s stripes confuse biting flies so the bugs can’t easily land on them! 🖤',
    theme: 'animals',
  },
  PANDA: {
    word: 'PANDA',
    icon: '🐼',
    phonetic: '[pan-duh]',
    category: 'Bears',
    definition: 'A lovable black-and-white bear native to mountain bamboo forests in China that spends its days munching leaves.',
    funFact: 'A giant panda can eat up to 38 kilograms of fresh bamboo stalks in a single day! 🎋',
    theme: 'animals',
  },
  RABBIT: {
    word: 'RABBIT',
    icon: '🐰',
    phonetic: '[rab-it]',
    category: 'Small Mammals',
    definition: 'A cute hopping animal with long twitchy ears, a soft cottontail, and a love for crunchy garden carrots.',
    funFact: 'When a rabbit is super happy and excited, it does a joyful leaping spin in the air called a "binky"! 🥕',
    theme: 'animals',
  },
  MONKEY: {
    word: 'MONKEY',
    icon: '🐒',
    phonetic: '[muhng-kee]',
    category: 'Primates',
    definition: 'A playful and agile creature that uses its flexible tail and grasping hands to swing through jungle branches.',
    funFact: 'Monkeys peel bananas from the bottom up—it is much easier and removes the bitter stringy bits! 🍌',
    theme: 'animals',
  },
  GIRAFFE: {
    word: 'GIRAFFE',
    icon: '🦒',
    phonetic: '[juh-raf]',
    category: 'Savannah Giants',
    definition: 'The tallest animal on land, with long slender legs, a spotted pattern, and a neck long enough to reach treetops.',
    funFact: 'A giraffe’s tongue is dark blueish-purple and over 18 inches long to protect it from sunburn! 👅',
    theme: 'animals',
  },
  TURTLE: {
    word: 'TURTLE',
    icon: '🐢',
    phonetic: '[tur-tl]',
    category: 'Reptiles',
    definition: 'An ancient reptile protected by a tough bony shell that serves as its built-in mobile shield and cozy home.',
    funFact: 'Some giant tortoises can live to be over 150 years old—older than your great-grandparents! 📜',
    theme: 'animals',
  },
  DOLPHIN: {
    word: 'DOLPHIN',
    icon: '🐬',
    phonetic: '[dol-fin]',
    category: 'Ocean Mammals',
    definition: 'A playful and remarkably smart ocean mammal that breathes air through a blowhole and clicks to communicate.',
    funFact: 'Dolphins sleep with only one eye closed and one half of their brain asleep at a time! 🌊',
    theme: 'animals',
  },
  EAGLE: {
    word: 'EAGLE',
    icon: '🦅',
    phonetic: '[ee-gl]',
    category: 'Birds of Prey',
    definition: 'A magnificent bird of prey with razor-sharp eyesight, broad majestic wings, and powerful hunting talons.',
    funFact: 'An eagle can spot a tiny rabbit running in an open field from over two miles away! 🔭',
    theme: 'animals',
  },
  KOALA: {
    word: 'KOALA',
    icon: '🐨',
    phonetic: '[koh-ah-luh]',
    category: 'Marsupials',
    definition: 'A cuddly Australian tree-dwelling marsupial with round fuzzy ears and a spoon-shaped nose that loves eucalyptus leaves.',
    funFact: 'Koalas sleep up to 20 hours a day tucked comfortably in tree branches! 🍃',
    theme: 'animals',
  },
  PENGUIN: {
    word: 'PENGUIN',
    icon: '🐧',
    phonetic: '[pen-gwin]',
    category: 'Flightless Birds',
    definition: 'A flightless bird dressed in a natural black-and-white tuxedo that waddles on ice and "flies" underwater.',
    funFact: 'Penguins huddle together in giant cooperative groups to keep each other warm against freezing blizzard winds! 🧊',
    theme: 'animals',
  },
  KANGAROO: {
    word: 'KANGAROO',
    icon: '🦘',
    phonetic: '[kang-guh-roo]',
    category: 'Marsupials',
    definition: 'A hopping Australian marsupial with powerful back legs, a balancing tail, and a cozy belly pouch for carrying babies.',
    funFact: 'A newborn baby kangaroo (called a joey) is only about the size of a single jellybean when born! 🍬',
    theme: 'animals',
  },

  // --- SPACE ---
  SUN: {
    word: 'SUN',
    icon: '☀️',
    phonetic: '[suhn]',
    category: 'Stars & Solar System',
    definition: 'The gigantic glowing yellow star at the very center of our solar system that provides Earth with warmth and light.',
    funFact: 'Over one million Earths could fit inside the sun! 🌟',
    theme: 'space',
  },
  MOON: {
    word: 'MOON',
    icon: '🌙',
    phonetic: '[moon]',
    category: 'Natural Satellites',
    definition: 'Earth’s rocky natural satellite that orbits our planet every 27 days and shines by reflecting bright sunlight.',
    funFact: 'Footprints left on the Moon by Apollo astronauts will stay there for millions of years because there is no wind! 🚀',
    theme: 'space',
  },
  STAR: {
    word: 'STAR',
    icon: '⭐',
    phonetic: '[stahr]',
    category: 'Astronomy',
    definition: 'A giant, blazing ball of burning gas located trillions of miles away that sparkles like a diamond in the night sky.',
    funFact: 'When you look at stars at night, you are actually looking back in time because light takes years to travel to Earth! 🔭',
    theme: 'space',
  },
  MARS: {
    word: 'MARS',
    icon: '🪐',
    phonetic: '[mahrz]',
    category: 'Planets',
    definition: 'Known as the Red Planet, the fourth planet from the sun with dusty iron soil and giant inactive volcanoes.',
    funFact: 'Mars is home to Olympus Mons, the largest volcano in the entire solar system—nearly three times taller than Mt. Everest! 🌋',
    theme: 'space',
  },
  EARTH: {
    word: 'EARTH',
    icon: '🌍',
    phonetic: '[urth]',
    category: 'Planets',
    definition: 'Our home planet, a vibrant blue-and-green marble covered in deep oceans, lush continents, and breathable air.',
    funFact: 'Earth is the only place in the universe currently known to support trees, flowers, puppies, and humans! 💙',
    theme: 'space',
  },
  COMET: {
    word: 'COMET',
    icon: '☄️',
    phonetic: '[kom-it]',
    category: 'Cosmic Objects',
    definition: 'A cosmic snowball made of frozen gases, rock, and dust that creates a glowing tail millions of miles long as it nears the sun.',
    funFact: 'Comet tails always point away from the sun, pushed by gentle solar radiation! ✨',
    theme: 'space',
  },
  ROCKET: {
    word: 'ROCKET',
    icon: '🚀',
    phonetic: '[rok-it]',
    category: 'Space Exploration',
    definition: 'A powerful vehicle with roaring thruster engines that shoots astronauts and probes into outer space beyond Earth’s gravity.',
    funFact: 'To escape Earth’s gravity, rockets must speed faster than 25,000 miles per hour! 💨',
    theme: 'space',
  },
  PLANET: {
    word: 'PLANET',
    icon: '🪐',
    phonetic: '[plan-it]',
    category: 'Astronomy',
    definition: 'A large, round celestial body that travels in an oval orbit around a star, like the eight planets in our solar system.',
    funFact: 'Mercury and Venus are the only planets in our solar system that do not have any moons! 🛰️',
    theme: 'space',
  },
  SATURN: {
    word: 'SATURN',
    icon: '🪐',
    phonetic: '[sat-urn]',
    category: 'Gas Giants',
    definition: 'The sixth planet from the sun, celebrated for its spectacular, sparkling rings made of countless orbiting ice chunks.',
    funFact: 'Saturn is so light compared to its size that if you had a bathtub big enough, it would float like a rubber duck! 🛁',
    theme: 'space',
  },
  GALAXY: {
    word: 'GALAXY',
    icon: '🌌',
    phonetic: '[gal-uhk-see]',
    category: 'Deep Space',
    definition: 'A gigantic swirling cosmic neighborhood made of billions of stars, planets, and cosmic dust clouds held by gravity.',
    funFact: 'Our galaxy is called the Milky Way, and it contains over 100 billion stars! 🥛',
    theme: 'space',
  },
  ASTRONAUT: {
    word: 'ASTRONAUT',
    icon: '👨‍🚀',
    phonetic: '[as-truh-nawt]',
    category: 'Space Explorers',
    definition: 'A brave space explorer trained to live, work, and conduct science experiments in microgravity aboard spacecraft.',
    funFact: 'In zero gravity, astronauts can float in their sleeping bags and grow up to two inches taller! 📏',
    theme: 'space',
  },

  // --- DINOSAURS ---
  FOSSIL: {
    word: 'FOSSIL',
    icon: '🦴',
    phonetic: '[fos-uhl]',
    category: 'Paleontology',
    definition: 'The preserved rocky remains, bones, or footprints of ancient creatures that lived millions of years ago.',
    funFact: 'Scientists called paleontologists use soft brushes and dental tools to carefully excavate fragile fossils! ⛏️',
    theme: 'dinosaurs',
  },
  BONE: {
    word: 'BONE',
    icon: '🦴',
    phonetic: '[bohn]',
    category: 'Anatomy',
    definition: 'Hard calcium structures inside an animal body that form a skeleton to give support and protect organs.',
    funFact: 'Some dinosaur leg bones were taller than an adult human and weighed hundreds of pounds! 🦖',
    theme: 'dinosaurs',
  },
  EGG: {
    word: 'EGG',
    icon: '🥚',
    phonetic: '[eg]',
    category: 'Reproduction',
    definition: 'An oval shell laid by dinosaurs, birds, and reptiles where a baby animal grows safely until hatching time.',
    funFact: 'The largest dinosaur eggs discovered were laid by titanosaurs and were bigger than bowling balls! 🎳',
    theme: 'dinosaurs',
  },
  CLAW: {
    word: 'CLAW',
    icon: '🐾',
    phonetic: '[klaw]',
    category: 'Anatomy',
    definition: 'A sharp, curved nail on a dinosaur’s foot or hand used for grasping, climbing, digging, or defense.',
    funFact: 'Velociraptors had a giant curved sickle claw on each foot that they kept pulled back off the ground! 🪝',
    theme: 'dinosaurs',
  },
  ROAR: {
    word: 'ROAR',
    icon: '📢',
    phonetic: '[rawr]',
    category: 'Sounds of Nature',
    definition: 'A loud, deep vocal sound made by fierce animals to communicate across vast valleys or announce their presence.',
    funFact: 'Some dinosaurs had hollow crests on their heads that worked like trumpets to make deep echoing horn sounds! 🎺',
    theme: 'dinosaurs',
  },
  RAPTOR: {
    word: 'RAPTOR',
    icon: '🦖',
    phonetic: '[rap-ter]',
    category: 'Theropods',
    definition: 'A speedy, feathered, two-legged dinosaur with sharp teeth and high intelligence that hunted in cooperative packs.',
    funFact: 'Raptors had feathers covering their bodies, showing that modern birds are their living descendants! 🪶',
    theme: 'dinosaurs',
  },
  ARMOR: {
    word: 'ARMOR',
    icon: '🛡️',
    phonetic: '[ahr-mer]',
    category: 'Defenses',
    definition: 'Tough bony plates, spikes, or shields covering an animal’s body to protect it from predator bites.',
    funFact: 'Ankylosaurus had armor so thick that even its eyelids were reinforced with bone! 🛡️',
    theme: 'dinosaurs',
  },
  JURASSIC: {
    word: 'JURASSIC',
    icon: '🌴',
    phonetic: '[joo-ras-ik]',
    category: 'Earth Eras',
    definition: 'A famous prehistoric time period when lush warm forests covered Earth and giant long-necked sauropods ruled the land.',
    funFact: 'During the Jurassic period, the continents were much closer together and there was no ice at the North or South poles! 🌍',
    theme: 'dinosaurs',
  },

  // --- UNDERWATER ---
  FISH: {
    word: 'FISH',
    icon: '🐟',
    phonetic: '[fish]',
    category: 'Marine Life',
    definition: 'A water-dwelling creature with scales and fins that breathes underwater by taking in oxygen through gills.',
    funFact: 'Fish communicate underwater through low buzzing sounds, vibrations, and glowing bioluminescence! 💡',
    theme: 'underwater',
  },
  CRAB: {
    word: 'CRAB',
    icon: '🦀',
    phonetic: '[krab]',
    category: 'Crustaceans',
    definition: 'A ten-legged sea creature with a hard outer shell and two strong pincers, famous for walking sideways on beaches.',
    funFact: 'If a crab loses a claw in a battle, it can slowly grow a brand-new one over time! 🦾',
    theme: 'underwater',
  },
  SHARK: {
    word: 'SHARK',
    icon: '🦈',
    phonetic: '[shahrk]',
    category: 'Ocean Predators',
    definition: 'A streamlined ocean predator with a skeleton made of flexible cartilage and multiple rows of self-replacing teeth.',
    funFact: 'Sharks have been swimming in Earth’s oceans for over 400 million years—older than dinosaurs and trees! 🌊',
    theme: 'underwater',
  },
  WHALE: {
    word: 'WHALE',
    icon: '🐋',
    phonetic: '[wayl]',
    category: 'Ocean Giants',
    definition: 'A magnificent warm-blooded ocean mammal that breathes air at the ocean surface and sings long melodic songs.',
    funFact: 'The Blue Whale is the largest animal to ever live on Earth—its tongue alone weighs as much as an entire elephant! 🐘',
    theme: 'underwater',
  },
  OCTOPUS: {
    word: 'OCTOPUS',
    icon: '🐙',
    phonetic: '[ok-tuh-poos]',
    category: 'Cephalopods',
    definition: 'A sea creature with eight suction-cup arms, three beating hearts, and blue blood that can change color like a chameleon.',
    funFact: 'An octopus has nine brains—one central brain and a mini-brain in each of its eight flexible arms! 🧠',
    theme: 'underwater',
  },
  CORAL: {
    word: 'CORAL',
    icon: '🪸',
    phonetic: '[kawr-uhl]',
    category: 'Reef Life',
    definition: 'Tiny sea animals that build colorful limestone underwater colonies, providing shelter for thousands of tropical fish.',
    funFact: 'The Great Barrier Reef is so vast that it can even be seen from outer space by astronauts! 🛰️',
    theme: 'underwater',
  },
  SURF: {
    word: 'SURF',
    icon: '🏄‍♂️',
    phonetic: '[serf]',
    category: 'Ocean Waves',
    definition: 'Foamy white waves that crest and tumble toward the beach, where playful dolphins splash and surfers glide!',
    funFact: 'Wave-riding was first invented thousands of years ago in ancient Polynesia as a royal ocean art! 🌊',
    theme: 'underwater',
  },
  DEEP: {
    word: 'DEEP',
    icon: '🫧',
    phonetic: '[deep]',
    category: 'Ocean Depths',
    definition: 'The mysterious, sunless parts of the sea far below the surface where glowing lanternfish and giant squids explore.',
    funFact: 'The deepest part of the ocean, the Mariana Trench, is deeper than Mount Everest is tall! 🏔️',
    theme: 'underwater',
  },
  SAND: {
    word: 'SAND',
    icon: '🏖️',
    phonetic: '[sand]',
    category: 'Seashore & Ocean Floor',
    definition: 'Tiny, silky-smooth grains of polished minerals and seashells that blanket the seabed and warm sunny beaches.',
    funFact: 'Some tropical beaches have pink, green, or even jet-black sand made from volcanic crystals! 🏝️',
    theme: 'underwater',
  },
  WAVE: {
    word: 'WAVE',
    icon: '🌊',
    phonetic: '[wayv]',
    category: 'Ocean Motion',
    definition: 'A swelling ridge of water created as energetic sea winds blow across the open ocean surface.',
    funFact: 'Tsunamis can travel across the deep ocean as fast as a jet airplane—over 500 miles per hour! ✈️',
    theme: 'underwater',
  },
  TIDE: {
    word: 'TIDE',
    icon: '🌊',
    phonetic: '[tyd]',
    category: 'Ocean Rhythms',
    definition: 'The rhythmic rise and fall of coastal ocean waters caused by the gravitational pull of the Moon and Sun.',
    funFact: 'Low tides reveal tide pools that become magical mini-aquariums filled with colorful starfish and hermit crabs! 🦀',
    theme: 'underwater',
  },
  CLAM: {
    word: 'CLAM',
    icon: '🦪',
    phonetic: '[klam]',
    category: 'Shellfish & Mollusks',
    definition: 'A two-shelled sea creature nestled in ocean sand that filters clean water and sometimes grows shiny pearls.',
    funFact: 'Giant clams living in tropical coral reefs can weigh over 400 pounds and live for over a century! 🦪',
    theme: 'underwater',
  },
  KELP: {
    word: 'KELP',
    icon: '🌿',
    phonetic: '[kelp]',
    category: 'Underwater Forests',
    definition: 'Towering golden-brown sea plants that form underwater forests, providing safe hideouts for sea otters and fish.',
    funFact: 'Giant kelp can grow up to two feet every single day under warm ocean sunshine! 🌱',
    theme: 'underwater',
  },
  SHELL: {
    word: 'SHELL',
    icon: '🐚',
    phonetic: '[shel]',
    category: 'Seashore Treasures',
    definition: 'A hard, decorative protective home built by sea snails and clams that washes ashore in beautiful spiral designs.',
    funFact: 'Listening closely to a large spiral seashell lets you hear ambient room sound echoing like roaring ocean waves! 🌊',
    theme: 'underwater',
  },
  DIVE: {
    word: 'DIVE',
    icon: '🤿',
    phonetic: '[dyv]',
    category: 'Ocean Exploration',
    definition: 'Plunging smoothly beneath the turquoise water with a mask and snorkel to observe colorful coral worlds.',
    funFact: 'Expert freedivers can hold their breath underwater for over 10 minutes without any scuba tanks! 🫧',
    theme: 'underwater',
  },
  BOAT: {
    word: 'BOAT',
    icon: '⛵',
    phonetic: '[boht]',
    category: 'Water Vessels',
    definition: 'A buoyant watercraft built to sail smoothly across rivers, lakes, and oceans carrying intrepid adventurers.',
    funFact: 'The oldest boat discovered on Earth was carved from a single hollowed-out tree trunk over 10,000 years ago! 🛶',
    theme: 'underwater',
  },
  STARFISH: {
    word: 'STARFISH',
    icon: '⭐',
    phonetic: '[stahr-fish]',
    category: 'Echinoderms',
    definition: 'A star-shaped sea creature with hundreds of tiny suction tube feet that glides across tidal rocks and coral reefs.',
    funFact: 'If a starfish loses an arm, it can slowly regrow a brand-new healthy arm in just a few months! ✨',
    theme: 'underwater',
  },
  SQUID: {
    word: 'SQUID',
    icon: '🦑',
    phonetic: '[skwid]',
    category: 'Cephalopods',
    definition: 'A lightning-fast swimmer with ten arms, two giant eyes, and a jet-propulsion siphon that zooms backward.',
    funFact: 'Squids can release a cloud of dark ink into the sea to confuse predators while they dash away! 💨',
    theme: 'underwater',
  },
  FIN: {
    word: 'FIN',
    icon: '🦈',
    phonetic: '[fin]',
    category: 'Marine Biology',
    definition: 'A wing-like aquatic limb that helps fish, dolphins, and sharks balance, steer, and propel through the sea.',
    funFact: 'A dolphin top dorsal fin has unique nicks and curves just like a human fingerprint! 🐬',
    theme: 'underwater',
  },
  GILL: {
    word: 'GILL',
    icon: '🐟',
    phonetic: '[gil]',
    category: 'Marine Biology',
    definition: 'The delicate breathing organ on the side of a fish that absorbs life-giving oxygen directly out of the water.',
    funFact: 'Whales and dolphins don’t have gills—they breathe fresh air above water just like you! 🐳',
    theme: 'underwater',
  },
  FOAM: {
    word: 'FOAM',
    icon: '🫧',
    phonetic: '[fohm]',
    category: 'Ocean Dynamics',
    definition: 'Frothy white bubbles formed along the shore when crashing ocean waves whip up sea water and minerals.',
    funFact: 'Sea foam is packed with millions of tiny microscopic air bubbles that tickle your feet when you wade in the waves! 🏖️',
    theme: 'underwater',
  },

  // --- FANTASY ---
  DRAGON: {
    word: 'DRAGON',
    icon: '🐉',
    phonetic: '[drag-uhn]',
    category: 'Mythical Beasts',
    definition: 'A legendary winged beast with shimmering scales, razor claws, and the wondrous power to breathe fiery sparks.',
    funFact: 'In ancient tales, dragons are famous for loving shiny gold coins, sparkling gemstones, and guarding treasures! 💎',
    theme: 'fantasy',
  },
  WIZARD: {
    word: 'WIZARD',
    icon: '🧙‍♂️',
    phonetic: '[wiz-erd]',
    category: 'Magic & Lore',
    definition: 'A wise scholar of enchantments who wears flowing robes and carries a magic staff to cast protective spells.',
    funFact: 'In fairy tales, wizards often keep clever owls, clever ravens, or magical cats as their magical companions! 🦉',
    theme: 'fantasy',
  },
  CASTLE: {
    word: 'CASTLE',
    icon: '🏰',
    phonetic: '[kas-uhl]',
    category: 'Kingdoms',
    definition: 'A grand stone fortress built with tall watchtowers, heavy oak gates, and a surrounding water moat for safety.',
    funFact: 'Many real medieval castles had spiral staircases built clockwise to give defending knights an advantage! ⚔️',
    theme: 'fantasy',
  },
  UNICORN: {
    word: 'UNICORN',
    icon: '🦄',
    phonetic: '[yoo-nuh-kawrn]',
    category: 'Mythical Beasts',
    definition: 'A gentle, magical horse with snowy white fur and a glowing spiral horn on its forehead that spreads kindness.',
    funFact: 'The unicorn is the official national animal of Scotland, celebrated as a symbol of wild beauty and strength! 🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    theme: 'fantasy',
  },
  POTION: {
    word: 'POTION',
    icon: '🧪',
    phonetic: '[poh-shuhn]',
    category: 'Alchemy & Magic',
    definition: 'A magical bubbly brew crafted from sparkling herbs, starlight drops, and enchanted spring water in a glass flask.',
    funFact: 'In fairy stories, drinking an invisible potion makes you see through objects like a friendly ghost! 🫧',
    theme: 'fantasy',
  },
  KNIGHT: {
    word: 'KNIGHT',
    icon: '🛡️',
    phonetic: '[nyt]',
    category: 'Kingdom Heroes',
    definition: 'A brave champion in shining metal armor who rides a faithful horse and vows to protect the kingdom with honor.',
    funFact: 'Knights had to learn good manners and poetry as well as swordplay, which was called the Code of Chivalry! 👑',
    theme: 'fantasy',
  },

  // --- JUNGLE ---
  PARROT: {
    word: 'PARROT',
    icon: '🦜',
    phonetic: '[pair-uht]',
    category: 'Rainforest Birds',
    definition: 'A brilliant tropical bird with rainbow feathers and a curved beak that can learn how to mimic human words.',
    funFact: 'Some African Grey parrots can learn hundreds of words and even count objects out loud! 🗣️',
    theme: 'jungle',
  },
  JAGUAR: {
    word: 'JAGUAR',
    icon: '🐆',
    phonetic: '[jag-wahr]',
    category: 'Rainforest Big Cats',
    definition: 'A magnificent spotted wild cat that reigns over the Amazon jungle, famous for being a powerful swimmer.',
    funFact: 'The name jaguar comes from an Indigenous word meaning "he who kills with one leap"! 🐾',
    theme: 'jungle',
  },
  SNAKE: {
    word: 'SNAKE',
    icon: '🐍',
    phonetic: '[snayk]',
    category: 'Reptiles',
    definition: 'A legless reptile that glides smoothly across the ground and uses its forked tongue to taste and smell the air.',
    funFact: 'Snakes shed their outer layer of skin all in one piece as they grow bigger and taller! 🌿',
    theme: 'jungle',
  },
  SLOTH: {
    word: 'SLOTH',
    icon: '🦥',
    phonetic: '[sloh-th]',
    category: 'Rainforest Tree Dwellers',
    definition: 'The most relaxed animal on Earth, hanging peacefully upside-down from rainforest branches all day long.',
    funFact: 'Sloths move so slowly that tiny green algae harmlessly grows on their fur, helping them blend into green leaves! 🍃',
    theme: 'jungle',
  },
  TOUCAN: {
    word: 'TOUCAN',
    icon: '🦜',
    phonetic: '[too-kan]',
    category: 'Canopy Birds',
    definition: 'A tropical bird famous for its gigantic, lightweight, rainbow-colored bill used to reach delicious tree fruit.',
    funFact: 'A toucan’s giant bill looks heavy, but it is filled with honeycomb air pockets and is surprisingly feather-light! 🍓',
    theme: 'jungle',
  },
};

// Comprehensive Junior Explorer Phonics, Syllables & Rhyme Database
export interface PhonicsDetails {
  syllables: string;
  partOfSpeech: string;
  exampleSentence: string;
  rhymesWith: string[];
}

export const WORD_PHONICS_MAP: Record<string, PhonicsDetails> = {
  // Animals
  BAT: {
    syllables: 'BAT (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'At twilight, a friendly brown bat swooped gracefully across the starry evening sky.',
    rhymesWith: ['CAT', 'HAT', 'MAT', 'FLAT'],
  },
  BEE: {
    syllables: 'BEE (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A busy honeybee buzzed happily from one bright yellow sunflower to another.',
    rhymesWith: ['SEE', 'TREE', 'FREE', 'THREE'],
  },
  SWAN: {
    syllables: 'SWAN (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A graceful white swan glided smoothly across the calm morning lake.',
    rhymesWith: ['DAWN', 'LAWN', 'FAWN'],
  },
  CAT: {
    syllables: 'CAT (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The playful orange cat purred softly as it curled up in a warm sunny patch on the rug.',
    rhymesWith: ['BAT', 'HAT', 'MAT', 'SAT'],
  },
  APES: {
    syllables: 'APES (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The young apes swung playfully through the lush green rainforest vines.',
    rhymesWith: ['CAPES', 'GRAPES', 'SHAPES'],
  },
  LYNX: {
    syllables: 'LYNX (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The stealthy lynx padded silently across the deep winter snow without sinking.',
    rhymesWith: ['WINKS', 'BLINKS', 'THINKS'],
  },
  FOX: {
    syllables: 'FOX (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A clever red fox bounded swiftly through the quiet autumn woods.',
    rhymesWith: ['BOX', 'ROCKS', 'SOCKS'],
  },
  MULE: {
    syllables: 'MULE (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The sturdy mountain mule carried supplies steadily up the steep rocky trail.',
    rhymesWith: ['COOL', 'POOL', 'RULE'],
  },
  BULL: {
    syllables: 'BULL (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The strong black bull watched peacefully over the herd in the green pasture.',
    rhymesWith: ['FULL', 'PULL', 'WOOL'],
  },
  DOG: {
    syllables: 'DOG (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The cheerful golden retriever wagged its tail and caught the flying red ball.',
    rhymesWith: ['FROG', 'LOG', 'JOG'],
  },
  LION: {
    syllables: 'LI-ON (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The majestic lion rested on a sun-warmed rock overlooking the golden savanna.',
    rhymesWith: ['IRON', 'SCION'],
  },
  BEAR: {
    syllables: 'BEAR (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The furry brown bear caught a silver fish splashing in the rushing mountain river.',
    rhymesWith: ['HARE', 'CARE', 'DARE', 'PEAR'],
  },
  FROG: {
    syllables: 'FROG (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A tiny green tree frog leaped from a lily pad into the cool pond with a splash.',
    rhymesWith: ['DOG', 'LOG', 'FOG'],
  },
  BIRD: {
    syllables: 'BIRD (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A cheerful red songbird chirped a sweet morning melody high in the oak tree.',
    rhymesWith: ['WORD', 'HERD', 'THIRD'],
  },
  DUCK: {
    syllables: 'DUCK (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A mother duck led her fluffy yellow ducklings across the pond in a tidy line.',
    rhymesWith: ['LUCK', 'TRUCK', 'BUCK'],
  },
  PIG: {
    syllables: 'PIG (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The cheerful pink piglet splashed happily in a cool mud puddle on the farm.',
    rhymesWith: ['BIG', 'DIG', 'TWIG'],
  },
  COW: {
    syllables: 'COW (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The gentle dairy cow munched sweet clover grass under the warm afternoon sun.',
    rhymesWith: ['NOW', 'HOW', 'BOW'],
  },
  OWL: {
    syllables: 'OWL (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A wise barn owl opened its wide golden eyes and hooted softly under the full moon.',
    rhymesWith: ['HOWL', 'GROWL', 'FOWL'],
  },
  WOLF: {
    syllables: 'WOLF (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The gray wolf stood on a snow-capped ridge and called proudly to its family pack.',
    rhymesWith: ['GULF'],
  },
  SEAL: {
    syllables: 'SEAL (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The sleek harbor seal did a playful underwater flip before popping its head up.',
    rhymesWith: ['REAL', 'MEAL', 'DEAL'],
  },
  DEER: {
    syllables: 'DEER (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A gentle young deer stepped quietly through the misty morning forest.',
    rhymesWith: ['CHEER', 'CLEAR', 'NEAR'],
  },
  HARE: {
    syllables: 'HARE (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A speedy snowshoe hare zipped across the meadow faster than the autumn wind.',
    rhymesWith: ['BEAR', 'CARE', 'FAIR'],
  },
  TIGER: {
    syllables: 'TI-GER (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The striped Bengal tiger slipped silently through the tall green jungle reeds.',
    rhymesWith: ['FIGHTER', 'WRITER'],
  },
  ZEBRA: {
    syllables: 'ZE-BRA (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A dazzling herd of striped zebras galloped across the wide African grassland.',
    rhymesWith: ['COBRA'],
  },
  PANDA: {
    syllables: 'PAN-DA (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The cuddly giant panda munched happily on fresh green bamboo stalks.',
    rhymesWith: ['GRANDMA'],
  },
  RABBIT: {
    syllables: 'RAB-BIT (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A fluffy bunny rabbit twitched its pink nose and nibbled a crunchy orange carrot.',
    rhymesWith: ['HABIT'],
  },
  MONKEY: {
    syllables: 'MON-KEY (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A lively little monkey swung by its tail to catch a ripe yellow banana.',
    rhymesWith: ['DONKEY'],
  },
  TURTLE: {
    syllables: 'TUR-TLE (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The patient sea turtle paddled gently through the warm tropical ocean currents.',
    rhymesWith: ['HURDLE'],
  },
  DOLPHIN: {
    syllables: 'DOL-PHIN (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A playful dolphin leaped high out of the sparkling blue waves with a joyful chirp.',
    rhymesWith: ['COFFIN'],
  },
  EAGLE: {
    syllables: 'EA-GLE (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The bald eagle circled gracefully high above the mountain peaks on broad wings.',
    rhymesWith: ['REGAL'],
  },
  PARROT: {
    syllables: 'PAR-ROT (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A colorful scarlet parrot flapped its rainbow wings and repeated a cheerful greeting.',
    rhymesWith: ['CARROT'],
  },
  KOALA: {
    syllables: 'KO-A-LA (3 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The sleepy gray koala hugged the eucalyptus branch and dozed in the breeze.',
    rhymesWith: ['IMPALA'],
  },
  PENGUIN: {
    syllables: 'PEN-GUIN (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The little emperor penguin waddled over the icy hill and slid down on its belly.',
    rhymesWith: ['DOLPHIN'],
  },
  FISH: {
    syllables: 'FISH (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A shiny silver fish darted between the waving underwater sea grasses.',
    rhymesWith: ['WISH', 'DISH'],
  },
  CRAB: {
    syllables: 'CRAB (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The red sand crab scuttled sideways to tuck itself safely into a tiny burrow.',
    rhymesWith: ['GRAB', 'LAB'],
  },
  ANT: {
    syllables: 'ANT (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A tiny worker ant carried a crumb twice its own size back to the anthill colony.',
    rhymesWith: ['PLANT', 'CANT'],
  },
  HEN: {
    syllables: 'HEN (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The speckled brown hen clucked gently while leading her chicks into the coop.',
    rhymesWith: ['PEN', 'TEN', 'MEN'],
  },
  GOAT: {
    syllables: 'GOAT (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A sure-footed mountain goat hopped expertly across the jagged rocky boulders.',
    rhymesWith: ['BOAT', 'COAT', 'FLOAT'],
  },

  // Space
  SUN: {
    syllables: 'SUN (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The warm golden sun shines bright rays of light down onto our planet Earth.',
    rhymesWith: ['FUN', 'RUN', 'ONE'],
  },
  MOON: {
    syllables: 'MOON (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The glowing silver moon lights up the quiet night sky like a friendly nightlight.',
    rhymesWith: ['SOON', 'NOON', 'SPOON'],
  },
  STAR: {
    syllables: 'STAR (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A twinkling diamond star sparked like a jewel in the deep velvety cosmos.',
    rhymesWith: ['FAR', 'CAR', 'JAR'],
  },
  MARS: {
    syllables: 'MARS (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The robotic exploration rover rolled across the dusty red craters of planet Mars.',
    rhymesWith: ['STARS', 'CARS', 'BARS'],
  },
  EARTH: {
    syllables: 'EARTH (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Planet Earth is our beautiful blue home, floating gracefully in the starry cosmos.',
    rhymesWith: ['BIRTH', 'WORTH'],
  },
  COMET: {
    syllables: 'COM-ET (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'An icy cosmic comet zoomed past the distant planets with a glowing vapor tail.',
    rhymesWith: ['ROCKET', 'POCKET'],
  },
  ORBIT: {
    syllables: 'OR-BIT (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The international space station travels in a smooth circular orbit high above Earth.',
    rhymesWith: ['DOORMAT'],
  },
  ROCKET: {
    syllables: 'ROCK-ET (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The tall space rocket blasted off with a trail of sparkling fire toward the moon.',
    rhymesWith: ['COMET', 'POCKET', 'LOCKET'],
  },
  PLANET: {
    syllables: 'PLAN-ET (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Saturn is a giant gas planet famous for its dazzling system of spinning rings.',
    rhymesWith: ['GRANITE'],
  },
  GALAXY: {
    syllables: 'GAL-AX-Y (3 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Our solar system spins peacefully inside the grand spiral arms of the Milky Way galaxy.',
    rhymesWith: ['MAJESTY', 'GRAVITY'],
  },
  ASTRONAUT: {
    syllables: 'AS-TRO-NAUT (3 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The brave astronaut floated weightlessly outside the space station to fix an antenna.',
    rhymesWith: ['JUGGERNAUT'],
  },
  TELESCOPE: {
    syllables: 'TEL-E-SCOPE (3 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Looking through the giant telescope, we could clearly see the valleys on the moon.',
    rhymesWith: ['MICROSCOPE', 'KALEIDOSCOPE'],
  },

  // Dinosaurs
  TREX: {
    syllables: 'T-REX (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The mighty T-Rex let out a thunderous roar that echoed across the ancient valley.',
    rhymesWith: ['FLEX', 'NEXT'],
  },
  FOSSIL: {
    syllables: 'FOS-SIL (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The young paleontologist discovered an ancient shell fossil preserved in solid rock.',
    rhymesWith: ['COLOSSAL'],
  },
  BONE: {
    syllables: 'BONE (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The giant dinosaur thigh bone was taller than a full-grown human explorer!',
    rhymesWith: ['STONE', 'CONE', 'ZONE'],
  },
  EGG: {
    syllables: 'EGG (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Inside the warm sandy nest, a baby dinosaur cracked open its speckled egg shell.',
    rhymesWith: ['LEG', 'BEG', 'PEG'],
  },
  VOLCANO: {
    syllables: 'VOL-CA-NO (3 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The prehistoric volcano puffed fluffy clouds of smoke high above the fern forest.',
    rhymesWith: ['PIANO'],
  },
  RAPTOR: {
    syllables: 'RAP-TOR (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The swift velociraptor sprinted with lightning speed on two feathered legs.',
    rhymesWith: ['CHAPTER', 'ADAPTOR'],
  },

  // Underwater
  CORAL: {
    syllables: 'COR-AL (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The vibrant coral reef looked like an enchanted underwater rainbow city.',
    rhymesWith: ['MORAL', 'FLORAL'],
  },
  WHALE: {
    syllables: 'WHALE (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A gigantic blue whale spouted a tall fountain of misty water into the ocean breeze.',
    rhymesWith: ['TALE', 'SAIL', 'TRAIL'],
  },
  SHARK: {
    syllables: 'SHARK (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The sleek reef shark glided peacefully past the sunlit underwater sea arches.',
    rhymesWith: ['PARK', 'DARK', 'BARK'],
  },
  OCEAN: {
    syllables: 'O-CEAN (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Gentle turquoise ocean waves splashed softly along the warm sandy shore.',
    rhymesWith: ['MOTION', 'POTION'],
  },
  REEF: {
    syllables: 'REEF (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Hundreds of tiny striped fish found a safe home in the colorful coral reef.',
    rhymesWith: ['CHIEF', 'BRIEF', 'LEAF'],
  },
  SURF: {
    syllables: 'SURF (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A friendly dolphin rode the crest of the sparkling blue ocean surf.',
    rhymesWith: ['TURF', 'SERF', 'SMURF'],
  },
  DEEP: {
    syllables: 'DEEP (1 syllable)',
    partOfSpeech: 'Adjective',
    exampleSentence: 'Submarines dive into the mysterious deep sea to explore glowing underwater trenches.',
    rhymesWith: ['KEEP', 'SLEEP', 'PEEP', 'SWEEP'],
  },
  SAND: {
    syllables: 'SAND (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Tiny hermit crabs scurry across the warm golden sand along the beach.',
    rhymesWith: ['LAND', 'HAND', 'BAND', 'GRAND'],
  },
  WAVE: {
    syllables: 'WAVE (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A cheerful turquoise wave splashed gently over the smooth colorful pebbles.',
    rhymesWith: ['BRAVE', 'CAVE', 'SAVE', 'PAVE'],
  },
  TIDE: {
    syllables: 'TIDE (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'When the low tide arrived, we explored the secret tide pools full of sea stars.',
    rhymesWith: ['RIDE', 'SIDE', 'GLIDE', 'WIDE'],
  },
  CLAM: {
    syllables: 'CLAM (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The sea otter cracked open a clam shell using a flat stone on its belly.',
    rhymesWith: ['JAM', 'RAM', 'SWAM', 'SLAM'],
  },
  KELP: {
    syllables: 'KELP (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Tall green kelp swayed like an enchanted underwater forest in the ocean current.',
    rhymesWith: ['HELP', 'YELP'],
  },
  SHELL: {
    syllables: 'SHELL (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The young explorer found a polished pink spiral shell resting on the shoreline.',
    rhymesWith: ['BELL', 'WELL', 'TELL', 'SPELL'],
  },
  DIVE: {
    syllables: 'DIVE (1 syllable)',
    partOfSpeech: 'Verb',
    exampleSentence: 'We put on our masks to dive down and count the striped clownfish.',
    rhymesWith: ['FIVE', 'ALIVE', 'DRIVE', 'HIVE'],
  },
  BOAT: {
    syllables: 'BOAT (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The wooden sailboat glided silently across the calm blue harbor.',
    rhymesWith: ['COAT', 'FLOAT', 'GOAT', 'MOAT'],
  },
  STARFISH: {
    syllables: 'STAR-FISH (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'An orange five-pointed starfish hugged the reef rock tight beneath the waves.',
    rhymesWith: ['CRAWLFISH'],
  },
  SQUID: {
    syllables: 'SQUID (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The quick little squid puffed a cloud of ink and darted into a sea cavern.',
    rhymesWith: ['SLID', 'KID', 'LID', 'BID'],
  },
  FIN: {
    syllables: 'FIN (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The dolphin cut through the water with its sleek dorsal fin.',
    rhymesWith: ['WIN', 'SPIN', 'CHIN', 'PIN'],
  },
  GILL: {
    syllables: 'GILL (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The little clownfish fluttered its gills to breathe clean fresh sea water.',
    rhymesWith: ['HILL', 'SPILL', 'CHILL', 'WILL'],
  },
  FOAM: {
    syllables: 'FOAM (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Lacy white sea foam drifted onto the sand with each breaking wave.',
    rhymesWith: ['ROAM', 'HOME', 'DOME', 'COMB'],
  },

  // Jungle
  JUNGLE: {
    syllables: 'JUN-GLE (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Warm tropical rain tapped gently on the giant green leaves of the jungle canopy.',
    rhymesWith: ['BUNGLE'],
  },
  TOUCAN: {
    syllables: 'TOU-CAN (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A curious toucan hopped between branches, showing off its giant rainbow bill.',
    rhymesWith: ['BLUE JAY'],
  },
  SLOTH: {
    syllables: 'SLOTH (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The sleepy three-toed sloth hung upside down and moved at a very peaceful pace.',
    rhymesWith: ['CLOTH', 'MOTH', 'BOTH'],
  },
  LEOPARD: {
    syllables: 'LEOP-ARD (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The spotted leopard rested gracefully along the high branch of a jungle tree.',
    rhymesWith: ['SHEPHERD'],
  },

  // Fantasy
  CASTLE: {
    syllables: 'CAS-TLE (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Flags fluttered proudly from the tall stone towers of the majestic mountain castle.',
    rhymesWith: ['VASSAL'],
  },
  DRAGON: {
    syllables: 'DRAG-ON (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'A friendly emerald dragon soared high above the clouds on glistening wings.',
    rhymesWith: ['WAGON', 'FLAGON'],
  },
  MAGIC: {
    syllables: 'MAG-IC (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'Golden sparkles of magic spun through the air and filled the room with wonder.',
    rhymesWith: ['TRAGIC'],
  },
  CROWN: {
    syllables: 'CROWN (1 syllable)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The golden royal crown was decorated with sparkling blue sapphires and red rubies.',
    rhymesWith: ['TOWN', 'DOWN', 'BROWN'],
  },
  CRYSTAL: {
    syllables: 'CRYS-TAL (2 syllables)',
    partOfSpeech: 'Noun',
    exampleSentence: 'The glowing purple crystal illuminated the secret cave with a warm magical light.',
    rhymesWith: ['PISTOL'],
  },
};

// Generic emoji map for themes when generating fallbacks
const THEME_FALLBACK_ICONS: Record<BookTheme, string[]> = {
  animals: ['🐾', '🦁', '🐻', '🦊', '🐰', '🐼', '🐯', '🐨'],
  space: ['🚀', '⭐', '🪐', '☄️', '🛰️', '🌌', '🔭', '☀️'],
  dinosaurs: ['🦖', '🦕', '🦴', '🥚', '🐾', '🌴', '🌋', '🌿'],
  fantasy: ['🪄', '🏰', '🐉', '👑', '💎', '🦄', '🧙', '✨'],
  underwater: ['🐬', '🐟', '🐙', '🦀', '🦈', '🪸', '🌊', '🐚'],
  jungle: ['🌴', '🐒', '🦜', '🐆', '🌿', '🐍', '🦥', '🍃'],
};

function estimateSyllables(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.length <= 3) return `${word} (1 syllable)`;
  const vowels = w.match(/[aeiouy]{1,2}/g);
  let count = vowels ? vowels.length : 1;
  if (w.endsWith('e') && !w.endsWith('le') && count > 1) {
    count--;
  }
  return `${word} (${count} syllable${count > 1 ? 's' : ''})`;
}

function getRhymeFamily(word: string): string[] {
  const w = word.toUpperCase().trim();

  // Expanded Phonetic Rhyme Families (Curated for kids reading fluency)
  if (w.endsWith('URF')) return ['TURF', 'SERF', 'SMURF'];
  if (w.endsWith('EEP')) return ['KEEP', 'SLEEP', 'PEEP', 'SWEEP'];
  if (w.endsWith('AND')) return ['LAND', 'HAND', 'BAND', 'GRAND'];
  if (w.endsWith('AVE')) return ['WAVE', 'BRAVE', 'CAVE', 'SAVE'];
  if (w.endsWith('IDE')) return ['TIDE', 'RIDE', 'SIDE', 'GLIDE'];
  if (w.endsWith('AM')) return ['CLAM', 'JAM', 'RAM', 'SLAM'];
  if (w.endsWith('ELP')) return ['HELP', 'YELP', 'KELP'];
  if (w.endsWith('ARK')) return ['SHARK', 'PARK', 'BARK', 'DARK'];
  if (w.endsWith('EEL') || w.endsWith('EAL')) return ['SEAL', 'MEAL', 'REAL', 'DEAL'];
  if (w.endsWith('IVE')) return ['DIVE', 'FIVE', 'ALIVE', 'DRIVE'];
  if (w.endsWith('OAT')) return ['BOAT', 'COAT', 'FLOAT', 'GOAT'];
  if (w.endsWith('IN')) return ['FIN', 'WIN', 'SPIN', 'CHIN'];
  if (w.endsWith('ILL')) return ['GILL', 'HILL', 'CHILL', 'SPILL'];
  if (w.endsWith('OAM')) return ['FOAM', 'ROAM', 'HOME', 'DOME'];
  if (w.endsWith('ID')) return ['SQUID', 'SLID', 'KID', 'LID'];
  if (w.endsWith('AB')) return ['CRAB', 'GRAB', 'SLAB', 'CAB'];
  if (w.endsWith('IP')) return ['SHIP', 'TRIP', 'DIP', 'FLIP'];
  if (w.endsWith('ISH')) return ['FISH', 'WISH', 'DISH', 'SWISH'];
  if (w.endsWith('AT')) return ['CAT', 'HAT', 'MAT', 'FLAT'];
  if (w.endsWith('EE')) return ['SEE', 'TREE', 'FREE', 'GLEE'];
  if (w.endsWith('OG')) return ['DOG', 'LOG', 'FROG', 'JOG'];
  if (w.endsWith('IG')) return ['BIG', 'DIG', 'PIG', 'TWIG'];
  if (w.endsWith('UN')) return ['SUN', 'FUN', 'RUN', 'ONE'];
  if (w.endsWith('AR')) return ['STAR', 'CAR', 'FAR', 'JAR'];
  if (w.endsWith('ET')) return ['NET', 'SET', 'PET', 'JET'];
  if (w.endsWith('ING')) return ['RING', 'WING', 'SING', 'KING'];
  if (w.endsWith('ALL')) return ['BALL', 'CALL', 'TALL', 'WALL'];
  if (w.endsWith('AY')) return ['PLAY', 'DAY', 'SAY', 'WAY'];
  if (w.endsWith('AN')) return ['CAN', 'FAN', 'MAN', 'PAN'];
  if (w.endsWith('OP')) return ['HOP', 'TOP', 'POP', 'STOP'];
  if (w.endsWith('OOK')) return ['BOOK', 'LOOK', 'COOK', 'HOOK'];
  if (w.endsWith('ACK')) return ['BACK', 'PACK', 'TRACK', 'BLACK'];
  if (w.endsWith('ELL')) return ['BELL', 'TELL', 'WELL', 'SPELL'];
  if (w.endsWith('EST')) return ['BEST', 'NEST', 'REST', 'WEST'];
  if (w.endsWith('OON')) return ['MOON', 'SOON', 'NOON', 'SPOON'];
  if (w.endsWith('ONE')) return ['BONE', 'STONE', 'CONE', 'ZONE'];
  if (w.endsWith('AW')) return ['CLAW', 'JAW', 'RAW', 'DRAW'];
  if (w.endsWith('ORN')) return ['HORN', 'THORN', 'CORN', 'BORN'];
  if (w.endsWith('OCK')) return ['ROCK', 'LOCK', 'CLOCK', 'DOCK'];
  if (w.endsWith('EAF') || w.endsWith('EEF')) return ['REEF', 'LEAF', 'CHIEF', 'BRIEF'];
  if (w.endsWith('AIR') || w.endsWith('ARE')) return ['HARE', 'BEAR', 'CARE', 'STARE'];
  if (w.endsWith('EAR') || w.endsWith('EER')) return ['DEER', 'PEER', 'NEAR', 'CHEER'];
  if (w.endsWith('EAK')) return ['BEAK', 'PEAK', 'SEEK', 'LEAK'];
  if (w.endsWith('OOL')) return ['POOL', 'COOL', 'TOOL', 'SCHOOL'];
  if (w.endsWith('AIN')) return ['RAIN', 'TRAIN', 'CHAIN', 'BRAIN'];
  if (w.endsWith('USH')) return ['BUSH', 'RUSH', 'CRUSH', 'BRUSH'];
  if (w.endsWith('ART')) return ['DART', 'PART', 'START', 'CHART'];
  if (w.endsWith('AMP')) return ['CAMP', 'CHAMP', 'LAMP', 'STAMP'];
  if (w.endsWith('ANG')) return ['FANG', 'BANG', 'RANG', 'HANG'];
  if (w.endsWith('UG')) return ['BUG', 'HUG', 'JUG', 'RUG'];
  if (w.endsWith('INE')) return ['VINE', 'PINE', 'LINE', 'FINE'];
  if (w.endsWith('EED')) return ['SEED', 'FEED', 'NEED', 'SPEED'];
  if (w.endsWith('OBE')) return ['ROBE', 'GLOBE', 'PROBE'];
  if (w.endsWith('APE')) return ['CAPE', 'TAPE', 'APE', 'SHAPE'];
  if (w.endsWith('ATE')) return ['GATE', 'LATE', 'SKATE', 'PLATE'];
  if (w.endsWith('AP')) return ['MAP', 'CAP', 'TRAP', 'CLAP'];
  if (w.endsWith('AG')) return ['FLAG', 'BAG', 'TAG', 'DRAG'];
  if (w.endsWith('OLD')) return ['GOLD', 'BOLD', 'COLD', 'HOLD'];
  if (w.endsWith('OOT')) return ['BOOT', 'ROOT', 'SUIT', 'SHOOT'];
  if (w.endsWith('EAM')) return ['BEAM', 'DREAM', 'STREAM', 'TEAM'];
  if (w.endsWith('OW')) return ['GLOW', 'SLOW', 'BLOW', 'FLOW'];
  if (w.endsWith('ATH')) return ['PATH', 'BATH', 'MATH'];
  if (w.endsWith('ERN')) return ['FERN', 'LEARN', 'TURN', 'BURN'];
  if (w.endsWith('OSS')) return ['MOSS', 'BOSS', 'TOSS', 'CROSS'];
  if (w.endsWith('OOD')) return ['WOOD', 'HOOD', 'GOOD'];
  if (w.endsWith('ARM')) return ['WARM', 'FARM', 'CHARM', 'STORM'];
  if (w.endsWith('AST')) return ['MAST', 'FAST', 'LAST', 'PAST'];
  if (w.endsWith('EET')) return ['MEET', 'SWEET', 'FEET', 'STREET'];

  // Smart phonetic ending extraction fallback
  const last2 = w.slice(-2);
  const commonRimes: Record<string, string[]> = {
    ED: ['RED', 'BED', 'SLED'],
    EN: ['PEN', 'TEN', 'HEN'],
    IT: ['HIT', 'FIT', 'SIT'],
    OT: ['HOT', 'POT', 'DOT'],
    UT: ['NUT', 'HUT', 'CUT'],
    OX: ['FOX', 'BOX', 'SOX'],
    UP: ['CUP', 'PUP', 'UP'],
  };
  if (commonRimes[last2]) return commonRimes[last2];

  // Dynamic fallback based on word ending rime
  const prefix = w.slice(0, 1) === 'S' ? 'B' : 'S';
  return [`${prefix}${w.slice(1)}`, `${w}ING`, `${w}ER`];
}

/**
 * Returns a child-friendly Junior Explorer Phonics & Vocabulary definition for any target word.
 */
export function getWordDefinition(word: string, theme: BookTheme = 'animals'): EnrichedWordDefinition {
  const cleanWord = word.trim().toUpperCase().replace(/[^A-Z]/g, '');

  const phonics = WORD_PHONICS_MAP[cleanWord];
  const syllables = phonics?.syllables || estimateSyllables(cleanWord);
  const partOfSpeech = phonics?.partOfSpeech || 'Noun';
  const exampleSentence = phonics?.exampleSentence || `The amazing ${cleanWord.toLowerCase()} is an exciting wonder of the ${theme} world!`;
  const rhymesWith = phonics?.rhymesWith || getRhymeFamily(cleanWord);

  // 1. Direct match in curated dictionary
  if (WORD_DICTIONARY[cleanWord]) {
    const item = WORD_DICTIONARY[cleanWord];
    return {
      ...item,
      syllables,
      partOfSpeech,
      exampleSentence,
      rhymesWith,
    };
  }

  // 2. Intelligent, context-aware fallback generator
  const fallbackIcons = THEME_FALLBACK_ICONS[theme] || THEME_FALLBACK_ICONS.animals;
  const hash = cleanWord.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const icon = fallbackIcons[hash % fallbackIcons.length];
  const phonetic = `[${cleanWord.toLowerCase()}]`;

  const themeDisplay = theme.charAt(0).toUpperCase() + theme.slice(1);
  const dynamicSentence = `Look closely at the puzzle to discover where ${cleanWord.toLowerCase()} is hiding in the ${theme} scene!`;
  const dynamicFunFact = `Did you know? Spotting words like ${cleanWord} sharpens your eagle eyes and makes you a certified junior ${theme} explorer! 🌟`;

  return {
    word: cleanWord,
    icon,
    phonetic,
    syllables,
    partOfSpeech,
    category: `${themeDisplay} Vocabulary`,
    definition: `A wonderful ${theme} exploration word! Discover how ${cleanWord.toLowerCase()} fits into our exciting ${theme} adventure puzzle.`,
    exampleSentence: phonics?.exampleSentence || dynamicSentence,
    rhymesWith,
    funFact: dynamicFunFact,
    theme,
  };
}
