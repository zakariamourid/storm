import React from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Users, Zap, BarChart2 } from "lucide-react"

const HomePage = ({ onCreateStorm, onJoinStorm }) => {
  const [joinCode, setJoinCode] = React.useState("")

  const handleJoinClick = () => {
    if (joinCode.trim()) {
      onJoinStorm(joinCode.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Storm - Collaborative Ideation Platform</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Harness collective intelligence to generate, evaluate, and prioritize ideas with your team through our structured three-phase process.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mb-12">
        <Card className="flex flex-col items-center text-center p-6 shadow-lg">
          <Users className="h-16 w-16 text-blue-600 mb-4" />
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Create a Storm</CardTitle>
            <CardDescription className="text-gray-500">Launch a new collaborative ideation session</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <Button onClick={onCreateStorm} className="w-full py-3 text-lg">Create Storm</Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center text-center p-6 shadow-lg">
          <Zap className="h-16 w-16 text-purple-600 mb-4" />
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Join a Storm</CardTitle>
            <CardDescription className="text-gray-500">Participate in an existing session with your access code</CardDescription>
          </CardHeader>
          <CardContent className="w-full space-y-4">
            <Input
              placeholder="Enter Storm Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="text-center py-2 text-lg"
            />
            <Button onClick={handleJoinClick} className="w-full py-3 text-lg">Join Storm</Button>
          </CardContent>
        </Card>
      </main>

      <section className="w-full max-w-5xl text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 shadow-md">
            <Zap className="h-12 w-12 text-green-600 mb-4 mx-auto" />
            <CardTitle className="text-xl font-semibold mb-2">1. Ideation</CardTitle>
            <CardDescription className="text-gray-600">Participants submit their ideas anonymously. Each sees only their own proposals during this phase.</CardDescription>
          </Card>
          <Card className="p-6 shadow-md">
            <Users className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
            <CardTitle className="text-xl font-semibold mb-2">2. Voting</CardTitle>
            <CardDescription className="text-gray-600">All ideas become visible. Participants use blue and red tokens to evaluate proposals.</CardDescription>
          </Card>
          <Card className="p-6 shadow-md">
            <BarChart2 className="h-12 w-12 text-red-600 mb-4 mx-auto" />
            <CardTitle className="text-xl font-semibold mb-2">3. Results</CardTitle>
            <CardDescription className="text-gray-600">Ideas are ranked based on votes. Moderators access detailed analytics and comments.</CardDescription>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default HomePage

