import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const ResultsPhase = ({ storm }) => {
  // Calculate scores for each idea
  const ideasWithScores = storm.ideas.map(idea => {
    const relevantVotes = storm.votes.filter(vote => vote.ideaId === idea.id)
    const blueScore = relevantVotes.reduce((sum, vote) => sum + vote.blueTokens, 0)
    const redScore = relevantVotes.reduce((sum, vote) => sum + vote.redTokens, 0)
    const netScore = blueScore - redScore
    return { ...idea, blueScore, redScore, netScore }
  })

  // Sort ideas by net score (descending)
  const sortedIdeas = ideasWithScores.sort((a, b) => b.netScore - a.netScore)

  // Prepare data for chart
  const chartData = sortedIdeas.map(idea => ({
    name: idea.title, // Or a shorter version if titles are long
    'Blue Tokens': idea.blueScore,
    'Red Tokens': idea.redScore,
    'Net Score': idea.netScore,
  }))

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Final Results and Ranking</h2>
      
      <Card className="p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Idea Scores Overview</CardTitle>
          <CardDescription>Net score = Blue Tokens - Red Tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Blue Tokens" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Red Tokens" stackId="a" fill="#ef4444" />
              <Bar dataKey="Net Score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold">Detailed Idea Ranking</h2>
      <div className="space-y-4">
        {sortedIdeas.length === 0 ? (
          <p className="text-gray-600 text-center">No ideas to display results for.</p>
        ) : (
          sortedIdeas.map((idea, index) => (
            <Card key={idea.id} className="p-4 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{index + 1}. {idea.title}</CardTitle>
                <CardDescription className="text-gray-600">By {idea.authorUsername}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-700">{idea.description}</p>
                <div className="flex justify-between items-center text-lg font-medium mt-2">
                  <span className="text-blue-600">🔵 {idea.blueScore} Blue Tokens</span>
                  <span className="text-red-600">🔴 {idea.redScore} Red Tokens</span>
                  <span className="text-purple-700">Net Score: {idea.netScore}</span>
                </div>
                <h4 className="font-semibold mt-4">Comments:</h4>
                {storm.votes.filter(vote => vote.ideaId === idea.id && vote.comment).map((vote, commentIndex) => {
                  const user = (storm.participants || []).find(u => u.sessionId === vote.userId)
                  return (
                    <p key={commentIndex} className="text-sm text-gray-800">
                      <span className="font-medium">{user ? user.username : 'Anonymous'}</span>
                      <span className="mx-1 text-gray-500">•</span>
                      <span className="italic">" {vote.comment} "</span>
                    </p>
                  )
                })}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default ResultsPhase

