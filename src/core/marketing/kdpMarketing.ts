import { BookProject } from '../../types/book';

export interface AuthorDetails {
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface KdpCategoryGuide {
  category: string;
  subcategory: string;
  placement: string;
  fullPath: string;
  stepInstruction: string;
}

export interface KdpMarketingMetadata {
  title: string;
  subtitle: string;
  author: string;
  authorDetails: AuthorDetails;
  seriesTitle: string;
  editionNumber: string;
  contributors: { role: string; firstName: string; lastName: string; fullName: string }[];
  backendKeywords: string[]; // 7 boxes
  htmlDescription: string;
  plainDescription: string;
  publishingRights: string;
  primaryAudience: {
    sexuallyExplicit: 'No';
    minimumAge: string;
    maximumAge: string;
    gradeRange: string;
  };
  primaryMarketplace: string;
  recommendedCategories: string[];
  categoryGuides: KdpCategoryGuide[];
  preOrder: string;
  targetAudience: {
    ageRange: string;
    readingLevel: string;
    gradeRange: string;
  };
}

/**
 * Returns designated author details by age group:
 * - Ages 4-6: Toshith Charish
 * - Ages 7-9: Maanvith Charish
 * - Age 10+: Chaitanya Bandaru
 */
export function getDefaultAuthorForAge(ageGroup: string): AuthorDetails {
  if (ageGroup === '4-6') {
    return { firstName: 'Toshith', lastName: 'Charish', fullName: 'Toshith Charish' };
  } else if (ageGroup === '7-9') {
    return { firstName: 'Maanvith', lastName: 'Charish', fullName: 'Maanvith Charish' };
  } else {
    return { firstName: 'Chaitanya', lastName: 'Bandaru', fullName: 'Chaitanya Bandaru' };
  }
}

/**
 * Parses or formats author names into KDP First Name and Last Name fields
 */
export function parseAuthorDetails(authorName?: string, ageGroup: string = '4-6'): AuthorDetails {
  const defaultAuthor = getDefaultAuthorForAge(ageGroup);
  if (!authorName || !authorName.trim() || authorName === 'Kunta Publications' || authorName === 'Kunta Creative Team') {
    return defaultAuthor;
  }
  const parts = authorName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '', fullName: parts[0] };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
    fullName: authorName.trim(),
  };
}

/**
 * Returns the exact 3 Amazon KDP category placements for dropdown selection
 */
export function getAmazonCategoriesForProject(theme: string, ageGroup: string): KdpCategoryGuide[] {
  // Placement 1: Primary Activity Book placement
  const cat1: KdpCategoryGuide = {
    category: "Children's Books",
    subcategory: 'Activities, Crafts & Games',
    placement: 'Activity Books',
    fullPath: "Children's Books > Activities, Crafts & Games > Activity Books",
    stepInstruction: 'Select "Children\'s Books" in Category dropdown → Subcategory "Activities, Crafts & Games" → Check "Activity Books"',
  };

  // Placement 2: Puzzles & Games
  const cat2: KdpCategoryGuide = {
    category: "Children's Books",
    subcategory: 'Activities, Crafts & Games',
    placement: 'Games > Puzzles',
    fullPath: "Children's Books > Activities, Crafts & Games > Games > Puzzles",
    stepInstruction: 'Select "Children\'s Books" → Subcategory "Activities, Crafts & Games" → Check "Games" or "Puzzles"',
  };

  // Placement 3: Theme or Early Learning Specific
  let cat3: KdpCategoryGuide;
  if (ageGroup === '4-6') {
    cat3 = {
      category: "Children's Books",
      subcategory: 'Early Learning',
      placement: 'Basic Concepts',
      fullPath: "Children's Books > Early Learning > Basic Concepts",
      stepInstruction: 'Select "Children\'s Books" → Subcategory "Early Learning" → Check "Basic Concepts"',
    };
  } else if (theme === 'space') {
    cat3 = {
      category: "Children's Books",
      subcategory: 'Science, Nature & How It Works',
      placement: 'Astronomy & Space',
      fullPath: "Children's Books > Science, Nature & How It Works > Astronomy & Space",
      stepInstruction: 'Select "Children\'s Books" → Subcategory "Science, Nature & How It Works" → Check "Astronomy & Space"',
    };
  } else if (theme === 'dinosaurs') {
    cat3 = {
      category: "Children's Books",
      subcategory: 'Animals',
      placement: 'Dinosaurs & Prehistoric Creatures',
      fullPath: "Children's Books > Animals > Dinosaurs & Prehistoric Creatures",
      stepInstruction: 'Select "Children\'s Books" → Subcategory "Animals" → Check "Dinosaurs & Prehistoric Creatures"',
    };
  } else if (theme === 'underwater') {
    cat3 = {
      category: "Children's Books",
      subcategory: 'Animals',
      placement: 'Marine Life',
      fullPath: "Children's Books > Animals > Marine Life",
      stepInstruction: 'Select "Children\'s Books" → Subcategory "Animals" → Check "Marine Life"',
    };
  } else {
    cat3 = {
      category: "Children's Books",
      subcategory: 'Animals',
      placement: 'General / Wildlife',
      fullPath: "Children's Books > Animals > Mammals / Wildlife",
      stepInstruction: 'Select "Children\'s Books" → Subcategory "Animals" → Check "General" or "Mammals"',
    };
  }

  return [cat1, cat2, cat3];
}

