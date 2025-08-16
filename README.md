# 🚀 colour selection using Hand Gesture

A simple game controlled entirely through hand gestures using MediaPipe hand tracking technology!

![Game Preview](hand_landmarks.png)

## 🎮 Features

- **Real-time Hand Gesture Recognition**: Control your spaceship using natural hand movements
- **Beautiful Modern UI**: Futuristic design with smooth animations and particle effects
- **Multiple Difficulty Levels**: Easy, Normal, Hard, and Nightmare modes
- **Power-ups & Achievements**: Collect items and unlock achievements as you play
- **Responsive Design**: Works on desktop and mobile devices
- **Fallback Controls**: Keyboard controls available if camera access is denied

## 🤲 Hand Gestures

| Gesture | Action | Description |
|---------|--------|-------------|
| ✋ Open Palm | Move Up | Raise your spaceship |
| ✊ Closed Fist | Move Down | Lower your spaceship |
| ☝️ Point Up | Shoot | Fire lasers at enemies |
| ✌️ Peace Sign | Shield | Activate protective shield |
| 👍 Thumbs Up | Boost | Speed boost ability |

## 🎯 How to Play

1. **Objective**: Survive waves of enemies while collecting power-ups and achieving high scores
2. **Controls**: Use hand gestures in front of your camera to control the spaceship
3. **Enemies**: 
   - 🔴 Basic (red): Simple moving enemies
   - 🟠 Chaser (orange): Follows your movement
   - 🔴 Shooter (dark red): Fires projectiles at you
4. **Power-ups**:
   - 💚 Health: Restore your spaceship's health
   - 🔵 Shield: Temporary invincibility
   - 🟡 Multishot: Enhanced firing capability

## 🚀 Quick Start

1. **Open the Game**: Open `index.html` in a modern web browser
2. **Allow Camera Access**: Grant permission when prompted for camera access
3. **Calibrate**: Wait for hand tracking to initialize (green status light)
4. **Start Playing**: Click "START MISSION" and begin using hand gestures!

## 📋 System Requirements

- **Browser**: Chrome 88+, Firefox 78+, Safari 14+, or Edge 88+
- **Camera**: Built-in webcam or external USB camera
- **Internet**: Required for MediaPipe CDN resources

## ⌨️ Keyboard Controls (Fallback)

If camera access is denied or hand tracking fails, you can use keyboard controls:

- **↑ Arrow Up**: Move spaceship up
- **↓ Arrow Down**: Move spaceship down
- **Spacebar**: Shoot lasers
- **S Key**: Activate shield
- **B Key**: Speed boost

## 🛠️ Technical Details

### Technologies Used
- **HTML5 Canvas**: Game rendering and graphics
- **MediaPipe Hands**: Real-time hand gesture recognition
- **CSS3**: Modern UI styling with animations
- **Vanilla JavaScript**: Game logic and interaction handling

### Browser Compatibility
- ✅ Chrome/Chromium 88+
- ✅ Firefox 78+
- ✅ Safari 14+
- ✅ Edge 88+

### Performance Optimization
- Efficient canvas rendering with requestAnimationFrame
- Gesture smoothing to reduce false positives
- Particle system optimization for smooth effects
- Responsive design for different screen sizes

## 🎨 Game Features

### Visual Effects
- Animated starfield background
- Particle explosion effects
- Smooth spaceship movement
- Dynamic UI elements with glow effects
- Achievement popup notifications

### Difficulty Progression
- **Easy**: Slower enemies, longer spawn intervals
- **Normal**: Balanced gameplay
- **Hard**: Faster enemies, shorter spawn intervals
- **Nightmare**: Maximum challenge with rapid spawning

### Statistics Tracking
- Real-time accuracy calculation
- Enemy hit counter
- Time played tracker
- Level progression system

## 🏆 Achievements

- **🏆 Score Master**: Reach 1000+ points
- **🎯 Level Champion**: Reach level 5+
- **🎪 Sharpshooter**: Maintain 80%+ accuracy

## 🔧 Customization

You can easily modify the game by editing:
- `styles.css`: Visual appearance and themes
- `game.js`: Game mechanics and difficulty
- `handTracking.js`: Gesture recognition settings
- `app.js`: Application flow and UI behavior

## 🐛 Troubleshooting

### Camera Issues
- Ensure browser has camera permissions
- Check if another application is using the camera
- Try refreshing the page
- Use keyboard controls as fallback

### Performance Issues
- Close other browser tabs
- Ensure good lighting for hand tracking
- Use a modern browser with hardware acceleration

### Gesture Recognition Problems
- Ensure hands are well-lit and visible
- Keep hands within camera frame
- Make clear, distinct gestures
- Wait for green status indicator

## 📱 Mobile Support

The game includes responsive design for mobile devices, though hand tracking may be limited by device capabilities. Touch controls can be added for mobile-specific gameplay.

## 🔮 Future Enhancements

Potential improvements for future versions:
- Multiple hand support for advanced controls
- Voice commands integration
- Multiplayer support
- More enemy types and boss battles
- Custom gesture training
- Sound effects and music
- Save/load game progress
- Leaderboards and social features

## 📄 License

This project is open source and available under the MIT License. Feel free to modify and distribute as needed.

## 🙏 Credits

- **MediaPipe**: Hand tracking technology by Google
- **Font**: Orbitron from Google Fonts
- **Icons**: Emoji characters for universal compatibility

---

**Ready to embark on your space adventure?** 🌌 Just open `index.html` and let your hands guide you through the cosmos! 🚀
