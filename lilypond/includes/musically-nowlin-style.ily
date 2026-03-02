\version "2.24.4"

%% Musically Nowlin Games — LilyPond house style
%% Include this in every .ly file for consistent output.

%% Fragment mode: no titles, headers, footers, or page numbers
\header {
  tagline = ##f
}

\paper {
  indent = 0
  ragged-right = ##t
  %% Tight cropping for web use
  #(set-paper-size "a10" 'landscape)
  top-margin = 2
  bottom-margin = 2
  left-margin = 2
  right-margin = 2
}

\layout {
  %% Compact staff size suitable for game UI (~16pt)
  #(layout-set-staff-size 18)

  \context {
    \Score
    %% Remove bar numbers for fragments
    \remove "Bar_number_engraver"
    %% Remove time signature for single-symbol fragments
    \override TimeSignature.stencil = ##f
  }
  \context {
    \Staff
    %% Transparent background (SVG default)
    \override StaffSymbol.color = #black
  }
}
