import type { CSSProperties } from "react";
import { Trash2 } from "lucide-react";
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
  /** Optional second line — e.g. a parts-stock/job-card diff summary (added/changed/removed, revenue delta). */
  subLabel?: string;
  onOpen: () => void;
  tone?: FolderCardTone;
  /**
   * Optional destructive action. Omitted by default, so the folder grids that
   * have no delete endpoint behind them are unchanged.
   */
  onDelete?: () => void;
  /** Tooltip + aria-label for the delete control. */
  deleteLabel?: string;
  /** Renders the control greyed and inert, with `deleteDisabledReason` as its title. */
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
}

const FolderCard = ({
  title,
  countLabel,
  subLabel,
  onOpen,
  tone = "default",
  onDelete,
  deleteLabel = "Delete",
  deleteDisabled = false,
  deleteDisabledReason,
}: FolderCardProps) => {
  const folder = (
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

  if (!onDelete) return folder;

  /**
   * The delete control is a SIBLING of the folder, never a child of it. The
   * folder is a <label> wrapping a checkbox, so anything inside it shares the
   * folder's click target and its :hover — which previously meant hovering
   * anywhere on the card lit the trash icon, and the control you press to open
   * the folder was the same element that held the control to destroy it.
   * Outside the label it has its own hover, and opening can't land on it.
   */
  return (
    <div className='pa-folder-card'>
      {folder}
      <button
        type='button'
        className='pa-folder__delete'
        aria-label={`${deleteLabel} ${title}`}
        title={
          deleteDisabled
            ? (deleteDisabledReason ?? deleteLabel)
            : `${deleteLabel} ${title}`
        }
        disabled={deleteDisabled}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 aria-hidden='true' />
      </button>
    </div>
  );
};

export default FolderCard;
