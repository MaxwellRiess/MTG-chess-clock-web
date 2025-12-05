# MTG Chess Clock

A web-based chess clock designed specifically for Magic: The Gathering games, featuring dual-player timers, life counters, and phase tracking.

## Features

- ⏱️ **Dual Chess Clocks**: Separate timers for each player with priority-passing mechanism
- ❤️ **Life Counters**: Track life totals for both players with +/- buttons
- 🎯 **Phase Tracking**: Visual indicators for all MTG turn phases (Start, Main 1, Combat, Main 2, End)
- 🔄 **Priority System**: Tap the clock to pass priority; visual indicators show who has priority
- 🎮 **Tabletop Mode**: Flip Player 2's UI for across-the-table play
- ⚙️ **Configurable Settings**: Adjust starting time (default 25 minutes per player)
- 🎨 **Modern UI**: Clean, responsive design with color-coded players (Blue/Orange)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/MaxwellRiess/MTG-chess-clock-web.git
cd MTG-chess-clock-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the localhost URL shown in the terminal (typically `http://localhost:5173`)

## Usage

### Basic Gameplay

1. **Starting a Game**: The app starts with both players at 25:00 and 20 life
2. **Passing Priority**: Tap on the active player's clock area to pass priority to the opponent
3. **Advancing Phases**: Click the "Phase" button in the center control strip to advance through turn phases
4. **Adjusting Life**: Use the +/- buttons in the life counter badges
5. **Pause/Resume**: Click the pause button in the center control strip

### Settings

Click the settings icon to:
- Adjust starting time (in 5-minute increments)
- Toggle Tabletop Mode (flips Player 2's display)
- Reset the game

### Visual Indicators

- **Active Player**: Highlighted background with colored glow (Blue for P1, Orange for P2)
- **Priority Badge**: "PRIORITY" badge appears under the active player's clock
- **Responding Indicator**: "Responding" badge shows when a player has priority during opponent's turn
- **Phase Tracker**: Center control strip shows current phase with color coding by turn player

## Technologies Used

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **PostCSS** - CSS processing

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

ISC

## Author

Maxwell Riess
