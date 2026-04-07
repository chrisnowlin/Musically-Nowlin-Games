import { lazy, Suspense } from 'react';

const StaffNote = lazy(() => import('./StaffNote'));

interface LazyStaffNoteProps {
  noteKey: string;
  clef: 'treble' | 'bass';
  className?: string;
}

/**
 * Lazy-loaded wrapper for StaffNote.
 * Defers VexFlow download until this component is actually rendered.
 */
export default function LazyStaffNote(props: LazyStaffNoteProps) {
  return (
    <Suspense fallback={
      <div className={`flex items-center justify-center text-slate-400 text-lg font-mono ${props.className ?? ''}`}>
        {props.noteKey}
      </div>
    }>
      <StaffNote {...props} />
    </Suspense>
  );
}
