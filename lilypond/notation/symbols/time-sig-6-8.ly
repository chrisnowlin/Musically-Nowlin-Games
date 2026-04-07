\version "2.24.4"
\include "../../includes/musically-nowlin-style.ily"

{
  \override Score.TimeSignature.stencil = #ly:time-signature::print
  \time 6/8
  s2.
}
