import { AgeGroup, BookTheme } from '../../types/book';

export interface ColoringData {
  title: string;
  theme: BookTheme;
  difficulty: 'easy' | 'medium' | 'hard';
  svgArt: string;
  seed: number;
}

const COLORING_SCENES: Record<BookTheme, { title: string; easySvg: string; detailedSvg: string }[]> = {
  space: [
    {
      title: 'Rocket Journey to Saturn',
      easySvg: `
        <!-- Big Rocket -->
        <path d="M 250 80 C 275 140 280 230 280 320 L 220 320 C 220 230 225 140 250 80 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="250" cy="180" r="28" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Fins -->
        <path d="M 220 280 L 170 330 L 220 325 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <path d="M 280 280 L 330 330 L 280 325 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Thruster flames -->
        <path d="M 230 325 Q 250 400 250 400 Q 250 400 270 325" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Giant Saturn with rings -->
        <ellipse cx="110" cy="120" rx="35" ry="35" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <ellipse cx="110" cy="120" rx="60" ry="14" fill="none" stroke="#0f172a" stroke-width="4" transform="rotate(-20 110 120)" />
        <!-- Cute Smiling Moon -->
        <circle cx="400" cy="140" r="45" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="385" cy="130" r="5" fill="#0f172a" />
        <circle cx="415" cy="130" r="5" fill="#0f172a" />
        <path d="M 390 155 Q 400 170 410 155" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <!-- Stars -->
        <polygon points="120,380 126,395 142,395 130,405 134,420 120,410 106,420 110,405 98,395 114,395" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <polygon points="380,360 384,372 398,372 387,380 391,392 380,384 369,392 373,380 362,372 376,372" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `,
      detailedSvg: `
        <path d="M 250 60 C 285 130 290 240 290 340 L 210 340 C 210 240 215 130 250 60 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="250" cy="170" r="32" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="250" cy="170" r="24" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <line x1="210" y1="230" x2="290" y2="230" stroke="#0f172a" stroke-width="2" />
        <line x1="210" y1="280" x2="290" y2="280" stroke="#0f172a" stroke-width="2" />
        <path d="M 210 270 L 150 340 L 210 340 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <path d="M 290 270 L 350 340 L 290 340 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <path d="M 220 345 Q 235 430 250 450 Q 265 430 280 345" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="100" cy="120" r="40" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <ellipse cx="100" cy="120" rx="75" ry="18" fill="none" stroke="#0f172a" stroke-width="3" transform="rotate(-25 100 120)" />
        <circle cx="390" cy="130" r="50" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="120" cy="370" r="8" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
        <circle cx="210" cy="345" r="12" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      `
    },
    {
      title: 'Friendly Alien in Flying Saucer',
      easySvg: `
        <!-- UFO Glass Dome -->
        <path d="M 180 220 C 180 150 320 150 320 220 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Cute Alien Head -->
        <circle cx="250" cy="190" r="22" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <circle cx="240" cy="185" r="5" fill="#0f172a" />
        <circle cx="260" cy="185" r="5" fill="#0f172a" />
        <path d="M 243 198 Q 250 205 257 198" fill="none" stroke="#0f172a" stroke-width="2.5" />
        <!-- Antenna -->
        <line x1="250" y1="168" x2="250" y2="152" stroke="#0f172a" stroke-width="3" />
        <circle cx="250" cy="148" r="6" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <!-- UFO Disk Body -->
        <ellipse cx="250" cy="230" rx="140" ry="35" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Cockpit lights -->
        <circle cx="160" cy="235" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="205" cy="242" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="250" cy="245" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="295" cy="242" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="340" cy="235" r="9" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <!-- Light Beam -->
        <polygon points="180,260 120,410 380,410 320,260" fill="#ffffff" stroke="#0f172a" stroke-width="3" stroke-dasharray="8,6" />
        <!-- Stars -->
        <polygon points="90,100 95,112 108,112 97,120 101,132 90,124 79,132 83,120 72,112 85,112" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <polygon points="410,100 415,112 428,112 417,120 421,132 410,124 399,132 403,120 392,112 405,112" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `,
      detailedSvg: `
        <!-- Detailed UFO with tractor beam and alien city -->
        <path d="M 170 210 C 170 130 330 130 330 210 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <circle cx="250" cy="180" r="26" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <ellipse cx="250" cy="225" rx="150" ry="40" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <polygon points="170,260 100,420 400,420 330,260" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" stroke-dasharray="6,4" />
        <circle cx="100" cy="90" r="25" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <circle cx="400" cy="350" r="18" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      `
    },
    {
      title: 'Astronaut Walking on the Moon',
      easySvg: `
        <!-- Lunar Ground -->
        <path d="M 50 380 Q 250 340 450 380 L 450 430 L 50 430 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Lunar Craters -->
        <ellipse cx="140" cy="390" rx="30" ry="10" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <ellipse cx="360" cy="395" rx="40" ry="12" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <!-- Astronaut Helmet -->
        <circle cx="250" cy="180" r="45" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <ellipse cx="250" cy="180" rx="30" ry="20" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <!-- Astronaut Suit -->
        <path d="M 215 225 L 210 320 L 290 320 L 285 225 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Legs -->
        <rect x="210" y="320" width="30" height="50" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <rect x="260" y="320" width="30" height="50" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Flag -->
        <line x1="120" y1="260" x2="120" y2="380" stroke="#0f172a" stroke-width="4" />
        <polygon points="120,260 170,280 120,300" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
      `,
      detailedSvg: `
        <path d="M 40 370 Q 250 330 460 370 L 460 440 L 40 440 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="250" cy="170" r="48" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <ellipse cx="250" cy="170" rx="34" ry="22" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <path d="M 210 220 L 205 320 L 295 320 L 290 220 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <line x1="110" y1="240" x2="110" y2="370" stroke="#0f172a" stroke-width="3" />
        <polygon points="110,240 170,265 110,290" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
      `
    }
  ],
  dinosaurs: [
    {
      title: 'Stegosaurus by the Volcano',
      easySvg: `
        <path d="M 120 320 Q 220 200 360 270 Q 380 340 340 370 L 140 370 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <path d="M 120 320 Q 80 320 70 340 Q 90 360 120 350 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="85" cy="335" r="4" fill="#0f172a" />
        <polygon points="160,250 180,210 195,245" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <polygon points="210,230 235,185 255,225" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <polygon points="270,225 295,185 315,235" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <polygon points="325,245 345,215 355,260" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <rect x="150" y="360" width="30" height="50" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <rect x="290" y="360" width="35" height="50" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <polygon points="340,240 400,100 460,240" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <ellipse cx="400" cy="100" rx="15" ry="5" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <path d="M 390 90 Q 370 60 400 40 Q 430 40 430 70 Q 450 70 440 90 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <path d="M 40 370 Q 55 260 50 180" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
      `,
      detailedSvg: `
        <path d="M 110 320 Q 220 180 370 260 Q 400 340 350 370 L 130 370 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="210" cy="280" r="12" fill="none" stroke="#0f172a" stroke-width="2" />
        <polygon points="150,240 175,190 195,235" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <polygon points="205,215 235,160 260,210" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <polygon points="270,210 300,165 325,220" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <polygon points="335,230 360,195 375,250" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <line x1="375" y1="280" x2="415" y2="260" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <polygon points="330,250 395,90 470,250" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `
    },
    {
      title: 'Friendly Brontosaurus by the Lake',
      easySvg: `
        <!-- Big Round Dino Body -->
        <ellipse cx="280" cy="310" rx="90" ry="60" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Long Curved Neck -->
        <path d="M 200 310 C 170 220 160 120 220 90 C 240 90 250 110 240 130 C 210 180 230 250 240 300" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="230" cy="100" r="4" fill="#0f172a" />
        <!-- Legs -->
        <rect x="220" y="340" width="28" height="55" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <rect x="300" y="340" width="28" height="55" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Long Tail -->
        <path d="M 370 310 Q 450 310 430 250" fill="none" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
        <!-- Lake waves -->
        <path d="M 50 410 Q 90 395 130 410 Q 170 425 210 410 Q 250 395 290 410" fill="none" stroke="#0f172a" stroke-width="3" />
      `,
      detailedSvg: `
        <ellipse cx="280" cy="300" rx="95" ry="65" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <path d="M 195 300 C 165 210 155 110 220 80 C 240 80 250 100 240 125 C 210 175 230 245 240 295" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="230" cy="90" r="4" fill="#0f172a" />
        <rect x="215" y="340" width="28" height="60" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <rect x="305" y="340" width="28" height="60" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <path d="M 375 300 Q 460 300 440 235" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
      `
    }
  ],
  underwater: [
    {
      title: 'Dolphin & Coral Reef',
      easySvg: `
        <path d="M 120 280 C 180 180 320 180 380 230 C 430 270 410 310 360 300 C 280 290 200 320 150 330 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <path d="M 120 280 Q 90 290 85 305 Q 105 315 130 305" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="130" cy="285" r="4" fill="#0f172a" />
        <path d="M 260 200 Q 280 150 305 175 Q 290 205 275 205" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="110" cy="220" r="14" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="130" cy="180" r="10" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `,
      detailedSvg: `
        <path d="M 120 260 C 180 160 320 160 380 210 C 430 250 410 290 360 280 C 280 270 200 300 150 310 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="130" cy="265" r="4" fill="#0f172a" />
        <path d="M 260 180 Q 280 130 305 155 Q 290 185 275 185" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `
    },
    {
      title: 'Gentle Sea Turtle & Seahorse',
      easySvg: `
        <!-- Sea Turtle Shell -->
        <ellipse cx="260" cy="270" rx="75" ry="55" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Head -->
        <ellipse cx="170" cy="245" rx="25" ry="18" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="165" cy="240" r="4" fill="#0f172a" />
        <!-- Flippers -->
        <path d="M 220 230 Q 180 160 230 150 Q 250 180 240 220" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <path d="M 220 310 Q 180 380 230 390 Q 250 360 240 320" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Little Seahorse -->
        <path d="M 400 180 C 420 160 410 130 380 140 C 370 170 390 210 380 240 Q 360 260 380 270" fill="none" stroke="#0f172a" stroke-width="4" />
        <circle cx="390" cy="148" r="3" fill="#0f172a" />
      `,
      detailedSvg: `
        <ellipse cx="260" cy="270" rx="80" ry="58" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <ellipse cx="165" cy="245" rx="26" ry="18" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="160" cy="240" r="4" fill="#0f172a" />
      `
    }
  ],
  animals: [
    {
      title: 'Happy Puppy in the Garden',
      easySvg: `
        <circle cx="250" cy="220" r="70" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <path d="M 185 180 Q 140 220 160 270 Q 185 280 195 240 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <path d="M 315 180 Q 360 220 340 270 Q 315 280 305 240 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="225" cy="205" r="8" fill="#0f172a" />
        <circle cx="275" cy="205" r="8" fill="#0f172a" />
        <ellipse cx="250" cy="235" rx="14" ry="10" fill="#0f172a" />
        <path d="M 210 285 Q 180 370 210 400 L 290 400 Q 320 370 290 285 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
      `,
      detailedSvg: `
        <circle cx="250" cy="210" r="68" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <path d="M 185 175 Q 135 220 155 270 Q 185 280 195 235 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <path d="M 315 175 Q 365 220 345 270 Q 315 280 305 235 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `
    },
    {
      title: 'Playful Kitten with Yarn',
      easySvg: `
        <!-- Cat Head with Triangle Ears -->
        <circle cx="230" cy="200" r="60" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <polygon points="180,160 190,110 220,150" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <polygon points="280,160 270,110 240,150" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <circle cx="210" cy="195" r="6" fill="#0f172a" />
        <circle cx="250" cy="195" r="6" fill="#0f172a" />
        <!-- Whiskers -->
        <line x1="170" y1="210" x2="200" y2="215" stroke="#0f172a" stroke-width="2.5" />
        <line x1="170" y1="225" x2="200" y2="225" stroke="#0f172a" stroke-width="2.5" />
        <line x1="260" y1="215" x2="290" y2="210" stroke="#0f172a" stroke-width="2.5" />
        <line x1="260" y1="225" x2="290" y2="225" stroke="#0f172a" stroke-width="2.5" />
        <!-- Ball of Yarn -->
        <circle cx="340" cy="340" r="45" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <path d="M 310 320 Q 340 370 370 330" fill="none" stroke="#0f172a" stroke-width="3" />
      `,
      detailedSvg: `
        <circle cx="230" cy="195" r="58" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <polygon points="185,155 195,105 225,145" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <polygon points="275,155 265,105 235,145" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="340" cy="340" r="48" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `
    }
  ],
  fantasy: [
    {
      title: 'Magic Unicorn & Rainbow',
      easySvg: `
        <path d="M 80 360 A 170 170 0 0 1 420 360" fill="none" stroke="#0f172a" stroke-width="5" />
        <path d="M 110 360 A 140 140 0 0 1 390 360" fill="none" stroke="#0f172a" stroke-width="5" />
        <path d="M 220 300 C 200 240 230 180 270 180 C 310 180 320 230 300 290 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <polygon points="270,180 290,90 282,180" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <circle cx="270" cy="215" r="5" fill="#0f172a" />
      `,
      detailedSvg: `
        <path d="M 90 340 A 160 160 0 0 1 410 340" fill="none" stroke="#0f172a" stroke-width="4" />
        <path d="M 220 280 C 200 220 230 160 270 160 C 310 160 320 220 300 280 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `
    },
    {
      title: 'Friendly Dragon Guarding Castle',
      easySvg: `
        <!-- Dragon Body -->
        <ellipse cx="280" cy="300" rx="75" ry="55" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Dragon Head -->
        <path d="M 200 260 Q 150 220 180 180 Q 220 180 230 220 Z" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="190" cy="200" r="4" fill="#0f172a" />
        <!-- Cute Little Wings -->
        <path d="M 260 250 Q 230 160 280 180 Q 280 220 270 250" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <!-- Castle Towers in background -->
        <rect x="80" y="240" width="40" height="120" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <polygon points="75,240 100,190 125,240" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
      `,
      detailedSvg: `
        <ellipse cx="280" cy="295" rx="78" ry="58" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <rect x="75" y="230" width="45" height="130" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <polygon points="70,230 97,180 125,230" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `
    }
  ],
  jungle: [
    {
      title: 'Cheeky Monkey on a Vine',
      easySvg: `
        <path d="M 50 100 Q 250 180 450 100" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
        <circle cx="250" cy="240" r="55" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="195" cy="235" r="22" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="305" cy="235" r="22" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
      `,
      detailedSvg: `
        <path d="M 50 100 Q 250 160 450 100" fill="none" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
        <circle cx="250" cy="230" r="52" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `
    },
    {
      title: 'Baby Lion Cub on a Rock',
      easySvg: `
        <!-- Pride Rock -->
        <polygon points="80,410 140,320 380,320 440,410" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <!-- Lion Head with Round Mane -->
        <circle cx="260" cy="220" r="60" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="210" cy="180" r="15" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <circle cx="310" cy="180" r="15" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
        <circle cx="240" cy="210" r="5" fill="#0f172a" />
        <circle cx="280" cy="210" r="5" fill="#0f172a" />
        <polygon points="255,225 265,225 260,235" fill="#0f172a" />
      `,
      detailedSvg: `
        <polygon points="75,410 135,315 385,315 445,410" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
        <circle cx="260" cy="215" r="62" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      `
    }
  ]
};

