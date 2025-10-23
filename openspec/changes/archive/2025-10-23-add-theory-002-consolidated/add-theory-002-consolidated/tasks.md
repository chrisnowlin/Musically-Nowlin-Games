## 1. Architecture & Setup
- [ ] 1.1 Design multi-mode architecture
  - Define mode interface and structure
  - Design mode switching mechanism
  - Plan shared vs mode-specific components
  - Design state management for multi-mode
- [ ] 1.2 Create mode definitions (theory-002Modes.ts)
  - Define all 2 modes with metadata
  - Specify mode-specific parameters
  - Define difficulty curves per mode
  - Add mode descriptions and instructions
- [ ] 1.3 Create base game component (Scale BuilderGame.tsx)
  - Implement mode selection UI
  - Create shared game interface
  - Add mode switching logic
  - Implement progress tracking per mode

## 2. Mode Implementation
- [ ] 2.1 Implement mode-specific logic (theory-002Logic.ts)
  - Create round generation for each mode
  - Implement answer validation per mode
  - Add scoring calculation per mode
  - Implement difficulty progression per mode
- [ ] 2.2 Implement audio synthesis per mode
  - Use audioService for all modes
  - Implement mode-specific audio patterns
  - Add success/error tones
  - Optimize audio performance
- [ ] 2.3 Implement UI components per mode
  - Create mode-specific interfaces
  - Add visual feedback per mode
  - Implement interactive elements
  - Ensure consistent styling

## 3. State Management
- [ ] 3.1 Implement multi-mode state management
  - Track current mode
  - Manage mode-specific state
  - Implement mode switching
  - Add state persistence
- [ ] 3.2 Implement progress tracking
  - Track progress per mode
  - Save high scores per mode
  - Implement achievement system
  - Add statistics dashboard
- [ ] 3.3 Implement difficulty progression
  - Progressive difficulty per mode
  - Adaptive difficulty based on performance
  - Mode-specific difficulty curves
  - Difficulty bounds per mode

## 4. Testing
- [ ] 4.1 Write unit tests for all modes
  - Test round generation per mode
  - Test answer validation per mode
  - Test score calculation per mode
  - Test difficulty progression per mode
- [ ] 4.2 Write component tests
  - Test mode selection
  - Test mode switching
  - Test UI rendering per mode
  - Test user interactions
- [ ] 4.3 Write integration tests
  - Test complete gameplay flow
  - Test mode transitions
  - Test progress persistence
  - Test audio synthesis
- [ ] 4.4 Accessibility testing
  - Test keyboard navigation
  - Test screen reader compatibility
  - Test focus management
  - Run axe-core audit

## 5. Integration
- [ ] 5.1 Register consolidated game in config
  - Add GameConfig entry
  - Set route, status, icon, color
  - Add difficulty and age range
  - Mark as consolidated game
- [ ] 5.2 Add game route
  - Import game page component
  - Add Route with path
  - Ensure lazy loading
- [ ] 5.3 Update landing page
  - Verify game appears in grid
  - Test navigation
  - Verify game card display
- [ ] 5.4 Test navigation
  - Test direct URL access
  - Test from landing page
  - Test back button
  - Test browser history

## 6. Performance Optimization
- [ ] 6.1 Optimize rendering
  - Use React.memo for expensive components
  - Implement useCallback for handlers
  - Use useMemo for computed values
  - Minimize re-renders
- [ ] 6.2 Optimize audio
  - Reuse audio context across modes
  - Implement audio node pooling
  - Minimize audio latency
  - Test on low-end devices
- [ ] 6.3 Optimize bundle size
  - Ensure lazy loading works
  - Minimize dependencies
  - Use tree shaking
  - Target <40KB gzipped

## 7. Documentation
- [ ] 7.1 Document game architecture
  - Document multi-mode design
  - Document mode definitions
  - Document state management
  - Add architecture diagrams
- [ ] 7.2 Document each mode
  - Document mode mechanics
  - Document scoring rules
  - Document difficulty progression
  - Add JSDoc comments
- [ ] 7.3 Update README
  - Add consolidated game to list
  - Document mode count
  - Document age range and difficulty
  - Update game count

## 8. Quality Assurance
- [ ] 8.1 Cross-browser testing
  - Test on Chrome, Firefox, Safari, Edge
  - Test on mobile browsers
  - Verify audio works on all browsers
  - Test touch interactions
- [ ] 8.2 Performance testing
  - Verify 60 FPS during gameplay
  - Test audio latency (<100ms)
  - Test on low-end devices
  - Profile with React DevTools
- [ ] 8.3 User testing
  - Test with target age group (7-12)
  - Gather feedback on all modes
  - Test mode switching UX
  - Verify engagement across modes
