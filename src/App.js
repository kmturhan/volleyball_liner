import React, { useState, useEffect, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Select from 'react-select';
import html2canvas from 'html2canvas';

const positionOptions = [
  { label: "Outside Hitter", value: "OH" },
  { label: "Opposite", value: "OPP" },
  { label: "Setter", value: "SET" },
  { label: "Middle Blocker", value: "MB" },
  { label: "Libero", value: "LIB" },
  { label: "Defensive Specialist", value: "DS" },
];

const backgroundOptions = [
  { value: "https://res.cloudinary.com/dgamgwne1/image/upload/v1745596404/Frame_2_hyjqww.png", label: "Grey Theme" },
  { value: "https://res.cloudinary.com/dgamgwne1/image/upload/v1745596404/Frame_1_ug6pww.png", label: "Pink Theme" },
];

const calculatePosition = (isTeam1, position) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Base calculations
  const courtWidth = viewportWidth * 0.8;
  const courtHeight = viewportHeight * 0.8;
  
  // Team offsets - adjusted for better positioning
  const teamOffset = courtWidth * 0.2;
  const frontLineOffset = courtWidth * 0.4;
  
  // Additional offsets
  const team2Offset = courtWidth * 0.15;
  const team1Offset = courtWidth * 0.07;
  const team2FrontOffset = courtWidth * 0.03;
  const team1FrontOffset = courtWidth * 0.03;
  
  // Calculate base positions
  let x, y;
  
  if (isTeam1) {
    // Team 1 (Left side)
    switch(position) {
      case 'back-middle': // Player 6
        x = teamOffset + team1Offset - (courtWidth * 0.02);
        y = courtHeight * 0.525;
        break;
      case 'front-left': // Player 4
        x = frontLineOffset + team1Offset + team1FrontOffset - (courtWidth * 0.02);
        y = courtHeight * 0.3;
        break;
      case 'front-right': // Player 2
        x = frontLineOffset + team1Offset + team1FrontOffset - (courtWidth * 0.02);
        y = courtHeight * 0.75;
        break;
      case 'front-middle': // Player 3
        x = frontLineOffset + team1Offset + team1FrontOffset - (courtWidth * 0.02);
        y = courtHeight * 0.525;
        break;
      case 'back-right': // Player 1
        x = teamOffset + team1Offset - (courtWidth * 0.02);
        y = courtHeight * 0.75;
        break;
      case 'back-left': // Player 5
        x = teamOffset + team1Offset - (courtWidth * 0.02);
        y = courtHeight * 0.3;
        break;
    }
  } else {
    // Team 2 (Right side)
    switch(position) {
      case 'back-middle': // Player 12
        x = viewportWidth - teamOffset - team2Offset - (courtWidth * 0.021);
        y = courtHeight * 0.525;
        break;
      case 'front-left': // Player 10
        x = viewportWidth - frontLineOffset - team2Offset - team2FrontOffset - (courtWidth * 0.021);
        y = courtHeight * 0.3;
        break;
      case 'front-right': // Player 8
        x = viewportWidth - frontLineOffset - team2Offset - team2FrontOffset - (courtWidth * 0.021);
        y = courtHeight * 0.75;
        break;
      case 'front-middle': // Player 9
        x = viewportWidth - frontLineOffset - team2Offset - team2FrontOffset - (courtWidth * 0.021);
        y = courtHeight * 0.525;
        break;
      case 'back-right': // Player 7
        x = viewportWidth - teamOffset - team2Offset - (courtWidth * 0.021);
        y = courtHeight * 0.75;
        break;
      case 'back-left': // Player 11
        x = viewportWidth - teamOffset - team2Offset - (courtWidth * 0.021);
        y = courtHeight * 0.3;
        break;
    }
  }
  
  return {
    x: `${(x / viewportWidth) * 100}%`,
    y: `${(y / viewportHeight) * 100}%`
  };
};