export function generateKdpMarketing(project: BookProject): KdpMarketingMetadata {
  const { title, subtitle, authorName, ageGroup, theme, pageCount, singleSided } = project.config;
  const authorDetails = parseAuthorDetails(authorName, ageGroup);

  // Grade and reading levels
  let gradeRange = 'Preschool - 1st Grade';
  let readingLevel = 'Beginner (Pre-K to 1st Grade)';
  let minAge = '4 years';
  let maxAge = '6 years';
  if (ageGroup === '7-9') {
    gradeRange = '2nd Grade - 4th Grade';
    readingLevel = 'Intermediate (2nd to 4th Grade)';
    minAge = '7 years';
    maxAge = '9 years';
  } else if (ageGroup === '10+') {
    gradeRange = '5th Grade - 8th Grade';
    readingLevel = 'Advanced (5th to 8th Grade)';
    minAge = '10 years';
    maxAge = '18+ years';
  }

  // 7 Backend search term keywords (Amazon limit: under 50 characters each, non-redundant)
  const themeKeywordsMap: Record<string, string[]> = {
    space: [
      'outer space gifts planet solar system',
      'astronaut galaxy rocket ship coloring',
      'screen free road trip travel game boy girl',
      'preschool kindergarten homeschool stem',
      'brain teaser logic problem solving maze',
      'summer bridge workbook learning activity',
      'smart kids thinking games birthday gift'
    ],
    dinosaurs: [
      'dinosaur gifts t rex jurassic fossil',
      'prehistoric reptile animal coloring pad',
      'screen free travel games kindergarten 1st',
      'connect dots word find brain teasers',
      'boys girls dinosaur workbook learning',
      'homeschool early learning classroom fun',
      'quiet time activity pad birthday stocking'
    ],
    animals: [
      'cute safari farm zoo pets coloring',
      'animal lover gift boy girl kindergarten',
      'brain games logic cognitive development',
      'travel puzzle book road trip screen free',
      'word find dot to dot maze challenge',
      'homeschool preschool learning workbook',
      'rainy day quiet time activities children'
    ],
    fantasy: [
      'magical unicorn fairy dragon adventure',
      'fantasy kingdom puzzle workbook girls boys',
      'screen free creative thinking imagination',
      'cute coloring pages word scramble game',
      'fairy tale castle prince princess gift',
      'birthday party favor stocking stuffer',
      'cognitive skills logic maze connect dots'
    ],
    underwater: [
      'ocean sea creatures dolphin shark whale',
      'marine biology aquarium puzzle book',
      'beach vacation summer activity book kids',
      'screen free road trip travel entertainment',
      'undersea animals word search dot to dot',
      'brain sharpening focus concentration workbook',
      'kindergarten elementary homeschool practice'
    ],
    jungle: [
      'rainforest safari wild animals monkey',
      'wildlife adventure maze puzzle book',
      'screen free quiet time travel game kids',
      'early learning logic motor skill practice',
      'connect dots word search coloring pages',
      'birthday gift boy girl preschool workbook',
      'critical thinking problem solving activity'
    ],
  };

  const backendKeywords = themeKeywordsMap[theme] || themeKeywordsMap.animals;

  // Amazon-compliant HTML Description
  const htmlDescription = `
<h3><b>🌟 The Ultimate Screen-Free Activity Book for Kids Ages ${ageGroup}! 🌟</b></h3>

<p>Looking for a fun, engaging, and educational way to keep your child entertained without smartphones or tablets? This <b>${title}</b> is packed with over ${pageCount} pages of brain-teasing puzzles, creative coloring scenes, and skill-building challenges designed specifically for children ages ${ageGroup}!</p>

<h3><b>✨ What Makes This Book Special:</b></h3>
<ul>
  <li><b>🌀 Exciting Mazes:</b> Boosts spatial reasoning and problem-solving through fun character journeys.</li>
  <li><b>🔍 Themed Word Searches:</b> Expands vocabulary, spelling recognition, and reading confidence.</li>
  <li><b>🔢 Numbered Dot-to-Dot:</b> Reinforces number counting, sequencing, and fine-motor pen control.</li>
  <li><b>🖍️ Delightful Coloring Pages:</b> Big, bold illustrations that spark artistic imagination and relaxation.</li>
  <li><b>🧩 Brainy Kids Sudoku:</b> Age-tailored logic puzzles that develop critical thinking skills.</li>
  ${singleSided ? '<li><b>🛡️ Single-Sided Pages:</b> Every activity page is followed by a blank doodle backing so markers and pens won\'t bleed through to the next puzzle!</li>' : ''}
  <li><b>✅ Complete Answer Key:</b> Full solutions included at the back so kids can check their own work with confidence.</li>
  <li><b>📏 Generous 8.5" x 11" Format:</b> Large, easy-to-draw pages made specially for little hands.</li>
</ul>

<h3><b>🎁 The Perfect Gift for Any Occasion!</b></h3>
<p>Whether for long car rides, airplane travel, rainy afternoons, homeschool curriculum, or birthday gifts, this activity book provides hours of wholesome, screen-free enjoyment!</p>

<p><b>Scroll up and click "Buy Now" to spark your child's creativity and learning today!</b></p>
  `.trim();

  const plainDescription = htmlDescription
    .replace(/<h3><b>/g, '=== ')
    .replace(/<\/b><\/h3>/g, ' ===\n')
    .replace(/<b>/g, '')
    .replace(/<\/b>/g, '')
    .replace(/<li>/g, '• ')
    .replace(/<\/li>/g, '\n')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n\n');

  const categoryGuides = getAmazonCategoriesForProject(theme, ageGroup);
  const recommendedCategories = categoryGuides.map((cg) => cg.fullPath);

  return {
    title,
    subtitle,
    author: authorDetails.fullName,
    authorDetails,
    seriesTitle: 'Kunta Kids Adventure Series',
    editionNumber: '1',
    contributors: [
      {
        role: 'Publisher',
        firstName: 'Kunta',
        lastName: 'Publications',
        fullName: 'Kunta Publications',
      },
    ],
    backendKeywords,
    htmlDescription,
    plainDescription,
    publishingRights: 'I own the copyright and I hold the necessary publishing rights.',
    primaryAudience: {
      sexuallyExplicit: 'No',
      minimumAge: minAge,
      maximumAge: maxAge,
      gradeRange,
    },
    primaryMarketplace: 'Amazon.com',
    recommendedCategories,
    categoryGuides,
    preOrder: 'I am ready to release my book now',
    targetAudience: {
      ageRange: `Ages ${ageGroup} years`,
      readingLevel,
      gradeRange,
    },
  };
}

