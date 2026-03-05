\version "2.24.4"
\include "../../includes/rhythm-style.ily"

%% Wider paper for mixed-meter patterns (multiple measures)
\paper {
  #(set-paper-size '(cons (* 120 mm) (* 30 mm)))
}

\new RhythmicStaff {
  \time 4/4
  c2 c4 c
  \time 3/4
  c4 c c
  \time 2/4
  c4 c
}