export function generateColoringPage(
  ageGroup: AgeGroup,
  theme: BookTheme,
  seed: number = Date.now(),
  usedTitles: string[] = []
): ColoringData {
  const sceneList = COLORING_SCENES[theme] || COLORING_SCENES.animals;
  const normalizedUsed = new Set(usedTitles.map((t) => t.toLowerCase().trim()));

  // 1. Pick an unused scene for this theme
  const availableScenes = sceneList.filter(
    (s) => !normalizedUsed.has(s.title.toLowerCase().trim())
  );

  let scene: { title: string; easySvg: string; detailedSvg: string };
  if (availableScenes.length > 0) {
    scene = availableScenes[Math.abs(seed) % availableScenes.length];
  } else {
    // 2. If all scenes for this theme are used, pick an unused scene from another theme
    const allScenes = Object.values(COLORING_SCENES).flat();
    const availableAnyScenes = allScenes.filter(
      (s) => !normalizedUsed.has(s.title.toLowerCase().trim())
    );
    if (availableAnyScenes.length > 0) {
      scene = availableAnyScenes[Math.abs(seed) % availableAnyScenes.length];
    } else {
      scene = sceneList[Math.abs(seed) % sceneList.length];
    }
  }

  const isPreschool = ageGroup === '4-6';
  const difficulty = isPreschool ? 'easy' : ageGroup === '7-9' ? 'medium' : 'hard';
  const rawSvg = isPreschool ? scene.easySvg : scene.detailedSvg;

  return {
    title: scene.title,
    theme,
    difficulty,
    svgArt: rawSvg,
    seed,
  };
}

export function renderColoringSVG(data: ColoringData): string {
  const width = 500;
  const height = 540;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-full">
      <rect width="${width}" height="${height}" fill="#ffffff" />
      
      <!-- Frame Border -->
      <rect x="25" y="25" width="${width - 50}" height="${height - 70}" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" rx="12" />

      <!-- Art Layer -->
      <g>
        ${data.svgArt}
      </g>

      <!-- Label -->
      <text x="${width / 2}" y="${height - 20}" font-family="'Outfit', sans-serif" font-weight="700" font-size="14" fill="#64748b" text-anchor="middle">
        Color Me! • ${data.title}
      </text>
    </svg>
  `;
}