export function exportMarketingBundleAsText(metadata: KdpMarketingMetadata): string {
  return `===============================================================
AMAZON KDP COMPLETE PUBLISHING & LISTING METADATA
Official 1-Click Copy & Paste Assistant
===============================================================

---------------------------------------------------------------
PAGE 1: KINDLE EBOOK / PAPERBACK DETAILS
---------------------------------------------------------------
1. Primary Language:
   English

2. Book Title:
   ${metadata.title}

3. Subtitle (Optional):
   ${metadata.subtitle}

4. Series (Optional):
   ${metadata.seriesTitle}

5. Edition Number (Optional):
   ${metadata.editionNumber}

6. Primary Author / Contributor:
   • First Name: ${metadata.authorDetails.firstName}
   • Last Name:  ${metadata.authorDetails.lastName}
   • Full Name:  ${metadata.authorDetails.fullName}

7. Contributors (Optional):
   • Role:       Publisher
   • First Name: Kunta
   • Last Name:  Publications

---------------------------------------------------------------
PAGE 2: DESCRIPTION, RIGHTS, AUDIENCE, CATEGORIES & KEYWORDS
---------------------------------------------------------------
8. Amazon HTML Product Description (Copy & Paste directly into KDP editor):
${metadata.htmlDescription}

9. Publishing Rights:
   (X) I own the copyright and I hold the necessary publishing rights.

10. Primary Audience:
   • Sexually Explicit Images or Title: No
   • Reading Age (Minimum): ${metadata.primaryAudience.minimumAge}
   • Reading Age (Maximum): ${metadata.primaryAudience.maximumAge}
   • Grade Range:           ${metadata.primaryAudience.gradeRange}

11. Primary Marketplace:
   Amazon.com

12. Amazon Category Placements (Select up to 3 in KDP Category Modal):
${metadata.categoryGuides
  .map(
    (cg, i) =>
      `   Placement #${i + 1}:\n   ${cg.fullPath}\n   → How to select: ${cg.stepInstruction}\n`
  )
  .join('\n')}

13. 7 Amazon Backend Search Terms (Keywords):
   (Copy each line into one of the 7 keyword boxes in KDP dashboard)
   Box 1: ${metadata.backendKeywords[0] || ''}
   Box 2: ${metadata.backendKeywords[1] || ''}
   Box 3: ${metadata.backendKeywords[2] || ''}
   Box 4: ${metadata.backendKeywords[3] || ''}
   Box 5: ${metadata.backendKeywords[4] || ''}
   Box 6: ${metadata.backendKeywords[5] || ''}
   Box 7: ${metadata.backendKeywords[6] || ''}

---------------------------------------------------------------
PAGE 3: RELEASE & PRE-ORDER
---------------------------------------------------------------
14. Pre-Order Setting:
   (X) I am ready to release my book now

===============================================================
Published by Kunta Publications • Generated by Kids KDP Studio
===============================================================
`;
}
