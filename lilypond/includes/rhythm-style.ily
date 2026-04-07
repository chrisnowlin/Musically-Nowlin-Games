\version "2.24.4"
\include "musically-nowlin-style.ily"

%% Rhythm pattern style — single-line rhythmic staff with time signature
\layout {
  \context {
    \Score
    \override SpacingSpanner.common-shortest-duration = #(ly:make-moment 1/8)
    %% Re-enable time signatures (house style hides them)
    \revert TimeSignature.stencil
  }
  \context {
    \RhythmicStaff
    \override StaffSymbol.line-count = #1
    \override VerticalAxisGroup.default-staff-staff-spacing.basic-distance = #6
    fontSize = #-1
  }
}
