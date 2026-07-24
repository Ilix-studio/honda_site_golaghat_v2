import type { CSSProperties } from "react";
import "./FolderCard.css";

export type FolderCardTone = "default" | "warning" | "danger";

const TONE_VARS: Record<FolderCardTone, CSSProperties> = {
  default: {},
  warning: {
    "--folder-back-1": "#f0c94b",
    "--folder-back-2": "#dba82f",
    "--folder-front-1": "#ffe58a",
    "--folder-front-2": "#f6d24e",
    "--folder-edge": "#c9962a",
  } as CSSProperties,
  danger: {
    "--folder-back-1": "#f28a6b",
    "--folder-back-2": "#df5f34",
    "--folder-front-1": "#ffab8f",
    "--folder-front-2": "#f7825a",
    "--folder-edge": "#c85326",
  } as CSSProperties,
};

export interface FolderCardProps {
  title: string;
  countLabel: string;
  /** Optional second line — e.g. a parts-stock diff summary (added/changed/removed, revenue delta). */
  subLabel?: string;
  onOpen: () => void;
  tone?: FolderCardTone;
}

const FolderCard = ({
  title,
  countLabel,
  subLabel,
  onOpen,
  tone = "default",
}: FolderCardProps) => {
  return (
    <label className='pa-folder' style={TONE_VARS[tone]}>
      <input
        type='checkbox'
        className='pa-folder__toggle'
        aria-label={`Open ${title}`}
        onChange={onOpen}
      />
      <span className='pa-folder__shape'>
        <span className='pa-folder__back' />
        <span className='pa-folder__papers'>
          <span className='pa-folder__paper pa-folder__paper--1' />
          <span className='pa-folder__paper pa-folder__paper--2' />
          <span className='pa-folder__paper pa-folder__paper--3' />
        </span>
        <span className='pa-folder__front' />
      </span>
      <span className='pa-folder__meta'>
        <span className='pa-folder__title'>{title}</span>
        <span className='pa-folder__count'>{countLabel}</span>
        {subLabel && <span className='pa-folder__sub'>{subLabel}</span>}
      </span>
    </label>
  );
};

export default FolderCard;
