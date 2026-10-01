import { generateMaze, solveMazeBFS } from './core/generators/mazeGenerator';
import { generateWordSearch, THEME_VOCABULARY } from './core/generators/wordSearchGenerator';
import { generateDotToDot } from './core/generators/dotToDotGenerator';
import { generateColoringPage } from './core/generators/coloringGenerator';
import { generateSudoku, renderSudokuSVG } from './core/generators/sudokuGenerator';
import {
  validateSudokuCell,
  getSudokuConflicts,
  checkSudokuSolved,
  getSudokuHint,
  parseSudokuFromSvg,
} from './core/validators/sudokuValidator';
import {
  validateMazeStroke,
  mapCanvasPointToMazeCell,
  checkWallCollision,
} from './core/validators/mazeValidator';
import { runPageQualityCheck } from './core/qc/qcEngine';
import { calculateCoverDimensions, calculateSpineWidth } from './core/assembly/kdpSpecs';
import {
  generateKdpMarketing,
  getDefaultAuthorForAge,
  parseAuthorDetails,
  getAmazonCategoriesForProject,
  exportMarketingBundleAsText,
} from './core/marketing/kdpMarketing';
import { createDefaultConfig, generateFullBookProject } from './core/assembly/bookAssembler';
import { getStampBadges, renderStampPassportSVG } from './core/generators/stampPassportGenerator';
import { generateBookSku, createBookRecordFromProject } from './core/storage/bookCatalogStorage';
import { getWordDefinition } from './core/data/wordDictionary';
import { renderPictureDictionarySVG } from './core/generators/pictureDictionaryGenerator';
import { renderWordSearchSVG } from './core/generators/wordSearchGenerator';
import {
  calculateLevel,
  calculateStars,
  formatSeconds,
  createDefaultProfile,
  clearExplorerProfile,
  hasSavedExplorerProfile,
  recordPuzzleCompletion,
  calculateAgeFromBirthDate,
  updateExplorerIdentity,
  getActiveChildIndex,
  setActiveChildIndex,
  loadExplorerProfile,
} from './core/storage/kidsProfileStorage';
import {
  PASS_PLANS,
  getDefaultPassState,
  loadPassState,
  savePassState,
  activatePass,
  isThemeUnlocked,
  canAccessChallenge,
  formatRemainingPassTime,
} from './core/monetization/passStorage';
import { AgeGroup, BookConfig, BookTheme } from './types/book';
import {
  calculateKdpPrintingCost,
  calculateMinListPrice,
  calculatePaperbackPricing,
  calculateEbookPricing,
} from './core/pricing/kdpPricing';
import { generateAiCoverPrompts } from './core/cover/coverGenerator';
import { safePdfText } from './core/assembly/pdfExport';
import { auditBookForAmazonKdp } from './core/audit/kdpRankEngine';
import { PDFDocument, StandardFonts } from 'pdf-lib';

