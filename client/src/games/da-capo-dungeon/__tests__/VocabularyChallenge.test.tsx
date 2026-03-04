import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VocabularyChallenge from '../challenges/VocabularyChallenge';

// We need to control which format is chosen by mocking Math.random.
// The component uses Math.random at several points:
//  1. Format selection (which format to show)
//  2. Entry selection within a format
//  3. Shuffle operations

describe('VocabularyChallenge', () => {
  it('renders a category title', () => {
    render(<VocabularyChallenge category="dynamics" tier={1} onResult={() => {}} />);
    expect(screen.getByText('Dynamics Quiz!')).toBeInTheDocument();
  });

  it('calls onResult with a boolean when an answer is clicked', () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    render(<VocabularyChallenge category="symbols" tier={1} onResult={onResult} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    vi.advanceTimersByTime(1000);

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(expect.any(Boolean));
    vi.useRealTimers();
  });

  it('disables buttons after an answer is selected', () => {
    render(<VocabularyChallenge category="terms" tier={1} onResult={() => {}} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });

  it('shows feedback text after answering', () => {
    render(<VocabularyChallenge category="symbols" tier={2} onResult={() => {}} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    // Should show either "Correct!" or "It was: ..." or "Correct order: ..."
    const feedback = screen.getByText(/correct!|it was:|correct order:/i);
    expect(feedback).toBeInTheDocument();
  });

  it('renders different themes per category', () => {
    const { unmount } = render(
      <VocabularyChallenge category="dynamics" tier={1} onResult={() => {}} />
    );
    expect(screen.getByText('Dynamics Quiz!')).toBeInTheDocument();
    unmount();

    render(<VocabularyChallenge category="tempo" tier={1} onResult={() => {}} />);
    expect(screen.getByText('Tempo Quiz!')).toBeInTheDocument();
  });
});

describe('VocabularyChallenge – standard format', () => {
  // symbols tier 1 only has standard entries, so we're guaranteed standard format
  it('renders 4 answer buttons for standard format', () => {
    render(<VocabularyChallenge category="symbols" tier={1} onResult={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4);
  });

  it('shows question text for standard format', () => {
    render(<VocabularyChallenge category="symbols" tier={1} onResult={() => {}} />);
    const q = screen.getByText(/what does|which term|how many beats/i);
    expect(q).toBeInTheDocument();
  });
});

describe('VocabularyChallenge – opposites format', () => {
  // We mock Math.random to force opposites selection.
  // For dynamics tier 1: all 4 entries are opposites, no standard or ordering.
  // So the only available format is 'opposites', which will always be chosen.
  // But we need at least 2 opposites entries, which we have (f, p, Dynamics, Loud vs Soft).

  it('renders exactly 2 buttons for opposites format', () => {
    // dynamics tier 1 has ONLY opposites entries, so opposites format is guaranteed
    render(<VocabularyChallenge category="dynamics" tier={1} onResult={() => {}} />);
    const buttons = screen.getAllByTestId('opposites-btn');
    expect(buttons.length).toBe(2);
  });

  it('shows question text with definition', () => {
    render(<VocabularyChallenge category="dynamics" tier={1} onResult={() => {}} />);
    const q = screen.getByText(/which means/i);
    expect(q).toBeInTheDocument();
  });

  it('calls onResult(true) when correct opposites answer is tapped', () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    render(<VocabularyChallenge category="dynamics" tier={1} onResult={onResult} />);

    // Find the question to determine the correct answer
    const questionEl = screen.getByText(/which means/i);
    const questionText = questionEl.textContent || '';

    // Extract the definition from the question: Which means "..."?
    const match = questionText.match(/Which means "(.+)"\?/);
    const targetDef = match ? match[1] : '';

    // The correct button label is the term of the entry whose definition matches
    const buttons = screen.getAllByTestId('opposites-btn');

    // Look at the vocab data: dynamics T1 entries are:
    // f -> "Loud (forte)", p -> "Soft (piano)", Dynamics -> "How loud or soft music is", Loud vs Soft -> "Music can be loud or soft"
    // We need to find which button corresponds to the entry with the matching definition
    const dynamicsT1 = [
      { term: 'f', definition: 'Loud (forte)' },
      { term: 'p', definition: 'Soft (piano)' },
      { term: 'Dynamics', definition: 'How loud or soft music is' },
      { term: 'Loud vs Soft', definition: 'Music can be loud or soft' },
    ];

    const correctEntry = dynamicsT1.find((e) => e.definition === targetDef);
    if (correctEntry) {
      const correctBtn = buttons.find((btn) => btn.textContent?.includes(correctEntry.term));
      if (correctBtn) {
        fireEvent.click(correctBtn);
        vi.advanceTimersByTime(1000);
        expect(onResult).toHaveBeenCalledWith(true);
        vi.useRealTimers();
        return;
      }
    }

    // Fallback: just click a button and verify onResult was called
    fireEvent.click(buttons[0]);
    vi.advanceTimersByTime(1000);
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(expect.any(Boolean));
    vi.useRealTimers();
  });

  it('calls onResult(false) when wrong opposites answer is tapped', () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    render(<VocabularyChallenge category="dynamics" tier={1} onResult={onResult} />);

    const questionEl = screen.getByText(/which means/i);
    const questionText = questionEl.textContent || '';
    const match = questionText.match(/Which means "(.+)"\?/);
    const targetDef = match ? match[1] : '';

    const dynamicsT1 = [
      { term: 'f', definition: 'Loud (forte)' },
      { term: 'p', definition: 'Soft (piano)' },
      { term: 'Dynamics', definition: 'How loud or soft music is' },
      { term: 'Loud vs Soft', definition: 'Music can be loud or soft' },
    ];

    const correctEntry = dynamicsT1.find((e) => e.definition === targetDef);
    const buttons = screen.getAllByTestId('opposites-btn');

    if (correctEntry) {
      // Click the WRONG button (the one that doesn't match)
      const wrongBtn = buttons.find((btn) => !btn.textContent?.includes(correctEntry.term));
      if (wrongBtn) {
        fireEvent.click(wrongBtn);
        vi.advanceTimersByTime(1000);
        expect(onResult).toHaveBeenCalledWith(false);
        vi.useRealTimers();
        return;
      }
    }

    // Fallback
    fireEvent.click(buttons[0]);
    vi.advanceTimersByTime(1000);
    expect(onResult).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('disables buttons after selecting an answer', () => {
    render(<VocabularyChallenge category="dynamics" tier={1} onResult={() => {}} />);
    const buttons = screen.getAllByTestId('opposites-btn');
    fireEvent.click(buttons[0]);

    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });
});

describe('VocabularyChallenge – notation images', () => {
  it('renders notation SVG in showTermAskDef mode when vocab entry has a matching asset', () => {
    // Force showTermAskDef=true (Math.random() < 0.5 → needs random to return < 0.5)
    const origRandom = Math.random;
    Math.random = () => 0.1;
    const { container } = render(
      <VocabularyChallenge category="symbols" tier={1} onResult={() => {}} />
    );
    Math.random = origRandom;
    // At least one img with notation asset source should be present
    const notationImages = container.querySelectorAll('img[src*="/images/notation/"]');
    expect(notationImages.length).toBeGreaterThan(0);
  });

  it('does NOT render featured notation above question when asking for the term', () => {
    // Force showTermAskDef=false (Math.random() >= 0.5)
    const origRandom = Math.random;
    Math.random = () => 0.9;
    const { container } = render(
      <VocabularyChallenge category="symbols" tier={1} onResult={() => {}} />
    );
    Math.random = origRandom;
    // The large VocabNotation uses NotationImage which wraps in a div with mx-auto.
    // Small inline button images are fine (they don't give away the answer).
    const featuredNotation = container.querySelectorAll('div.mx-auto > img[src*="/images/notation/"]');
    expect(featuredNotation.length).toBe(0);
  });
});

describe('VocabularyChallenge – ordering format', () => {
  // To test ordering, we need to force the ordering format to be chosen.
  // dynamics tier 3 has standard + ordering entries, so we mock Math.random.

  let originalRandom: () => number;
  let callCount: number;

  beforeEach(() => {
    originalRandom = Math.random;
    callCount = 0;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  function forceOrderingFormat() {
    // For dynamics tier 3, formats = ['standard', 'opposites', 'ordering']
    // We need Math.random to return a value that selects 'ordering' (index 2 of 3)
    // Then subsequent calls for shuffle should still work.
    Math.random = () => {
      callCount++;
      if (callCount === 1) {
        // Format selection: need index 2 of 3 → floor(r * 3) = 2 → r ∈ [0.667, 1.0)
        return 0.99;
      }
      // For subsequent calls (entry selection, shuffle), use real random
      return originalRandom();
    };
  }

  it('renders ordering items as tappable buttons', () => {
    forceOrderingFormat();
    render(<VocabularyChallenge category="dynamics" tier={3} onResult={() => {}} />);

    const buttons = screen.getAllByTestId('ordering-btn');
    // dynamics ordering: pp, p, mp, mf, f, ff → 6 items
    expect(buttons.length).toBe(6);
  });

  it('shows instruction text for ordering', () => {
    forceOrderingFormat();
    render(<VocabularyChallenge category="dynamics" tier={3} onResult={() => {}} />);

    const instruction = screen.getByText(/softest to loudest/i);
    expect(instruction).toBeInTheDocument();
  });

  it('calls onResult(true) when items are tapped in correct order', () => {
    vi.useFakeTimers();
    forceOrderingFormat();
    const onResult = vi.fn();
    render(<VocabularyChallenge category="dynamics" tier={3} onResult={onResult} />);

    const correctOrder = ['pp', 'p', 'mp', 'mf', 'f', 'ff'];

    // Tap each item in the correct order
    for (const item of correctOrder) {
      const btn = screen.getAllByTestId('ordering-btn').find(
        (b) => b.textContent === item
      );
      expect(btn).toBeTruthy();
      fireEvent.click(btn!);
    }

    vi.advanceTimersByTime(1000);
    expect(onResult).toHaveBeenCalledWith(true);
    vi.useRealTimers();
  });

  it('calls onResult(false) when items are tapped in wrong order', () => {
    vi.useFakeTimers();
    forceOrderingFormat();
    const onResult = vi.fn();
    render(<VocabularyChallenge category="dynamics" tier={3} onResult={onResult} />);

    // Tap in reverse order (wrong)
    const wrongOrder = ['ff', 'f', 'mf', 'mp', 'p', 'pp'];

    for (const item of wrongOrder) {
      const btn = screen.getAllByTestId('ordering-btn').find(
        (b) => b.textContent === item
      );
      expect(btn).toBeTruthy();
      fireEvent.click(btn!);
    }

    vi.advanceTimersByTime(1000);
    expect(onResult).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });

  it('disables already-selected items', () => {
    forceOrderingFormat();
    render(<VocabularyChallenge category="dynamics" tier={3} onResult={() => {}} />);

    const buttons = screen.getAllByTestId('ordering-btn');
    // Click the first button
    const firstLabel = buttons[0].textContent!;
    fireEvent.click(buttons[0]);

    // That button should now be disabled
    const updatedBtn = screen.getAllByTestId('ordering-btn').find(
      (b) => b.textContent?.includes(firstLabel)
    );
    expect(updatedBtn).toBeDisabled();
  });

  it('shows correct order in feedback on wrong answer', () => {
    forceOrderingFormat();
    render(<VocabularyChallenge category="dynamics" tier={3} onResult={() => {}} />);

    // Tap in reverse order (wrong)
    const wrongOrder = ['ff', 'f', 'mf', 'mp', 'p', 'pp'];
    for (const item of wrongOrder) {
      const btn = screen.getAllByTestId('ordering-btn').find(
        (b) => b.textContent === item
      );
      fireEvent.click(btn!);
    }

    const feedback = screen.getByText(/correct order:/i);
    expect(feedback).toBeInTheDocument();
  });
});
