import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './components/HomePage'
import StormCreation from './components/StormCreation'
import StormJoin from './components/StormJoin'
import StormInterface from './components/StormInterface'
import ApiService from './services/api'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [currentStorm, setCurrentStorm] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(true)

  // Check for existing session on app load
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const sessionData = await ApiService.getSession()
      setCurrentStorm(sessionData.storm)
      setCurrentUser(sessionData.user)
      setCurrentView('storm')
    } catch (error) {
      // No active session, stay on home page
      console.log('No active session')
    } finally {
      setLoading(false)
    }
  }

  const createStorm = async (stormData) => {
    try {
      const response = await ApiService.createStorm(stormData)
      setCurrentStorm(response.storm)
      setCurrentUser(response.user)
      setCurrentView('storm')
    } catch (error) {
      console.error('Failed to create storm:', error)
      throw error
    }
  }

  const joinStorm = async (stormCode, username) => {
    try {
      const response = await ApiService.joinStorm(stormCode, username)
      setCurrentStorm(response.storm)
      setCurrentUser(response.user)
      setCurrentView('storm')
    } catch (error) {
      console.error('Failed to join storm:', error)
      throw error
    }
  }

  const submitIdea = async (ideaData) => {
    try {
      const newIdea = await ApiService.submitIdea(currentStorm.id, ideaData)
      
      // Update local storm state
      setCurrentStorm(prev => ({
        ...prev,
        ideas: [...(prev.ideas || []), newIdea]
      }))
    } catch (error) {
      console.error('Failed to submit idea:', error)
      throw error
    }
  }

  const updateIdea = async (ideaId, ideaData) => {
    try {
      const updatedIdea = await ApiService.updateIdea(ideaId, ideaData)
      
      // Update local storm state
      setCurrentStorm(prev => ({
        ...prev,
        ideas: prev.ideas.map(idea => 
          idea.id === ideaId ? updatedIdea : idea
        )
      }))
    } catch (error) {
      console.error('Failed to update idea:', error)
      throw error
    }
  }

  const deleteIdea = async (ideaId) => {
    try {
      await ApiService.deleteIdea(ideaId)
      
      // Update local storm state
      setCurrentStorm(prev => ({
        ...prev,
        ideas: prev.ideas.filter(idea => idea.id !== ideaId)
      }))
    } catch (error) {
      console.error('Failed to delete idea:', error)
      throw error
    }
  }

  const submitVote = async (voteData) => {
    try {
      const newVote = await ApiService.submitVote(voteData.ideaId, voteData)
      
      // Update local storm state
      setCurrentStorm(prev => {
        const existingVotes = prev.votes.filter(vote => 
          !(vote.ideaId === voteData.ideaId && vote.userId === currentUser.sessionId)
        )
        return {
          ...prev,
          votes: [...existingVotes, newVote]
        }
      })
    } catch (error) {
      console.error('Failed to submit vote:', error)
      throw error
    }
  }

  const advancePhase = async () => {
    try {
      const updatedStorm = await ApiService.advancePhase(currentStorm.id)
      setCurrentStorm(updatedStorm)
    } catch (error) {
      console.error('Failed to advance phase:', error)
      throw error
    }
  }

  const refreshStorm = async () => {
    try {
      const updated = await ApiService.getStorm(currentStorm.id)
      setCurrentStorm(updated)
    } catch (error) {
      console.error('Failed to refresh storm:', error)
    }
  }

  const leaveStorm = async () => {
    try {
      await ApiService.clearSession()
    } catch (e) {
      // ignore
    } finally {
      setCurrentStorm(null)
      setCurrentUser(null)
      setCurrentView('home')
    }
  }

  const handleCreateStorm = () => {
    setCurrentView('create')
  }

  const handleJoinStorm = (code) => {
    setJoinCode(code)
    setCurrentView('join')
  }

  const handleBack = () => {
    setCurrentView('home')
    setJoinCode('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {currentView === 'home' && (
        <HomePage
          onCreateStorm={handleCreateStorm}
          onJoinStorm={handleJoinStorm}
        />
      )}

      {currentView === 'create' && (
        <StormCreation
          onBack={handleBack}
          onCreateStorm={createStorm}
        />
      )}

      {currentView === 'join' && (
        <StormJoin
          stormCode={joinCode}
          onBack={handleBack}
          onJoinStorm={joinStorm}
        />
      )}

      {currentView === 'storm' && currentStorm && currentUser && (
        <StormInterface
          storm={currentStorm}
          user={currentUser}
          onLeaveStorm={leaveStorm}
          onSubmitIdea={submitIdea}
          onUpdateIdea={updateIdea}
          onDeleteIdea={deleteIdea}
          onSubmitVote={submitVote}
          onAdvancePhase={advancePhase}
          onRefreshStorm={refreshStorm}
        />
      )}
    </div>
  )
}

export default App