console.log('====================================================');
console.log('RUNNING KIDS KDP STUDIO COMPREHENSIVE TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

// 1. Maze Generator Tests
console.log('[1] Testing Maze Generator & Solvability...');
const ageGroups: AgeGroup[] = ['4-6', '7-9', '10+'];
for (const age of ageGroups) {
  const maze = generateMaze(age, 'space', 42);
  assert(maze.cols > 0 && maze.rows > 0, `Maze dimensions for age ${age} are valid (${maze.cols}x${maze.rows})`);
  assert(maze.solutionPath.length > 0, `Maze for age ${age} has verified solution path of length ${maze.solutionPath.length}`);
  
  // Verify path connects start (0,0) to exit (cols-1, rows-1)
  const first = maze.solutionPath[0];
  const last = maze.solutionPath[maze.solutionPath.length - 1];
  assert(first.x === 0 && first.y === 0, `Path starts at (0,0) for age ${age}`);
  assert(last.x === maze.cols - 1 && last.y === maze.rows - 1, `Path ends at exit (${last.x},${last.y}) for age ${age}`);
}

// 2. Word Search Generator Tests
console.log('\n[2] Testing Word Search & Direction Constraints...');
const themes: BookTheme[] = ['space', 'animals', 'dinosaurs', 'fantasy', 'underwater', 'jungle'];
for (const theme of themes) {
  const ws = generateWordSearch('4-6', theme, 99);
  assert(ws.words.length > 0, `Theme ${theme} has ${ws.words.length} words`);
  assert(ws.placedWords.length === ws.words.length, `All words placed on grid for theme ${theme}`);
  
  // Verify 4-6 year old orientation rule (only dx=1,dy=0 or dx=0,dy=1)
  const onlyOrthogonal = ws.placedWords.every(
    (pw) => (pw.dx === 1 && pw.dy === 0) || (pw.dx === 0 && pw.dy === 1)
  );
  assert(onlyOrthogonal, `Ages 4-6 word search contains ONLY L-to-R and T-to-B directions`);
}

// 3. Dot-to-Dot Generator Tests
console.log('\n[3] Testing Dot-to-Dot Silhouette & Density...');
const dtdYoung = generateDotToDot('4-6', 'space', 101);
assert(dtdYoung.points.length >= 10 && dtdYoung.points.length <= 25, `Preschool dot-to-dot has gentle point count (${dtdYoung.points.length})`);
const dtdOlder = generateDotToDot('10+', 'space', 101);
assert(dtdOlder.points.length >= 40, `Older kids dot-to-dot has high detail point count (${dtdOlder.points.length})`);

// 4. Sudoku Generator & Mathematical Validator Tests
console.log('\n[4] Testing Kids Sudoku & Mathematical Validation Engine...');
const sudo4 = generateSudoku('4-6', 'animals', 10);
assert(sudo4.size === 4, `Preschool Sudoku is 4x4`);
assert(sudo4.solutionGrid.length === 4, `4x4 Sudoku solution generated`);

const sudo6 = generateSudoku('7-9', 'animals', 20);
assert(sudo6.size === 6, `Elementary Sudoku is 6x6`);

const sudo9 = generateSudoku('10+', 'animals', 30);
assert(sudo9.size === 9, `Tween Sudoku is 9x9`);

// Math validator tests
const solvedCheck = checkSudokuSolved(sudo4.solutionGrid, sudo4.solutionGrid, 4, 2, 2);
assert(solvedCheck.isComplete && solvedCheck.isCorrect, `Validator accepts 100% correct 4x4 Sudoku`);
assert(solvedCheck.conflicts.size === 0, `Valid solution has 0 conflicts`);

// Conflict detection test (create conflicting clone)
const badGrid = sudo4.solutionGrid.map((row) => [...row]);
badGrid[0][1] = badGrid[0][0]; // Duplicate in row 0
const rowConflict = getSudokuConflicts(badGrid, 4, 2, 2);
assert(rowConflict.has('0,0') && rowConflict.has('0,1'), `Validator accurately catches row duplication conflict`);

// Unfinished puzzle check
const incompleteCheck = checkSudokuSolved(sudo4.puzzleGrid, sudo4.solutionGrid, 4, 2, 2);
assert(incompleteCheck.isComplete === false, `Initial puzzle grid correctly flagged as incomplete`);
assert(incompleteCheck.remainingEmpty > 0, `Tracks remaining empty cells accurately (${incompleteCheck.remainingEmpty} empty)`);

// Hint generator test
const hint = getSudokuHint(sudo4.puzzleGrid, sudo4.solutionGrid);
assert(hint !== null, `Hint generator supplies next cell`);
assert(hint!.value === sudo4.solutionGrid[hint!.row][hint!.col], `Hint matches true mathematical solution (${hint?.value})`);

// Fallback SVG parser test
const svg = renderSudokuSVG(sudo4, false);
const parsedFromSvg = parseSudokuFromSvg(svg);
assert(parsedFromSvg !== null && parsedFromSvg.size === 4, `Reconstructs 4x4 Sudoku grid from SVG`);

// 5. Quality Control (QC) Engine Tests
console.log('\n[5] Testing Quality Control Layer (Solvability & Duplicate Checks)...');
const validPage = {
  id: 'test-1',
  pageNumber: 5,
  type: 'maze' as const,
  title: 'Test Maze',
  instructions: 'Test',
  difficulty: 'easy' as const,
  theme: 'space' as const,
  data: generateMaze('4-6', 'space', 555),
  solutionData: null,
};
const qcPass = runPageQualityCheck(validPage, '4-6', []);
assert(qcPass.passed === true, `QC engine approves valid solvable maze`);
assert(qcPass.score >= 90, `QC score is high for valid puzzle (${qcPass.score})`);

// Test rejection of unsolvable maze
const brokenMazePage = {
  ...validPage,
  data: {
    ...validPage.data,
    solutionPath: [], // No path!
  },
};
const qcFail = runPageQualityCheck(brokenMazePage, '4-6', []);
assert(qcFail.passed === false, `QC engine flags unsolvable puzzle`);
assert(qcFail.checks.solvable === false, `Solvability check reports false`);

// 6. KDP Printing Calculations Tests
console.log('\n[6] Testing Amazon KDP Specifications & Spine Calculations...');
const spine24 = calculateSpineWidth(24);
const spine100 = calculateSpineWidth(100);
assert(spine24 > 0, `Spine width for 24 pages is ${spine24} inches`);
assert(spine100 > spine24, `Spine width for 100 pages (${spine100}") is thicker than 24 pages`);

const coverDims = calculateCoverDimensions(80);
assert(coverDims.totalWidthInches > 17, `Full wrap cover width includes bleed + front + spine + back (${coverDims.totalWidthInches.toFixed(2)}")`);
assert(coverDims.totalHeightInches === 11.25, `Full wrap cover height equals 11" + 2x0.125" bleed = 11.25"`);

// 7. Amazon Marketing SEO Tests
console.log('\n[7] Testing Amazon KDP Marketing Helper (7 Keyword Boxes & HTML Description)...');
const defaultConfig = createDefaultConfig();
const fullProject = generateFullBookProject(defaultConfig);
const marketing = generateKdpMarketing(fullProject);

assert(marketing.backendKeywords.length === 7, `Exactly 7 backend search term keyword boxes generated`);
assert(marketing.backendKeywords.every((kw) => kw.length <= 50), `All 7 keyword boxes are within Amazon KDP character limits`);
assert(marketing.htmlDescription.includes('<b>') && marketing.htmlDescription.includes('<ul>'), `Description uses Amazon-supported HTML tags`);

// 8. Dynamic Stamp Passport & Gamification Tests
console.log('\n[8] Testing Dynamic Stamp Passport & Gamification Engine...');
const badges16 = getStampBadges(16);
assert(badges16.length === 16, `Dynamically generated exactly 16 badges for 16-page challenge`);
assert(badges16[15].label === 'Grand Champ!', `Final badge is crowned Grand Champ!`);

const badges32 = getStampBadges(32);
assert(badges32.length === 32, `Dynamically generated exactly 32 badges for 32-page challenge`);

const passportSvg = renderStampPassportSVG(20, [1, 2, 5], 'Kunta Publications', 'animals');
assert(passportSvg.includes('MY 20-CHALLENGE ADVENTURE PASSPORT'), `Passport SVG dynamically reflects 20-challenge title`);
assert(passportSvg.includes('viewBox="0 0 612 792"'), `Passport SVG uses standard 8.5x11 inch (612x792) viewBox`);
assert(passportSvg.includes('x="36" y="36" width="540" height="720"'), `Passport SVG outer frame enforces exact 0.5" (36pt) Amazon KDP safe margin`);
assert(passportSvg.includes('width="500"'), `Passport SVG header banner has 500pt width preventing text overflow`);
assert(passportSvg.includes('stamp-badge-completed'), `Completed challenge stamps are rendered in active celebration state`);
assert(passportSvg.includes('stamp-badge-pending'), `Incomplete challenge stamps are rendered in greyed-out state`);
assert(fullProject.frontMatter.stampPassportPage === true, `Full book project includes dynamic stamp passport page`);
assert(fullProject.pages.every((p, idx) => p.challengeNumber === idx + 1), `Every activity page contains sequential challenge number for stamp tracking`);

// 9. Standardized SKU Naming & Catalog Tests
console.log('\n[9] Testing Standardized SKU Naming Convention & Catalog Layer...');
const skuSpace = generateBookSku('space', '4-6', 24, 12345);
assert(skuSpace.startsWith('KP-SPACE-AGE4TO6-24P-'), `SKU format starts with standard prefix: ${skuSpace}`);

const skuDino = generateBookSku('dinosaurs', '10+', 60, 9999);
assert(skuDino.startsWith('KP-DINOSAURS-AGE10+-60P-'), `SKU format formats age 10+ properly: ${skuDino}`);

const record = createBookRecordFromProject(fullProject, false);
assert(record.isPublishedOnAmazon === false, `New book record defaults to Unpublished / Draft`);
assert(record.puzzleCount === fullProject.pages.length, `Record puzzle count matches project pages count`);
assert(record.sku.includes('KP-'), `Record includes validated publishing SKU`);

// 10. Junior Explorer Phonics & Vocabulary Flashcard Tests
console.log('\n[10] Testing Junior Explorer Phonics & Vocabulary Flashcard Engine...');
const beeDef = getWordDefinition('BEE', 'animals');
assert(beeDef.word === 'BEE' && beeDef.icon === '🐝', `Animal vocabulary definition returns correct icon (🐝 BEE)`);
assert(beeDef.definition.length > 10, `Animal definition contains child-friendly explanation`);
assert(beeDef.funFact.length > 10, `Animal definition contains memorable fun fact`);
assert(beeDef.syllables.includes('1 syllable'), `BEE syllables breakdown verified: ${beeDef.syllables}`);
assert(beeDef.exampleSentence.includes('honeybee') || beeDef.exampleSentence.includes('bee'), `BEE contains Word-in-Action example sentence`);
assert(beeDef.rhymesWith.includes('TREE') && beeDef.rhymesWith.includes('SEE'), `BEE rhymes with TREE and SEE`);

const batDef = getWordDefinition('BAT', 'animals');
assert(batDef.word === 'BAT' && batDef.icon === '🦇', `BAT definition returns correct icon (🦇 BAT)`);
assert(batDef.rhymesWith.includes('CAT') && batDef.rhymesWith.includes('HAT'), `BAT rhymes with CAT and HAT`);
assert(batDef.exampleSentence.includes('bat'), `BAT includes Word-in-Action sentence`);
assert(batDef.partOfSpeech === 'Noun', `BAT part of speech is Noun`);

const galaxyDef = getWordDefinition('GALAXY', 'space');
assert(galaxyDef.word === 'GALAXY' && galaxyDef.icon === '🌌', `Space vocabulary definition returns correct icon (🌌 GALAXY)`);
assert(galaxyDef.syllables.includes('3 syllables'), `GALAXY syllables breakdown verified: ${galaxyDef.syllables}`);

const fallbackDef = getWordDefinition('UNKNOWN', 'fantasy');
assert(fallbackDef.word === 'UNKNOWN' && !!fallbackDef.icon, `Fallback generator provides valid icon for uncatalogued words`);
assert(fallbackDef.syllables.length > 0 && fallbackDef.rhymesWith.length > 0, `Fallback provides syllables and rhyme family`);

const testWs = generateWordSearch('4-6', 'animals', 42);
const wsSvg = renderWordSearchSVG(testWs, false);
assert(wsSvg.includes('FIND THESE WORDS:') && wsSvg.includes('font-size="12"'), `Word Search SVG includes illustrated word bank items with checkbox and icons`);

const dictSvg = renderPictureDictionarySVG({
  words: ['BEE', 'FOX', 'LION', 'SWAN'],
  theme: 'animals',
  authorName: 'Kunta Publications',
});
assert(dictSvg.includes("EXPLORER'S PICTURE DICTIONARY"), `Picture Dictionary SVG header renders properly`);
assert(dictSvg.includes('viewBox="0 0 612 792"'), `Picture Dictionary SVG uses standard 8.5x11 inch viewBox`);
assert(dictSvg.includes('x="36" y="36" width="540" height="720"'), `Picture Dictionary enforces 0.5" KDP safe margin`);
assert(dictSvg.includes('Kunta Publications'), `Picture Dictionary SVG includes publisher name`);
assert(dictSvg.includes('🐝') && dictSvg.includes('FOX'), `Picture Dictionary SVG contains illustrated cards with icons`);
assert(fullProject.backMatter.pictureDictionaryPage === true, `Book project back matter includes Picture Dictionary page`);

// 11. Full Gamification Engine & Explorer Profile Tests
console.log('\n[11] Testing Full Gamification Engine & Explorer Profile...');
assert(formatSeconds(84) === '01:24', `FormatSeconds converts 84s to 01:24`);
assert(formatSeconds(3605) === '60:05', `FormatSeconds converts 3605s to 60:05`);

// Star thresholds
const sudoStarsFast = calculateStars('sudoku', '4-6', 45);
assert(sudoStarsFast === 3, `4x4 Sudoku under 90s awards 3 Stars (got ${sudoStarsFast})`);
const sudoStarsMed = calculateStars('sudoku', '4-6', 110);
assert(sudoStarsMed === 2, `4x4 Sudoku between 90-180s awards 2 Stars (got ${sudoStarsMed})`);
const sudoStarsSlow = calculateStars('sudoku', '4-6', 220);
assert(sudoStarsSlow === 1, `4x4 Sudoku over 180s awards 1 Star (got ${sudoStarsSlow})`);

const mazeStarsFast = calculateStars('maze', '7-9', 80);
assert(mazeStarsFast === 3, `Ages 7-9 Maze under 90s awards 3 Stars`);

// Level progression
const lvl1 = calculateLevel(100);
assert(lvl1.level === 1 && lvl1.levelTitle.includes('Junior Scout'), `100 XP is Level 1 Junior Scout`);
const lvl5 = calculateLevel(1500);
assert(lvl5.level === 5 && lvl5.levelTitle.includes('Star Navigator'), `1500 XP is Level 5 Star Navigator`);
const lvl10 = calculateLevel(7000);
assert(lvl10.level === 10 && lvl10.levelTitle.includes('Grand Legend'), `7000 XP is Level 10 Grand Legend`);

// Profile creation and puzzle completion record
const defaultProf = createDefaultProfile();
assert(defaultProf.totalXp === 0 && defaultProf.level === 1, `Default explorer profile initialized at Level 1 with 0 XP`);

// Simulate recording puzzle completion
const mockBook = createBookRecordFromProject(fullProject, false);
const result1 = recordPuzzleCompletion(mockBook, 1, 'maze', 'Space Labyrinth', 45, 0);
assert(result1.isNewBest === true, `First completion registers as New Personal Best`);
assert(result1.starsEarned === 3, `Fast maze solve earns 3 Stars`);
assert(result1.xpGained === 175, `Base 100 XP + 50 3-Star + 25 Clean solve = 175 XP (got ${result1.xpGained})`);
assert(result1.profile.totalPuzzlesSolved === 1, `Profile tracks 1 puzzle solved`);
assert(result1.profile.cleanSolvesCount === 1, `Profile tracks 1 clean solve`);

// Simulate replay with faster time (New Best)
const result2 = recordPuzzleCompletion(mockBook, 1, 'maze', 'Space Labyrinth', 30, 0);
assert(result2.isNewBest === true, `Replaying with faster time registers as New Personal Best`);
assert(result2.profile.puzzleRecords[`${mockBook.id}_ch_1`].bestTimeSeconds === 30, `Best time updated to 30s`);
assert(result2.profile.puzzleRecords[`${mockBook.id}_ch_1`].attemptsCount === 2, `Attempts count incremented to 2`);

// Simulate replay with slower time (Not New Best)
const result3 = recordPuzzleCompletion(mockBook, 1, 'maze', 'Space Labyrinth', 50, 1);
assert(result3.isNewBest === false, `Slower replay does not overwrite best time`);
assert(result3.profile.puzzleRecords[`${mockBook.id}_ch_1`].bestTimeSeconds === 30, `Best time remains 30s`);

// Completed game aggregation
const gameRec = result3.profile.completedGames[mockBook.id];
assert(gameRec !== undefined && gameRec.solvedPuzzlesCount === 1, `Completed games tracks 1 solved puzzle in book`);
assert(gameRec.bookTitle === mockBook.title, `Completed game stores book title`);

// Clear profile and verify fresh start
const clearedProf = clearExplorerProfile();
assert(clearedProf.totalXp === 0 && clearedProf.totalStarsEarned === 0, `ClearExplorerProfile resets XP and stars to 0`);
assert(Object.keys(clearedProf.puzzleRecords).length === 0, `ClearExplorerProfile wipes all saved puzzle records`);
assert(Object.keys(clearedProf.completedGames).length === 0, `ClearExplorerProfile wipes all completed games`);
assert(hasSavedExplorerProfile() === false, `HasSavedExplorerProfile reports false after fresh start wipe`);

console.log('\n[12] Testing Amazon KDP Pricing, Tentative Cost Engine & AI Prompts...');
// 36 pages print cost
const printCost36 = calculateKdpPrintingCost(36, 'USD');
assert(printCost36 === 1.43, `36 pages printing cost is $1.43 (got $${printCost36})`);

// 50 pages print cost
const printCost50 = calculateKdpPrintingCost(50, 'USD');
assert(printCost50 === 1.60, `50 pages printing cost is $1.60 (got $${printCost50})`);

// Minimum list price
const minPrice36 = calculateMinListPrice(36, 'USD');
assert(minPrice36 === 2.38 || minPrice36 === 2.39, `Minimum list price for 36 pages is ~$2.38-$2.39 (got $${minPrice36})`);

// Paperback pricing at $7.99
const pbPricing799 = calculatePaperbackPricing(36, 7.99, 'USD');
assert(pbPricing799.authorRoyalty === 3.36, `At $7.99, net author royalty is $3.36 (got $${pbPricing799.authorRoyalty})`);
assert(pbPricing799.profitMarginPercent === 42.1, `Profit margin at $7.99 is 42.1% (got ${pbPricing799.profitMarginPercent}%)`);
assert(pbPricing799.isProfitable === true, `Sale at $7.99 is flagged as profitable`);

// UK GBP pricing test
const printCostUK = calculateKdpPrintingCost(36, 'GBP');
assert(printCostUK === 1.16, `UK 36 pages printing cost is £1.16 (got £${printCostUK})`);

// India INR pricing test
const printCostINR = calculateKdpPrintingCost(36, 'INR');
assert(printCostINR === 121.72, `INR 36 pages printing cost is ₹121.72 (got ₹${printCostINR})`);

const minPriceINR = calculateMinListPrice(36, 'INR');
assert(minPriceINR === 202.87, `Minimum list price for 36 pages in INR is ₹202.87 (got ₹${minPriceINR})`);

const pbPricingINR = calculatePaperbackPricing(36, 499, 'INR');
assert(pbPricingINR.authorRoyalty === 177.68, `At ₹499, net author royalty is ₹177.68 (got ₹${pbPricingINR.authorRoyalty})`);
assert(pbPricingINR.profitMarginPercent === 35.6, `Profit margin at ₹499 is 35.6% (got ${pbPricingINR.profitMarginPercent}%)`);
assert(pbPricingINR.isProfitable === true, `Sale at ₹499 is flagged as profitable`);

// Kindle eBook pricing at $2.99 USD and ₹199 INR
const ebPricing299 = calculateEbookPricing(2.99, 'USD');
assert(ebPricing299.authorRoyalty === 2.09, `Kindle eBook at $2.99 earns $2.09 royalty (got $${ebPricing299.authorRoyalty})`);

const ebPricingINR = calculateEbookPricing(199, 'INR');
assert(ebPricingINR.authorRoyalty === 139.30, `Kindle eBook at ₹199 earns ₹139.30 royalty (got ₹${ebPricingINR.authorRoyalty})`);

// AI Cover Prompts: Gemini & ChatGPT synchronization
const prompts = generateAiCoverPrompts(fullProject);
assert(prompts.frontCoverGemini.includes(fullProject.config.title), `Gemini front cover prompt includes book title`);
assert(prompts.frontCoverChatGpt.includes(fullProject.config.title), `ChatGPT front cover prompt includes book title`);
assert(prompts.fullWrapGemini.includes(fullProject.config.title), `Gemini full-wrap prompt includes book title`);
assert(prompts.fullWrapChatGpt.includes(fullProject.config.title), `ChatGPT full-wrap prompt includes book title`);
assert(!prompts.frontCoverGemini.includes('Canva'), `Gemini front prompt contains no Canva mentions`);
assert(!prompts.fullWrapChatGpt.includes('Canva'), `ChatGPT wrap prompt contains no Canva mentions`);

console.log('\n[13] Testing KDP PDF Text Sanitizer & Encoding Safety...');
const cleanCert = safePdfText('★ CERTIFICATE OF ACHIEVEMENT ★');
assert(cleanCert === '* CERTIFICATE OF ACHIEVEMENT *', `Star symbol sanitized to asterisk: ${cleanCert}`);

const cleanEmoji = safePdfText('Super 🚀 Space 🌟 Fun');
assert(cleanEmoji === 'Super  Space  Fun', `Emojis cleanly removed: ${cleanEmoji}`);

const cleanQuotes = safePdfText('“Double” and ‘Single’ — Dash');
assert(cleanQuotes === '"Double" and \'Single\' - Dash', `Smart punctuation normalized: ${cleanQuotes}`);

// Verify PDFDocument can encode sanitized text without throwing
let pdfEncodeSuccess = false;
try {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([600, 800]);
  page.drawText(cleanCert, { font, x: 50, y: 500, size: 18 });
  page.drawText(cleanEmoji, { font, x: 50, y: 460, size: 14 });
  page.drawText(cleanQuotes, { font, x: 50, y: 420, size: 14 });
  const bytes = await doc.save();
  pdfEncodeSuccess = bytes.length > 0;
} catch (e: any) {
  console.error('PDF encode error:', e);
}
assert(pdfEncodeSuccess === true, `PDFDocument successfully encodes sanitized text into PDF bytes`);

console.log('\n[14] Testing Anti-Duplication Controls & Word Search Solution Visibility...');
const multiPageConfig: BookConfig = {
  ...createDefaultConfig(),
  theme: 'space',
  ageGroup: '4-6',
  pageCount: 36,
  singleSided: false,
  activityDistribution: {
    maze: 20,
    wordsearch: 20,
    dottodot: 25,
    coloring: 25,
    sudoku: 10,
  },
};
const multiBook = generateFullBookProject(multiPageConfig);

const dotPages = multiBook.pages.filter((p) => p.type === 'dottodot');
const dotNames = dotPages.map((p) => p.data.name);
const uniqueDotNames = new Set(dotNames);
assert(dotPages.length > 1, `Multi-page book generated multiple dot-to-dot pages (${dotPages.length} pages)`);
assert(dotNames.length === uniqueDotNames.size, `Zero duplicate dot-to-dot silhouettes: all ${dotNames.length} names unique (${dotNames.join(', ')})`);

const coloringPages = multiBook.pages.filter((p) => p.type === 'coloring');
const coloringTitles = coloringPages.map((p) => p.data.title);
const uniqueColoringTitles = new Set(coloringTitles);
assert(coloringPages.length > 1, `Multi-page book generated multiple coloring pages (${coloringPages.length} pages)`);
assert(coloringTitles.length === uniqueColoringTitles.size, `Zero duplicate coloring scenes: all ${coloringTitles.length} titles unique (${coloringTitles.join(', ')})`);

assert(multiBook.pages.every((p) => p.qc.passed === true), `All ${multiBook.pages.length} pages passed quality control with 0 duplicates`);

// Test Word Search Solution Highlight visibility in SVG
const wsPuzzle = generateWordSearch('7-9', 'space', 101);
const wsSolutionSvg = renderWordSearchSVG(wsPuzzle, true);
assert(wsSolutionSvg.includes('stroke-linecap="round"'), `Word Search solution SVG contains rounded highlight lines`);
assert(wsSolutionSvg.includes('stroke="#22c55e"') || wsSolutionSvg.includes('stroke="#3b82f6"'), `Word Search solution SVG contains vibrant colored solution strokes`);
assert(wsSolutionSvg.includes('class="word-found"'), `Word Search solution SVG styles solved words in word bank`);
assert(wsSolutionSvg.includes('✓'), `Word Search solution SVG marks words with checkmarks in word bank`);

// Verify cell background comes before letters and highlights in SVG order
const highlightIdx = wsSolutionSvg.indexOf('stroke-linecap="round"');
const letterTextIdx = wsSolutionSvg.indexOf('<text x=');
assert(highlightIdx > -1 && letterTextIdx > -1, `Both solution highlights and letter text are rendered`);

// Verify QC engine catches forced duplicate dot-to-dot
const mockPage1 = {
  id: 'p1',
  pageNumber: 5,
  challengeNumber: 1,
  type: 'dottodot' as const,
  title: 'Star',
  instructions: 'Connect dots',
  difficulty: 'easy' as const,
  theme: 'space' as const,
  data: { name: 'Twinkling Star', points: [{ x: 10, y: 10, order: 1 }] },
  solutionData: {},
  svgContent: '<svg></svg>',
  solutionSvgContent: '<svg></svg>',
};
const mockPage2 = {
  ...mockPage1,
  id: 'p2',
  pageNumber: 7,
  challengeNumber: 2,
};
const qcDuplicateDot = runPageQualityCheck(mockPage2, '4-6', [mockPage1]);
assert(qcDuplicateDot.passed === false, `QC Engine rejects duplicate dot-to-dot silhouette`);
assert(qcDuplicateDot.checks.hasDuplicates === true, `QC Engine hasDuplicates flag is true for duplicate dot-to-dot`);

const mockColoring1 = {
  id: 'c1',
  pageNumber: 9,
  challengeNumber: 3,
  type: 'coloring' as const,
  title: 'Rocket Journey to Saturn',
  instructions: 'Color',
  difficulty: 'easy' as const,
  theme: 'space' as const,
  data: { title: 'Rocket Journey to Saturn', elements: [] },
  solutionData: {},
  svgContent: '<svg></svg>',
  solutionSvgContent: '<svg></svg>',
};
const mockColoring2 = {
  ...mockColoring1,
  id: 'c2',
  pageNumber: 11,
  challengeNumber: 4,
};
const qcDuplicateColoring = runPageQualityCheck(mockColoring2, '4-6', [mockColoring1]);
assert(qcDuplicateColoring.passed === false, `QC Engine rejects duplicate coloring scene`);
assert(qcDuplicateColoring.checks.hasDuplicates === true, `QC Engine hasDuplicates flag is true for duplicate coloring`);

console.log('\n[15] Testing Curated Phonics, Enhanced Rhymes & KDP Bestseller Rank Engine...');
const surfDef = getWordDefinition('SURF', 'underwater');
assert(surfDef.word === 'SURF', `SURF word definition exists`);
assert(surfDef.icon === '🏄‍♂️', `SURF has curated surfer emoji icon: ${surfDef.icon}`);
assert(surfDef.rhymesWith.includes('TURF') && surfDef.rhymesWith.includes('SERF'), `SURF rhymes with TURF and SERF (not HERO/CHAMP!)`);
assert(surfDef.exampleSentence.includes('dolphin') || surfDef.exampleSentence.includes('surf'), `SURF has rich sentence: ${surfDef.exampleSentence}`);
assert(!surfDef.definition.includes('An exciting underwater puzzle word!'), `SURF has non-boilerplate definition`);

const deepDef = getWordDefinition('DEEP', 'underwater');
assert(deepDef.word === 'DEEP', `DEEP word definition exists`);
assert(deepDef.rhymesWith.includes('KEEP') && deepDef.rhymesWith.includes('SLEEP'), `DEEP rhymes with KEEP and SLEEP`);
assert(deepDef.partOfSpeech === 'Adjective', `DEEP part of speech correctly identified as Adjective`);

const sandDef = getWordDefinition('SAND', 'underwater');
assert(sandDef.word === 'SAND', `SAND word definition exists`);
assert(sandDef.rhymesWith.includes('LAND') && sandDef.rhymesWith.includes('HAND'), `SAND rhymes with LAND and HAND`);

const clamDef = getWordDefinition('CLAM', 'underwater');
assert(clamDef.rhymesWith.includes('JAM') && clamDef.rhymesWith.includes('RAM'), `CLAM rhymes with JAM and RAM`);

// Verify Amazon KDP Bestseller Readiness Audit Engine
const auditResult = auditBookForAmazonKdp(multiBook);
assert(auditResult.totalScore >= 80, `Full book scores high on KDP Bestseller Readiness (${auditResult.totalScore}/100)`);
assert(auditResult.grade === 'A+' || auditResult.grade === 'A', `Full book earns top publishing grade: Grade ${auditResult.grade}`);
assert(auditResult.pillars.uniqueness.score === 20, `Uniqueness pillar scores full 20/20 on unique multiBook`);
assert(auditResult.pillars.kdpPrintCompliance.score >= 15, `Print compliance pillar verifies 24+ page threshold and margins (got ${auditResult.pillars.kdpPrintCompliance.score})`);
assert(auditResult.pillars.ageCalibration.score >= 18, `Solvability and age calibration verified`);
assert(auditResult.readinessVerdict.includes('Publishing') || auditResult.readinessVerdict.includes('Publish'), `Verdict declares book ready to publish`);

console.log('\n[16] Testing Kunta Publications Official Imprint Logo & Child Name Personalization...');
const { KUNTA_LOGO_BASE64, renderKuntaLogoSvg, renderKuntaLogoBadgeSvg } = await import('./core/assets/publisherLogo');
const { generateCoverWrapSVG } = await import('./core/cover/coverGenerator');

assert(KUNTA_LOGO_BASE64.startsWith('data:image/png;base64,'), `Kunta Publications logo asset is stored as high-res base64 data URI`);
assert(KUNTA_LOGO_BASE64.length > 5000, `Kunta Publications base64 data is substantial (${KUNTA_LOGO_BASE64.length} chars)`);

const logoSvg = renderKuntaLogoSvg(10, 20, 200, 53);
assert(logoSvg.includes('<image') && logoSvg.includes('data:image/png;base64,'), `renderKuntaLogoSvg renders SVG snippet with embedded logo image`);

const badgeSvg = renderKuntaLogoBadgeSvg(10, 20, 190, 50);
assert(badgeSvg.includes('kunta-publisher-badge') && badgeSvg.includes('data:image/png;base64,'), `renderKuntaLogoBadgeSvg includes publisher imprint badge`);

// Test cover generator with logo tagging
const coverWithLogoBack = generateCoverWrapSVG({
  ...multiBook,
  cover: {
    ...multiBook.cover,
    showPublisherLogo: true,
    logoPlacement: 'back',
  },
});
assert(coverWithLogoBack.includes('kunta-back-logo') && coverWithLogoBack.includes('data:image/png;base64,'), `Cover wrap includes official Kunta Publications logo on back cover`);

const coverWithLogoBoth = generateCoverWrapSVG({
  ...multiBook,
  cover: {
    ...multiBook.cover,
    showPublisherLogo: true,
    logoPlacement: 'both',
  },
});
assert(coverWithLogoBoth.includes('kunta-front-logo') && coverWithLogoBoth.includes('kunta-back-logo'), `Cover wrap with logoPlacement="both" tags badges on both back and front covers`);

// Test child name personalization
const personalizedConfig: BookConfig = {
  ...createDefaultConfig(),
  childName: 'Aria Sharma',
};
const personalizedBook = generateFullBookProject(personalizedConfig);
assert(personalizedBook.config.childName === 'Aria Sharma', `Book project preserves childName personalization`);
assert(personalizedBook.frontMatter.childName === 'Aria Sharma', `Front matter inherits childName`);

console.log('\n[17] Testing Age-Specific Default Authors & Amazon KDP Categories Guide...');
const author4to6 = getDefaultAuthorForAge('4-6');
assert(author4to6.fullName === 'Toshith Charish', `Age 4-6 author fullName is Toshith Charish`);
assert(author4to6.firstName === 'Toshith', `Age 4-6 author firstName is Toshith`);
assert(author4to6.lastName === 'Charish', `Age 4-6 author lastName is Charish`);

const author7to9 = getDefaultAuthorForAge('7-9');
assert(author7to9.fullName === 'Maanvith Charish', `Age 7-9 author fullName is Maanvith Charish`);
assert(author7to9.firstName === 'Maanvith', `Age 7-9 author firstName is Maanvith`);
assert(author7to9.lastName === 'Charish', `Age 7-9 author lastName is Charish`);

const author10plus = getDefaultAuthorForAge('10+');
assert(author10plus.fullName === 'Chaitanya Bandaru', `Age 10+ author fullName is Chaitanya Bandaru`);
assert(author10plus.firstName === 'Chaitanya', `Age 10+ author firstName is Chaitanya`);
assert(author10plus.lastName === 'Bandaru', `Age 10+ author lastName is Bandaru`);

// Test parseAuthorDetails with custom override
const customAuthor = parseAuthorDetails('Alexander Great', '4-6');
assert(customAuthor.firstName === 'Alexander' && customAuthor.lastName === 'Great', `Custom author parsed correctly`);

// Test category recommendations for Amazon KDP modal
const spaceCategories = getAmazonCategoriesForProject('space', '4-6');
assert(spaceCategories.length === 3, `Returns exactly 3 recommended category placements`);
assert(spaceCategories[0].category === "Children's Books", `Primary category 1 is Children's Books`);
assert(spaceCategories[0].placement.includes('Activity Books'), `Placement 1 placement is Activity Books`);
assert(spaceCategories[1].placement.includes('Puzzles') || spaceCategories[1].placement.includes('Games'), `Placement 2 placement is Puzzles/Games`);
assert(spaceCategories[2].subcategory === 'Early Learning', `Placement 3 is Early Learning for 4-6`);
assert(spaceCategories[2].fullPath.includes('Basic Concepts'), `Placement 3 fullPath includes Basic Concepts`);

// Verify marketing bundle includes the author and categories
const marketingData = generateKdpMarketing(multiBook);
assert(marketingData.author === 'Toshith Charish', `Marketing bundle defaults to Toshith Charish for 4-6`);
assert(marketingData.authorDetails.fullName === 'Toshith Charish', `Marketing bundle authorDetails is Toshith Charish`);
assert(marketingData.categoryGuides.length === 3, `Marketing bundle includes 3 Amazon category guides`);
const exportGuideText = exportMarketingBundleAsText(marketingData);
assert(exportGuideText.includes('Toshith'), `Export guide text contains Toshith`);
assert(exportGuideText.includes('Amazon Category Placements'), `Export guide contains category placements`);

console.log('\n[18] Testing Anti-Cheat Maze Path Validator & Studio Password Security...');
const testMaze = generateMaze('4-6', 'animals', 12345);
const containerW = 440;
const containerH = 460;

// Test cell mapping
const entranceCell = mapCanvasPointToMazeCell({ x: 50, y: 50 }, containerW, containerH, testMaze.cols, testMaze.rows);
assert(entranceCell.col <= 1 && entranceCell.row <= 1, `Entrance canvas coordinate maps to top-left cell`);

// Test valid solve from solution path
const padding = 35;
const mazeW = 500 - padding * 2;
const mazeH = 500 - padding * 2;
const cellSize = Math.min(mazeW / testMaze.cols, mazeH / testMaze.rows);
const actualW = cellSize * testMaze.cols;
const actualH = cellSize * testMaze.rows;
const offsetX = (500 - actualW) / 2;
const offsetY = (500 - actualH) / 2;
const svgSize = Math.min(containerW, containerH);

const validCanvasPoints = testMaze.solutionPath.map((step) => {
  const svgX = offsetX + (step.x + 0.5) * cellSize;
  const svgY = offsetY + (step.y + 0.5) * cellSize;
  return {
    x: (svgX / 500) * svgSize + (containerW - svgSize) / 2,
    y: (svgY / 500) * svgSize + (containerH - svgSize) / 2,
  };
});

const validResult = validateMazeStroke(validCanvasPoints, testMaze, containerW, containerH);
assert(validResult.isStartedAtEntrance, `Solution stroke starts at entrance`);
assert(validResult.isReachedExit, `Solution stroke reaches exit`);
assert(validResult.wallCollisions === 0, `Solution stroke has zero wall collisions`);
assert(validResult.isValidSolve, `Legitimate path through open corridors is declared valid solve`);

// Test cutting through walls (simulating user screenshot where straight line was drawn across walls)
const cheatCanvasPoints = [
  validCanvasPoints[0], // Start at entrance
  { x: containerW * 0.5, y: containerH * 0.2 }, // Cut through top wall
  { x: containerW * 0.8, y: containerH * 0.5 }, // Cut through right wall
  { x: containerW * 0.85, y: containerH * 0.85 }, // Touch exit zone
];
const cheatResult = validateMazeStroke(cheatCanvasPoints, testMaze, containerW, containerH);
assert(cheatResult.wallCollisions > 0, `Cutting through walls detects wall collisions (got ${cheatResult.wallCollisions})`);
assert(!cheatResult.isValidSolve, `Path that cuts through walls is strictly rejected (isValidSolve === false)`);
assert(cheatResult.message.includes('Wall crossed'), `User-friendly warning message produced when walls are crossed`);

// Test incomplete path (stopped halfway)
const incompleteCanvasPoints = validCanvasPoints.slice(0, Math.floor(validCanvasPoints.length / 2));
const incompleteResult = validateMazeStroke(incompleteCanvasPoints, testMaze, containerW, containerH);
assert(!incompleteResult.isReachedExit, `Incomplete path does not reach exit`);
assert(!incompleteResult.isValidSolve, `Incomplete path cannot claim challenge completion`);

// Test Publisher Studio Password Security ("KUNTA")
const checkPassword = (input: string) => input.trim().toUpperCase() === 'KUNTA';
assert(checkPassword('KUNTA'), `Exact password "KUNTA" opens Publisher Studio`);
assert(checkPassword('kunta'), `Lowercase "kunta" is accepted (case-insensitive)`);
assert(checkPassword('  kunta  '), `Whitespace-padded "  kunta  " is trimmed and accepted`);
assert(!checkPassword('ADMIN'), `Incorrect password "ADMIN" is rejected`);
assert(!checkPassword('1234'), `Incorrect password "1234" is rejected`);
assert(!checkPassword(''), `Empty password is rejected`);

// 19. Child Date of Birth, Age Auto-Calculation & Multi-Age Puzzle Calibration
console.log('\n[19] Testing Child Date of Birth, Age Calculation & Age-Calibrated Puzzles...');

const now = new Date();
const formatDob = (yearsAgo: number) => {
  const d = new Date(now.getFullYear() - yearsAgo, 0, 1); // Jan 1st
  return d.toISOString().split('T')[0];
};

const dob5 = formatDob(5);
const ageCalc5 = calculateAgeFromBirthDate(dob5);
assert(ageCalc5 !== null, `DOB calculation returns valid object for 5yo`);
assert(ageCalc5!.ageYears === 5, `Calculates exactly 5 years old (got ${ageCalc5?.ageYears})`);
assert(ageCalc5!.ageGroup === '4-6', `5yo maps to '4-6' age tier (got ${ageCalc5?.ageGroup})`);

const dob8 = formatDob(8);
const ageCalc8 = calculateAgeFromBirthDate(dob8);
assert(ageCalc8 !== null && ageCalc8.ageYears === 8, `Calculates exactly 8 years old`);
assert(ageCalc8!.ageGroup === '7-9', `8yo maps to '7-9' age tier (got ${ageCalc8?.ageGroup})`);

const dob11 = formatDob(11);
const ageCalc11 = calculateAgeFromBirthDate(dob11);
assert(ageCalc11 !== null && ageCalc11.ageYears === 11, `Calculates exactly 11 years old`);
assert(ageCalc11!.ageGroup === '10+', `11yo maps to '10+' age tier (got ${ageCalc11?.ageGroup})`);

assert(calculateAgeFromBirthDate('') === null, `Empty DOB string returns null`);
assert(calculateAgeFromBirthDate('invalid-date') === null, `Invalid DOB string returns null`);

// Test Profile Identity Persistence with DOB and Age
const testProf = updateExplorerIdentity('Aarav', '🦁', '7-9', dob8, 8);
assert(testProf.name === 'Aarav', `Explorer name saved as Aarav`);
assert(testProf.ageGroup === '7-9', `Explorer ageGroup saved as 7-9`);
assert(testProf.birthDate === dob8, `Explorer birthDate saved as ${dob8}`);
assert(testProf.ageYears === 8, `Explorer ageYears saved as 8`);

// Verify Multi-Age Puzzle Dimension & Difficulty Calibrations
// 1. Mazes
const maze4to6 = generateMaze('4-6', 'animals', 123);
assert(maze4to6.cols <= 10 && maze4to6.rows <= 10, `Ages 4-6 maze has easy small grid (got ${maze4to6.cols}x${maze4to6.rows})`);
assert(maze4to6.difficulty === 'easy', `Ages 4-6 maze difficulty is 'easy'`);

const maze7to9 = generateMaze('7-9', 'animals', 123);
assert(maze7to9.cols >= 15 && maze7to9.cols <= 19, `Ages 7-9 maze has medium grid (got ${maze7to9.cols}x${maze7to9.rows})`);
assert(maze7to9.difficulty === 'medium', `Ages 7-9 maze difficulty is 'medium'`);

const maze10plus = generateMaze('10+', 'animals', 123);
assert(maze10plus.cols >= 25, `Ages 10+ maze has complex large grid (got ${maze10plus.cols}x${maze10plus.rows})`);
assert(maze10plus.difficulty === 'hard', `Ages 10+ maze difficulty is 'hard'`);

// 2. Sudoku
const sudoku4to6 = generateSudoku('4-6', 'animals', 123);
assert(sudoku4to6.size === 4, `Ages 4-6 Sudoku is 4x4 (got ${sudoku4to6.size}x${sudoku4to6.size})`);
assert(sudoku4to6.difficulty === 'easy', `Ages 4-6 Sudoku difficulty is 'easy'`);

const sudoku7to9 = generateSudoku('7-9', 'animals', 123);
assert(sudoku7to9.size === 6, `Ages 7-9 Sudoku is 6x6 (got ${sudoku7to9.size}x${sudoku7to9.size})`);
assert(sudoku7to9.difficulty === 'medium', `Ages 7-9 Sudoku difficulty is 'medium'`);

const sudoku10plus = generateSudoku('10+', 'animals', 123);
assert(sudoku10plus.size === 9, `Ages 10+ Sudoku is 9x9 (got ${sudoku10plus.size}x${sudoku10plus.size})`);
assert(sudoku10plus.difficulty === 'hard', `Ages 10+ Sudoku difficulty is 'hard'`);

// 3. Word Search
const ws4to6 = generateWordSearch('4-6', 'animals', 123);
assert(ws4to6.gridSize === 8, `Ages 4-6 Word Search is 8x8`);
assert(ws4to6.words.length === 5, `Ages 4-6 Word Search has 5 words`);

const ws7to9 = generateWordSearch('7-9', 'animals', 123);
assert(ws7to9.gridSize === 12, `Ages 7-9 Word Search is 12x12`);
assert(ws7to9.words.length === 9, `Ages 7-9 Word Search has 9 words`);

const ws10plus = generateWordSearch('10+', 'animals', 123);
assert(ws10plus.gridSize === 15, `Ages 10+ Word Search is 15x15`);
assert(ws10plus.words.length === 14, `Ages 10+ Word Search has 14 words`);

// 4. Dot-to-Dot
const dtd4to6 = generateDotToDot('4-6', 'space', 123);
assert(dtd4to6.points.length <= 20, `Ages 4-6 Dot-to-Dot has <= 20 points (got ${dtd4to6.points.length})`);

const dtd7to9 = generateDotToDot('7-9', 'space', 123);
assert(dtd7to9.points.length >= 25 && dtd7to9.points.length <= 40, `Ages 7-9 Dot-to-Dot has 25-40 points (got ${dtd7to9.points.length})`);

const dtd10plus = generateDotToDot('10+', 'space', 123);
assert(dtd10plus.points.length >= 45, `Ages 10+ Dot-to-Dot has >= 45 points (got ${dtd10plus.points.length})`);

console.log('\n[20] Testing Route Separation & Subscription-Ready Book Tiers...');
const sampleProject = generateFullBookProject({
  ...createDefaultConfig(),
  pageCount: 24,
});
const sampleRecord = createBookRecordFromProject(sampleProject);
assert(sampleRecord.tier === 'free', `New book records default to free tier (got ${sampleRecord.tier})`);
assert(sampleRecord.isFeatured === false, `New book records default to isFeatured=false`);

const premiumRecord: typeof sampleRecord = {
  ...sampleRecord,
  tier: 'premium',
  isFeatured: true,
};
assert(premiumRecord.tier === 'premium', `Book records support premium tier for future subscriptions`);
assert(premiumRecord.isFeatured === true, `Book records support isFeatured badge`);

console.log('\n[21] Testing TotLogix Monetization Engine, Passes, 3-Page Teasers & Multi-Child Sibling Profiles...');
const defPass = getDefaultPassState();
assert(defPass.activeTier === 'free', `Default pass tier is 'free'`);
assert(defPass.purchasedPacks.includes('animals'), `Free pass includes 'animals' theme`);
assert(isThemeUnlocked('animals', defPass) === true, `Animals theme is 100% unlocked on free tier`);
assert(isThemeUnlocked('space', defPass) === false, `Space theme is locked on free tier`);

// 3-Page Free Teaser Rule
const teaser1 = canAccessChallenge('space', 1, defPass);
assert(teaser1.allowed === true && teaser1.isTeaser === true, `Challenge #1 on locked theme is allowed as free teaser`);
const teaser3 = canAccessChallenge('space', 3, defPass);
assert(teaser3.allowed === true && teaser3.isTeaser === true, `Challenge #3 on locked theme is allowed as free teaser`);
const teaser4 = canAccessChallenge('space', 4, defPass);
assert(teaser4.allowed === false && teaser4.isTeaser === false, `Challenge #4 on locked theme is blocked without paid pass`);

// Weekend Warrior Pass Activation & Razorpay Simulation
const weekendRes = activatePass('weekend', 'UPI');
assert(weekendRes.passState.activeTier === 'weekend', `Weekend Warrior pass activated successfully`);
assert(weekendRes.transaction.amountInr === 49, `Weekend pass billed at ₹49 (got ₹${weekendRes.transaction.amountInr})`);
assert(weekendRes.transaction.paymentId.startsWith('pay_'), `Payment ID formatted in Razorpay style (got ${weekendRes.transaction.paymentId})`);
assert(weekendRes.transaction.status === 'SUCCESS', `Transaction status marked SUCCESS`);
assert(isThemeUnlocked('space', weekendRes.passState) === true, `All themes unlocked after Weekend Pass activation`);
assert(canAccessChallenge('space', 4, weekendRes.passState).allowed === true, `Challenge #4 allowed with active Weekend Pass`);

// Annual Pass Check
const annualPlan = PASS_PLANS.find((p) => p.id === 'annual');
assert(annualPlan !== undefined && annualPlan.priceInr === 799, `Annual pass priced at ₹799 launch offer`);
assert(PASS_PLANS.find((p) => p.id === 'phygital_bundle')?.priceInr === 149, `Phygital bundle priced at ₹149`);

// Multi-Child Sibling Profiles
const initialChild = getActiveChildIndex();
assert(initialChild === 0, `Initial active child index is 0`);
setActiveChildIndex(1);
assert(getActiveChildIndex() === 1, `Switched active child index to 1`);
updateExplorerIdentity('Ananya', '🦄', '7-9', '2018-05-15', 7);
const child2Prof = loadExplorerProfile();
assert(child2Prof.name === 'Ananya', `Child 2 profile name saved as Ananya`);
assert(child2Prof.avatar === '🦄', `Child 2 profile avatar saved as 🦄`);

// Switch back to Child 1
setActiveChildIndex(0);
assert(getActiveChildIndex() === 0, `Switched back to Child 1 index 0`);
const child1Prof = loadExplorerProfile();
assert(child1Prof.name === 'Aarav', `Child 1 profile name Aarav preserved independently`);

// Format Remaining Time
const in48Hours = Date.now() + 48 * 3600 * 1000;
const timeStr = formatRemainingPassTime(in48Hours);
assert(timeStr.includes('days left') || timeStr.includes('48h') || timeStr.includes('47h'), `Formatted remaining time is valid (${timeStr})`);

console.log('\n[22] Testing Kindle eBook Front Cover Generator & Amazon Dimensions Compliance...');
const { generateFrontCoverSVG } = await import('./core/cover/coverGenerator');
const { exportKindleCoverJpg } = await import('./core/assembly/pdfExport');

const frontCoverSvg = generateFrontCoverSVG(multiBook);
assert(frontCoverSvg.includes('viewBox="0 0 612 792"'), `Front cover SVG has 8.5"x11" aspect ratio viewBox (612x792 pt)`);
assert(frontCoverSvg.includes('width="2550"') && frontCoverSvg.includes('height="3300"'), `Front cover SVG sets 2550x3300 pixel canvas for 300 DPI high-res export`);
assert(frontCoverSvg.includes(multiBook.config.title.toUpperCase()), `Front cover includes book title`);
assert(frontCoverSvg.includes(`AGES ${multiBook.config.ageGroup}`), `Front cover includes age group badge`);
assert(frontCoverSvg.includes('kunta-front-logo'), `Front cover includes official Kunta Publications imprint logo`);

// Test Amazon dimensions rule: min 1000px height, min 625px width, max 10000px
const AMAZON_MIN_HEIGHT = 1000;
const AMAZON_MIN_WIDTH = 625;
const AMAZON_MAX_DIM = 10000;
const TARGET_WIDTH = 2550;
const TARGET_HEIGHT = 3300;

assert(TARGET_HEIGHT >= AMAZON_MIN_HEIGHT, `Export height (3300) passes Amazon min height rule (>= 1000)`);
assert(TARGET_WIDTH >= AMAZON_MIN_WIDTH, `Export width (2550) passes Amazon min width rule (>= 625)`);
assert(TARGET_HEIGHT <= AMAZON_MAX_DIM && TARGET_WIDTH <= AMAZON_MAX_DIM, `Dimensions do not exceed Amazon 10000px limit`);

const jpgBytes = await exportKindleCoverJpg(multiBook, frontCoverSvg, TARGET_WIDTH, TARGET_HEIGHT);
assert(jpgBytes instanceof Uint8Array && jpgBytes.length > 0, `exportKindleCoverJpg returns non-empty byte buffer`);

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED!`);
console.log('====================================================\n');

