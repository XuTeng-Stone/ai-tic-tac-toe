"use client";
import { useState } from "react";

export default function Home() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [message, setMessage] = useState("Let's begin, human. I am X, you are O. Oh wait, I'll let you go first.");
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if there is a winner
  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
      [0, 4, 8], [2, 4, 6]             // Diagonal
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = checkWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  const handleClick = async (index) => {
    // Ignore click if the square is filled, AI is thinking, or the game is over
    if (board[index] || isProcessing || winner || isDraw) return;

    const newBoard = [...board];
    newBoard[index] = "X"; // Player plays X
    setBoard(newBoard);
    
    if (checkWinner(newBoard) || (!checkWinner(newBoard) && newBoard.every(s => s !== null))) {
       setMessage("Game over.");
       return;
    }

    setIsProcessing(true);
    setMessage("AI is plotting your defeat...");

    try {
      // Call the backend API
      const res = await fetch("/api/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board: newBoard }),
      });
      
      const data = await res.json();

      if (data.move !== undefined && data.move !== null) {
        newBoard[data.move] = "O"; // AI plays O
        setBoard([...newBoard]);
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("AI found you too boring and refused the connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setMessage("Again? Are you sure you can win this time?");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">AI Tic-Tac-Toe</h1>
        
        {/* AI Message Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 min-h-[80px] flex items-center">
          <p className="text-gray-700 italic font-medium">"{message}"</p>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className="h-24 bg-gray-200 hover:bg-gray-300 text-4xl font-bold flex items-center justify-center rounded transition-colors"
              disabled={isProcessing || cell !== null || winner !== null}
            >
              <span className={cell === 'X' ? 'text-blue-600' : 'text-red-600'}>{cell}</span>
            </button>
          ))}
        </div>

        {/* Game Status and Reset */}
        <div className="text-center">
          {winner && <p className="text-xl font-bold text-red-600 mb-4">{winner === 'X' ? 'You actually won?!' : 'AI Wins! As expected.'}</p>}
          {isDraw && <p className="text-xl font-bold text-gray-600 mb-4">A draw. You got lucky.</p>}
          <button 
            onClick={resetGame}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
          >
            Restart Game
          </button>
        </div>
      </div>
    </main>
  );
}