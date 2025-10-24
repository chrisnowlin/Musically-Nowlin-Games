## 1. Update Level Progression Logic
- [ ] 1.1 Modify GameplayScreen.tsx to track correct answers and trigger level up every 10 correct answers
- [ ] 1.2 Update speed curve to increase by 10-15% with each level advancement, replacing the current 5-step milestone system
- [ ] 1.3 Add level-up visual feedback animation in StaffCanvas.tsx
- [ ] 1.4 Implement level-up sound effect using existing audioService

## 2. Enhance HUD Display
- [ ] 2.1 Update GameplayScreen HUD to prominently display current level
- [ ] 2.2 Add level transition animation when player advances
- [ ] 2.3 Show progress bar toward next level (10 correct answers)

## 3. Update Game State Management
- [ ] 3.1 Modify StaffWarsGame.tsx reducer to handle level progression events
- [ ] 3.2 Add level progression state tracking
- [ ] 3.3 Ensure level state persists through pause/resume cycles

## 4. Testing and Validation
- [ ] 4.1 Test level progression triggers correctly at 10, 20, 30+ correct answers
- [ ] 4.2 Verify difficulty scaling feels balanced across multiple levels
- [ ] 4.3 Confirm visual and audio feedback work correctly on level up
- [ ] 4.4 Validate game state preservation during level transitions