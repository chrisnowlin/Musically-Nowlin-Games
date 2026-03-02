\version "2.24.4"
\include "../../includes/rhythm-style.ily"

\new RhythmicStaff {
  \cadenzaOn
  \autoBeamOn
  c4. c8 c4 \tuplet 3/2 { c8 c c } c16 c c8 c
}