const getInitialPositions = () => {
  return [
    // Team 1 (Left side)
    { id: 6, ...calculatePosition(true, 'back-middle'), label: "Player 6" },
    { id: 4, ...calculatePosition(true, 'front-left'), label: "Player 4" },
    { id: 2, ...calculatePosition(true, 'front-right'), label: "Player 2" },
    { id: 3, ...calculatePosition(true, 'front-middle'), label: "Player 3" },
    { id: 1, ...calculatePosition(true, 'back-right'), label: "Player 1" },
    { id: 5, ...calculatePosition(true, 'back-left'), label: "Player 5" },
    // Team 2 (Right side)
    { id: 12, ...calculatePosition(false, 'back-middle'), label: "Player 6" },
    { id: 10, ...calculatePosition(false, 'front-left'), label: "Player 4" },
    { id: 8, ...calculatePosition(false, 'front-right'), label: "Player 2" },
    { id: 9, ...calculatePosition(false, 'front-middle'), label: "Player 3" },
    { id: 7, ...calculatePosition(false, 'back-right'), label: "Player 1" },
    { id: 11, ...calculatePosition(false, 'back-left'), label: "Player 5" }
  ];
};

const DraggablePlayer = ({ player, onDrop, teamColor, isTeam1, displayType, displayValue, textColor, textBackgroundColor }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'PLAYER',
    item: { id: player.id, isTeam1 },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'PLAYER',
    drop: (item) => {
      if (item.id !== player.id && item.isTeam1 === isTeam1) {
        onDrop(item.id, player.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const elementRef = useCallback((node) => {
    drag(drop(node));
  }, [drag, drop]);

  // Calculate responsive sizes based on viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth < 768;
  
  // Calculate icon size based on viewport dimensions
  const iconSize = isMobile 
    ? Math.min(viewportWidth * 0.18, viewportHeight * 0.18)
    : Math.min(viewportWidth * 0.108, viewportHeight * 0.108);
  
  // Calculate text size based on viewport dimensions
  const textSize = isMobile 
    ? Math.min(viewportWidth * 0.0576, viewportHeight * 0.0576)
    : Math.min(viewportWidth * 0.036, viewportHeight * 0.036);
  
  // Calculate label width based on viewport
  const labelWidth = isMobile 
    ? Math.min(viewportWidth * 0.252, viewportHeight * 0.252)
    : Math.min(viewportWidth * 0.18, viewportHeight * 0.18);

  return (
    <div
      ref={elementRef}
      className={`absolute flex flex-col items-center cursor-move transform ${
        isDragging ? 'opacity-50 scale-110 z-50' : 'opacity-100 z-10'
      } ${isOver ? 'scale-105' : ''}`}
      style={{
        left: player.x,
        top: player.y,
        transition: 'all 0.5s ease',
        touchAction: 'none'
      }}
    >
      <div
        className="rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          background: teamColor,
          backgroundImage: teamColor
        }}
      >
        <span style={{ 
          fontSize: `${textSize}px`,
          fontWeight: 'bold',
          color: textColor
        }}>
          {displayValue}
        </span>
      </div>
      <div 
        className="text-center mt-1 outline-none rounded"
        style={{ 
          width: `${labelWidth}px`,
          fontSize: `${textSize * 0.4}px`,
          background: textBackgroundColor,
          color: textColor 
        }}
      >
        {player.label}
      </div>
    </div>
  );
};

const EditPlayerModal = ({ isOpen, onClose, playerIndex, playerName, playerNumber, playerPosition, onSave }) => {
  const [name, setName] = useState(playerName);
  const [number, setNumber] = useState(playerNumber);
  const [position, setPosition] = useState(playerPosition);

  useEffect(() => {
    setName(playerName);
    setNumber(playerNumber);
    setPosition(playerPosition);
  }, [playerName, playerNumber, playerPosition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative transform -translate-y-1/2" style={{ top: '50%' }}>
        <button 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" 
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">Edit Player</h2>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1">Number</label>
          <input
            type="number"
            min="1"
            max="99"
            value={number}
            onChange={e => setNumber(parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Position</label>
          <Select
            options={positionOptions}
            value={positionOptions.find(pos => pos.value === position)}
            onChange={selected => setPosition(selected ? selected.value : "")}
            isClearable
            className="w-full text-sm"
            classNamePrefix="select"
          />
        </div>
        <button
          className="w-full py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600"
          onClick={() => onSave({ name, number, position })}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [players, setPlayers] = useState(getInitialPositions());
  const [isRotating, setIsRotating] = useState(false);
  const [activeTab, setActiveTab] = useState("Main");
  const [team1Color1, setTeam1Color1] = useState("#ff4d4d");
  const [team1Color2, setTeam1Color2] = useState("#666666");
  const [team2Color1, setTeam2Color1] = useState("#4d79ff");
  const [team2Color2, setTeam2Color2] = useState("#666666");
  const [backgroundImage, setBackgroundImage] = useState(backgroundOptions[0].value);
  const [textColor, setTextColor] = useState("#000000");
  const [textBackgroundColor, setTextBackgroundColor] = useState("#ffffff");
  const [playerNames, setPlayerNames] = useState([
    "Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6",  // Team 1
    "Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6"   // Team 2
  ]);
  const [playerNumbers, setPlayerNumbers] = useState([
    1, 2, 3, 4, 5, 6,  // Team 1
    1, 2, 3, 4, 5, 6   // Team 2
  ]);
  const [playerPositions, setPlayerPositions] = useState([
    "OH", "OH", "SET", "OPP", "MB", "MB", // Team 1
    "MB", "MB", "OPP", "SET", "OH", "LIB"  // Team 2
  ]);
  const [displayType, setDisplayType] = useState('number');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlayerIndex, setModalPlayerIndex] = useState(null);

  // Remove mobile-specific calculations
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth < 768;

  const resetAll = () => {
    setPlayers(getInitialPositions());
    setTeam1Color1("#ff4d4d");
    setTeam1Color2("#666666");
    setTeam2Color1("#4d79ff");
    setTeam2Color2("#666666");
    setBackgroundImage(backgroundOptions[0].value);
    setTextColor("#000000");
    setTextBackgroundColor("#ffffff");
    setPlayerNames([
      "Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6",  // Team 1
      "Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6"   // Team 2
    ]);
    setPlayerNumbers([
      1, 2, 3, 4, 5, 6,  // Team 1
      1, 2, 3, 4, 5, 6   // Team 2
    ]);
    setPlayerPositions([
      "OH", "OH", "SET", "OPP", "MB", "MB", // Team 1
      "MB", "MB", "OPP", "SET", "OH", "LIB"  // Team 2
    ]);
    setDisplayType('number');
  };

  const rotateTeam = (team) => {
    if (!isRotating) {
      setIsRotating(true);
      const currentPositions = [...players];
      const positionMap = {};
      
      // Sadece ilgili takımın pozisyonlarını al
      const teamPlayers = currentPositions.filter(player => 
        (team === 1 && player.id <= 6) || (team === 2 && player.id > 6)
      );
      
      // Pozisyon haritasını oluştur
      teamPlayers.forEach(player => {
        positionMap[player.id] = { x: player.x, y: player.y };
      });

      // Team 1 için saat yönünde, Team 2 için saat yönünün tersine rotasyon
      const rotationOrder = team === 1 ? {
        4: 3, 3: 2, 2: 1, 1: 6, 6: 5, 5: 4
      } : {
        10: 9, 9: 8, 8: 7, 7: 12, 12: 11, 11: 10
      };

      // Yeni pozisyonları oluştur
      const newPositions = currentPositions.map(player => {
        // Sadece ilgili takımın oyuncularını rotasyon yap
        if ((team === 1 && player.id <= 6) || (team === 2 && player.id > 6)) {
          const nextId = rotationOrder[player.id];
          const nextPosition = positionMap[nextId];
          return { ...player, x: nextPosition.x, y: nextPosition.y };
        }
        // Diğer takımın oyuncularına dokunma
        return player;
      });

      setPlayers(newPositions);
      setTimeout(() => {
        setIsRotating(false);
      }, 500);
    }
  };

  const handleDrop = (fromId, toId) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const fromIndex = newPlayers.findIndex(p => p.id === fromId);
      const toIndex = newPlayers.findIndex(p => p.id === toId);
      
      // Sadece aynı takımın oyuncuları yer değiştirebilir
      if ((fromId <= 6 && toId <= 6) || (fromId > 6 && toId > 6)) {
        const fromPos = { x: newPlayers[fromIndex].x, y: newPlayers[fromIndex].y };
        const toPos = { x: newPlayers[toIndex].x, y: newPlayers[toIndex].y };
        newPlayers[fromIndex] = { ...newPlayers[fromIndex], x: toPos.x, y: toPos.y };
        newPlayers[toIndex] = { ...newPlayers[toIndex], x: fromPos.x, y: fromPos.y };
      }
      return newPlayers;
    });
  };

  const openEditModal = (playerId) => {
    setModalPlayerIndex(playerId - 1);
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setModalPlayerIndex(null);
  };

  const savePlayerInfo = ({ name, number, position }) => {
    setPlayerNames(prev => {
      const updated = [...prev];
      updated[modalPlayerIndex] = name;
      return updated;
    });
    setPlayerNumbers(prev => {
      const updated = [...prev];
      updated[modalPlayerIndex] = number;
      return updated;
    });
    setPlayerPositions(prev => {
      const updated = [...prev];
      updated[modalPlayerIndex] = position;
      return updated;
    });
    closeEditModal();
  };

  // Add orientation check and force landscape
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;

      if (isMobile && isPortrait) {
        // Portrait mode on mobile
        document.body.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
            z-index: 9999;
          ">
            <h2 style="margin-bottom: 20px;">Lütfen cihazınızı yatay konuma getirin</h2>
            <p>Bu uygulama sadece yatay modda çalışmaktadır.</p>
          </div>
        `;
      } else {
        // Landscape mode or desktop
        if (document.body.innerHTML.includes('Lütfen cihazınızı yatay konuma getirin')) {
          window.location.reload();
        }
      }
    };

    // Initial check
    checkOrientation();

    // Add event listeners
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Add resize listener to update positions when screen size changes
  useEffect(() => {
    const handleResize = () => {
      setPlayers(getInitialPositions());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Settings Panel - Only show on desktop */}
        {window.innerWidth >= 768 && (
          <div className="w-80 bg-white shadow-lg flex flex-col">
            <div className="p-4 border-b">
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded ${
                    activeTab === "Main" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("Main")}
                >
                  Main
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    activeTab === "Players" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                  onClick={() => setActiveTab("Players")}
                >
                  Players
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {activeTab === "Main" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold mb-2">Info</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value="number"
                            checked={displayType === 'number'}
                            onChange={(e) => setDisplayType(e.target.value)}
                            className="form-radio"
                          />
                          <span>Number</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value="position"
                            checked={displayType === 'position'}
                            onChange={(e) => setDisplayType(e.target.value)}
                            className="form-radio"
                          />
                          <span>Position</span>
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Team 1</label>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                            style={{ backgroundColor: team1Color1 }}
                          >
                            <input
                              type="color"
                              value={team1Color1}
                              onChange={(e) => setTeam1Color1(e.target.value)}
                              className="opacity-0 w-full h-full cursor-pointer"
                            />
                          </div>
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                            style={{ backgroundColor: team1Color2 }}
                          >
                            <input
                              type="color"
                              value={team1Color2}
                              onChange={(e) => setTeam1Color2(e.target.value)}
                              className="opacity-0 w-full h-full cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold mb-2">Team 2</label>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                            style={{ backgroundColor: team2Color1 }}
                          >
                            <input
                              type="color"
                              value={team2Color1}
                              onChange={(e) => setTeam2Color1(e.target.value)}
                              className="opacity-0 w-full h-full cursor-pointer"
                            />
                          </div>
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                            style={{ backgroundColor: team2Color2 }}
                          >
                            <input
                              type="color"
                              value={team2Color2}
                              onChange={(e) => setTeam2Color2(e.target.value)}
                              className="opacity-0 w-full h-full cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block font-semibold mb-2">Number / Position Text Color</label>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                          style={{ backgroundColor: textColor }}
                        >
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="opacity-0 w-full h-full cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block font-semibold mb-2">Text Background Color</label>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                          style={{ backgroundColor: textBackgroundColor }}
                        >
                          <input
                            type="color"
                            value={textBackgroundColor}
                            onChange={(e) => setTextBackgroundColor(e.target.value)}
                            className="opacity-0 w-full h-full cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block font-semibold mb-2">Court Background</label>
                      <select
                        value={backgroundImage}
                        onChange={(e) => setBackgroundImage(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        {backgroundOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[1, 2].map((team) => (
                      <div key={team} className="space-y-2">
                        <h3 className="font-semibold">Team {team}</h3>
                        {Array(6)
                          .fill(0)
                          .map((_, index) => {
                            const playerIndex = (team - 1) * 6 + index;
                            return (
                              <div key={playerIndex} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  placeholder={`Player ${index + 1}`}
                                  value={playerNames[playerIndex]}
                                  onChange={(e) => {
                                    const updated = [...playerNames];
                                    updated[playerIndex] = e.target.value;
                                    setPlayerNames(updated);
                                  }}
                                  className="flex-1 p-1 border rounded w-1/2"
                                />
                                <input
                                  type="number"
                                  min="1"
                                  max="99"
                                  value={playerNumbers[playerIndex] || index + 1}
                                  onChange={(e) => {
                                    const updated = [...playerNumbers];
                                    updated[playerIndex] = parseInt(e.target.value) || 0;
                                    setPlayerNumbers(updated);
                                  }}
                                  className="w-12 p-1 border rounded text-center"
                                />
                                <Select 
                                  options={positionOptions} 
                                  value={positionOptions.find(pos => pos.value === playerPositions[playerIndex])} 
                                  onChange={(selected) => { 
                                    const updated = [...playerPositions]; 
                                    updated[playerIndex] = selected ? selected.value : ""; 
                                    setPlayerPositions(updated); 
                                  }} 
                                  formatOptionLabel={({ label, value }, { context }) => context === "value" ? value : `${label} (${value})`} 
                                  isClearable 
                                  className="w-32" 
                                  classNamePrefix="select" 
                                />
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Court Area */}
        <div className="flex-1 relative flex flex-col overflow-hidden h-screen">
          <div className="flex-1 relative h-full">
            <img 
              src={backgroundImage} 
              alt="Court Background" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {players.map((player) => {
              const isTeam1 = player.id <= 6;
              const gradient = isTeam1 
                ? `linear-gradient(135deg, ${team1Color1}, ${team1Color2})`
                : `linear-gradient(135deg, ${team2Color1}, ${team2Color2})`;
              const playerIndex = player.id - 1;
                
              return (
                <div key={player.id} onClick={() => openEditModal(player.id)} style={{zIndex: 20}}>
                  <DraggablePlayer
                    player={{
                      ...player,
                      label: playerNames[playerIndex] || player.label
                    }}
                    onDrop={handleDrop}
                    teamColor={gradient}
                    isTeam1={isTeam1}
                    displayType={displayType}
                    displayValue={displayType === 'number' ? playerNumbers[playerIndex] : playerPositions[playerIndex]}
                    textColor={textColor}
                    textBackgroundColor={textBackgroundColor}
                  />
                </div>
              );
            })}
            
         
            {/* Buttons above logo */}
            <div className="absolute bottom-[1%] left-1/2 transform -translate-x-1/2" style={{ zIndex: 30 }}>
              <div className="flex justify-center items-center space-x-4">
                <button
                  id="rotate-team-1"
                  onClick={() => rotateTeam(1)}
                  disabled={isRotating}
                  className={`${isMobile ? 'text-[1.8vw]' : 'text-base'} rounded text-white ${
                    isRotating ? "opacity-50" : "hover:opacity-90"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${team1Color1}, ${team1Color2})`,
                    padding: isMobile ? '0.8vw 1.5vw' : '0.5rem 1rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Rotate Team 1
                </button>
                <button
                  id="reset-all"
                  onClick={resetAll}
                  className={`${isMobile ? 'text-[1.8vw]' : 'text-base'} rounded bg-red-500 hover:bg-red-600 text-white`}
                  style={{
                    padding: isMobile ? '0.8vw 1.5vw' : '0.5rem 1rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Reset All
                </button>
                <button
                  id="rotate-team-2"
                  onClick={() => rotateTeam(2)}
                  disabled={isRotating}
                  className={`${isMobile ? 'text-[1.8vw]' : 'text-base'} rounded text-white ${
                    isRotating ? "opacity-50" : "hover:opacity-90"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${team2Color1}, ${team2Color2})`,
                    padding: isMobile ? '0.8vw 1.5vw' : '0.5rem 1rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Rotate Team 2
                </button>
              </div>
            </div>
          </div>
          
          <EditPlayerModal
            isOpen={modalOpen && modalPlayerIndex !== null}
            onClose={closeEditModal}
            playerIndex={modalPlayerIndex}
            playerName={modalPlayerIndex !== null ? playerNames[modalPlayerIndex] : ''}
            playerNumber={modalPlayerIndex !== null ? playerNumbers[modalPlayerIndex] : ''}
            playerPosition={modalPlayerIndex !== null ? playerPositions[modalPlayerIndex] : ''}
            onSave={savePlayerInfo}
          />
        </div>
      </div>
    </DndProvider>
  );
}