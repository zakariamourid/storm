import React, { useState } from 'react'
import { toast } from 'sonner'
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"


const VotingPhase = ({ storm, user, onSubmitVote }) => {
  const [blueTokensToAllocate, setBlueTokensToAllocate] = useState({})
  const [redTokensToAllocate, setRedTokensToAllocate] = useState({})
  const [comments, setComments] = useState({})
  const [editingVotes, setEditingVotes] = useState({}) // ideaId -> boolean

  const userVotes = storm.votes.filter(vote => vote.userId === user.sessionId)
  const allocatedBlue = userVotes.reduce((sum, vote) => sum + vote.blueTokens, 0)
  const allocatedRed = userVotes.reduce((sum, vote) => sum + vote.redTokens, 0)

  const remainingBlue = storm.tokenBudget.maxBlue - allocatedBlue
  const remainingRed = storm.tokenBudget.maxRed - allocatedRed

  // Show unvoted ideas first, then already voted ones at the bottom
  const votedIdeaIds = new Set(userVotes.map(v => v.ideaId))
  const unvotedIdeas = storm.ideas.filter(idea => !votedIdeaIds.has(idea.id))
  const votedIdeas = storm.ideas.filter(idea => votedIdeaIds.has(idea.id))
  const ideasToShow = [...unvotedIdeas, ...votedIdeas]

  const handleBlueTokenChange = (ideaId, value) => {
    setBlueTokensToAllocate(prev => ({ ...prev, [ideaId]: parseInt(value) || 0 }))
    setRedTokensToAllocate(prev => ({ ...prev, [ideaId]: 0 })) // Cannot use both
  }

  const handleRedTokenChange = (ideaId, value) => {
    setRedTokensToAllocate(prev => ({ ...prev, [ideaId]: parseInt(value) || 0 }))
    setBlueTokensToAllocate(prev => ({ ...prev, [ideaId]: 0 })) // Cannot use both
  }

  const handleCommentChange = (ideaId, value) => {
    setComments(prev => ({ ...prev, [ideaId]: value }))
  }

  const startEditingVote = (ideaId, existingVote) => {
    setEditingVotes(prev => ({ ...prev, [ideaId]: true }))
    setBlueTokensToAllocate(prev => ({ ...prev, [ideaId]: existingVote?.blueTokens || 0 }))
    setRedTokensToAllocate(prev => ({ ...prev, [ideaId]: existingVote?.redTokens || 0 }))
    setComments(prev => ({ ...prev, [ideaId]: existingVote?.comment || "" }))
  }

  const stopEditingVote = (ideaId) => {
    setEditingVotes(prev => ({ ...prev, [ideaId]: false }))
    // optional: keep values or clear; we will clear to avoid confusion
    setBlueTokensToAllocate(prev => ({ ...prev, [ideaId]: 0 }))
    setRedTokensToAllocate(prev => ({ ...prev, [ideaId]: 0 }))
    setComments(prev => ({ ...prev, [ideaId]: "" }))
  }

  const handleSubmitVote = async (ideaId) => {
    const blue = blueTokensToAllocate[ideaId] || 0
    const red = redTokensToAllocate[ideaId] || 0
    const comment = comments[ideaId] || ""

    if (!comment.trim()) {
      toast.error("A comment is required for each vote!")
      return
    }

    if (blue === 0 && red === 0) {
      toast.error("Please allocate at least one token (blue or red) to vote.")
      return
    }

    try {
      await onSubmitVote({
        ideaId,
        blueTokens: blue,
        redTokens: red,
        comment,
      })
      toast.success("Vote submitted successfully!")
      // Clear form for this idea after submission
      setBlueTokensToAllocate(prev => ({ ...prev, [ideaId]: 0 }))
      setRedTokensToAllocate(prev => ({ ...prev, [ideaId]: 0 }))
      setComments(prev => ({ ...prev, [ideaId]: "" }))
      stopEditingVote(ideaId)
    } catch (error) {
      toast.error("Failed to submit vote: " + error.message)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Your Token Budget</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around text-lg font-medium">
          <span className="text-blue-600">🔵 {remainingBlue} / {storm.tokenBudget.maxBlue} blue tokens</span>
          <span className="text-red-600">🔴 {remainingRed} / {storm.tokenBudget.maxRed} red tokens</span>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold">Ideas to Evaluate ({storm.ideas.length})</h2>
      <div className="space-y-4">
        {storm.ideas.length === 0 ? (
          <p className="text-gray-600 text-center">No ideas have been submitted yet.</p>
        ) : (
          ideasToShow.map(idea => {
            const existingVote = userVotes.find(v => v.ideaId === idea.id)
            const isEditing = !!editingVotes[idea.id]

            return (
              <Card key={idea.id} className="p-4 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{idea.title}</CardTitle>
                  <CardDescription className="text-gray-600">By {idea.authorUsername}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{idea.description}</p>

                  {existingVote && !isEditing ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700">
                        <span className="mr-2">Your vote:</span>
                        {existingVote.blueTokens > 0 ? (
                          <span className="text-blue-600">🔵 {existingVote.blueTokens} blue token(s)</span>
                        ) : (
                          <span className="text-red-600">🔴 {existingVote.redTokens} red token(s)</span>
                        )}
                      </div>
                      {existingVote.comment && (
                        <p className="text-sm text-gray-600 italic">“{existingVote.comment}”</p>
                      )}
                      <div>
                        <Button variant="outline" onClick={() => startEditingVote(idea.id, existingVote)} className="w-full">Edit vote</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Allocate Tokens</Label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-600">🔵 Blue tokens</span>
                            <Input
                              type="number"
                              value={blueTokensToAllocate[idea.id] || 0}
                              onChange={(e) => handleBlueTokenChange(idea.id, e.target.value)}
                              min="0"
                              max={remainingBlue + (userVotes.find(v => v.ideaId === idea.id && v.blueTokens > 0)?.blueTokens || 0)}
                              className="w-20"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600">🔴 Red tokens</span>
                            <Input
                              type="number"
                              value={redTokensToAllocate[idea.id] || 0}
                              onChange={(e) => handleRedTokenChange(idea.id, e.target.value)}
                              min="0"
                              max={remainingRed + (userVotes.find(v => v.ideaId === idea.id && v.redTokens > 0)?.redTokens || 0)}
                              className="w-20"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`comment-${idea.id}`}>Comment (required)</Label>
                        <Textarea
                          id={`comment-${idea.id}`}
                          placeholder="Provide a constructive comment for this idea..."
                          value={comments[idea.id] || ""}
                          onChange={(e) => handleCommentChange(idea.id, e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleSubmitVote(idea.id)} className="w-full py-2">
                          {existingVote ? 'Update Vote' : 'Submit Vote'}
                        </Button>
                        {existingVote && (
                          <Button variant="secondary" onClick={() => stopEditingVote(idea.id)} className="py-2">Cancel</Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Card className="p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Voting Phase Rules</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 space-y-2">
          <ul>
            <li>• All ideas are now visible</li>
            <li>• You cannot put both blue and red tokens on the same idea</li>
            <li>• A comment is mandatory for each vote</li>
            <li>• You can allocate multiple tokens to the same idea</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default VotingPhase

