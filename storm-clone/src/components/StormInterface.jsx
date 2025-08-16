import React, { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import IdeationPhase from './IdeationPhase'
import VotingPhase from './VotingPhase'
import ResultsPhase from './ResultsPhase'

const StormInterface = ({ storm, user, onLeaveStorm, onSubmitIdea, onUpdateIdea, onDeleteIdea, onSubmitVote, onAdvancePhase, onRefreshStorm }) => {
  const [currentPhase, setCurrentPhase] = useState(storm.status)

  useEffect(() => {
    setCurrentPhase(storm.status)
  }, [storm.status])

  const renderPhaseComponent = () => {
    switch (currentPhase) {
      case 'ideation':
        return (
          <IdeationPhase
            storm={storm}
            user={user}
            onSubmitIdea={onSubmitIdea}
            onUpdateIdea={onUpdateIdea}
            onDeleteIdea={onDeleteIdea}
          />
        )
      case 'voting':
        return (
          <VotingPhase
            storm={storm}
            user={user}
            onSubmitVote={onSubmitVote}
          />
        )
      case 'results':
        return (
          <ResultsPhase
            storm={storm}
            user={user}
          />
        )
      default:
        return <p>Unknown storm phase.</p>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <header className="w-full max-w-5xl flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onLeaveStorm}>← Quit</Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{storm.title}</h1>
            <p className="text-gray-600">Code: {storm.code}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">👥 {storm.participantCount} participants</span>
          {user.role === 'moderator' && (
            <>
              <select className="border rounded px-2 py-1 text-sm" defaultValue="__header__">
                <option value="__header__" disabled>
                  Active users{storm.participants && ` (${storm.participants.length})`}
                </option>
                {(storm.participants || []).map((p) => (
                  <option key={p.sessionId} value={p.sessionId}>{p.username}</option>
                ))}
              </select>
              <Button variant="outline" onClick={onRefreshStorm}>Refresh</Button>
              {currentPhase !== 'results' && (
                <Button onClick={onAdvancePhase}>Advance to next phase</Button>
              )}
            </>
          )}
        </div>
      </header>

      <div className="w-full max-w-5xl mb-8">
        <Card className="p-4 shadow-md">
          <CardDescription className="text-gray-700">{storm.description}</CardDescription>
        </Card>
      </div>

      <div className="w-full max-w-5xl mb-8">
        <h2 className="text-xl font-semibold mb-4">Phase {currentPhase === 'ideation' ? '1' : currentPhase === 'voting' ? '2' : '3'} of 3: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} - {currentPhase === 'ideation' ? 'Submit your ideas' : currentPhase === 'voting' ? 'Evaluate proposals' : 'View results'}</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className={`bg-blue-600 h-2.5 rounded-full ${currentPhase === 'ideation' ? 'w-1/3' : currentPhase === 'voting' ? 'w-2/3' : 'w-full'}`}></div>
        </div>
      </div>

      <main className="w-full max-w-5xl">
        {renderPhaseComponent()}
      </main>
    </div>
  )
}

export default StormInterface

