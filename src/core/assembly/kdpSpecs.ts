export interface KdpDimensions {
  trimWidthInches: number;
  trimHeightInches: number;
  bleedInches: number;
  safeMarginInches: number;
  gutterMarginInches: number;
}

export const KDP_STANDARD_85X11: KdpDimensions = {
  trimWidthInches: 8.5,
  trimHeightInches: 11.0,
  bleedInches: 0.125,
  safeMarginInches: 0.5,
  gutterMarginInches: 0.5,
};

// Points per inch (PDF coordinate standard)
export const PPI = 72;

/**
 * Calculates exact KDP spine width in inches based on page count and paper type.
 * Standard KDP formula for B&W interior on 55# white paper: PageCount * 0.002252 inches
 */
export function calculateSpineWidth(pageCount: number, paperType: 'white' | 'cream' = 'white'): number {
  const multiplier = paperType === 'white' ? 0.002252 : 0.0025;
  // Ensure minimum spine width representation
  return Math.max(0.06, Math.round(pageCount * multiplier * 10000) / 10000);
}

/**
 * Calculates the exact width and height of the full-wrap KDP cover (in inches and PDF points).
 */
export function calculateCoverDimensions(pageCount: number, paperType: 'white' | 'cream' = 'white') {
  const { trimWidthInches, trimHeightInches, bleedInches } = KDP_STANDARD_85X11;
  const spineWidth = calculateSpineWidth(pageCount, paperType);

  // Full Cover Width = Bleed + Back Cover + Spine + Front Cover + Bleed
  const totalWidthInches = bleedInches + trimWidthInches + spineWidth + trimWidthInches + bleedInches;
  // Full Cover Height = Bleed + Trim Height + Bleed
  const totalHeightInches = bleedInches + trimHeightInches + bleedInches;

  return {
    spineWidthInches: spineWidth,
    totalWidthInches,
    totalHeightInches,
    totalWidthPoints: totalWidthInches * PPI,
    totalHeightPoints: totalHeightInches * PPI,
    frontCoverOffsetPoints: (bleedInches + trimWidthInches + spineWidth) * PPI,
    backCoverOffsetPoints: bleedInches * PPI,
    spineOffsetPoints: (bleedInches + trimWidthInches) * PPI,
    spineWidthPoints: spineWidth * PPI,
  };
}
