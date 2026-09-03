import React from "react";

// Round rubber-stamp mark used by both bill memos. Inline SVG so the curved
// ring text stays crisp at any size and prints cleanly.
//
// Ring geometry: outer ring r=93, inner ring r=72, and both curved labels sit
// on r=82 so their glyphs land in the 72..93 band — top text grows outward,
// bottom text inward.

interface BillStampProps {
  /** Big word in the middle — e.g. PAID / PENDING. */
  label: string;
  /** Amount in rupees, rendered under the label. */
  amount: number;
  /** Curved text along the bottom of the ring. */
  caption: string;
  /** Ink colour. */
  color: string;
  /**
   * Label type size. Defaults suit a 4-letter word; pass a smaller value for
   * longer labels so they clear the inner ring.
   */
  labelFontSize?: number;
  labelLetterSpacing?: number;
  /** Stamp tilt in degrees. */
  rotation?: number;
}

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const BillStamp: React.FC<BillStampProps> = ({
  label,
  amount,
  caption,
  color,
  labelFontSize = 26,
  labelLetterSpacing = 4,
  rotation = -12,
}) => {
  // textPath ids must be unique per stamp instance, or two stamps on one page
  // would both resolve to the first set of arcs.
  const topArcId = `stampArcTop-${label}`;
  const bottomArcId = `stampArcBottom-${label}`;

  return (
    <svg
      viewBox='0 0 200 200'
      role='img'
      aria-label={`${label} ${formatINR(amount)}`}
      className='w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0'
      style={{ transform: `rotate(${rotation}deg)`, opacity: 0.88 }}
    >
      <defs>
        <path id={topArcId} d='M 18,100 A 82,82 0 0 1 182,100' />
        <path id={bottomArcId} d='M 18,100 A 82,82 0 0 0 182,100' />
      </defs>

      <g fill='none' stroke={color}>
        <circle cx='100' cy='100' r='93' strokeWidth={3} />
        <circle cx='100' cy='100' r='72' strokeWidth={1.5} />
      </g>

      <g
        fill={color}
        fontSize={10.5}
        fontWeight={700}
        letterSpacing='2.2'
        textAnchor='middle'
      >
        <text>
          <textPath href={`#${topArcId}`} startOffset='50%'>
            TSANGPOOL HONDA
          </textPath>
        </text>
        <text>
          <textPath href={`#${bottomArcId}`} startOffset='50%'>
            {caption}
          </textPath>
        </text>
        <text x='18' y='105' fontSize={13}>
          ★
        </text>
        <text x='182' y='105' fontSize={13}>
          ★
        </text>
      </g>

      <g fill={color} textAnchor='middle'>
        <text
          x='100'
          y='92'
          fontSize={labelFontSize}
          fontWeight={900}
          letterSpacing={labelLetterSpacing}
          fontFamily='Georgia, serif'
        >
          {label}
        </text>
        <text
          x='100'
          y='126'
          fontSize={24}
          fontWeight={700}
          fontFamily='monospace'
        >
          {formatINR(amount)}
        </text>
      </g>

      <g stroke={color} strokeWidth={1.5}>
        <line x1='58' y1='100' x2='142' y2='100' />
        <line x1='72' y1='141' x2='128' y2='141' />
      </g>
    </svg>
  );
};

export default BillStamp;
