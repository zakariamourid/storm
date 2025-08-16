import React, { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { toast } from 'sonner'

const StormJoin = ({ stormCode: initialStormCode, onBack, onJoinStorm }) => {
  const [stormCode, setStormCode] = useState(initialStormCode || "")
  const [username, setUsername] = useState("")

  const handleSubmit = async () => {
    if (!stormCode.trim() || !username.trim()) {
      toast.error("Storm code and username are required!")
      return
    }
    try {
      await onJoinStorm(stormCode.trim(), username.trim())
    } catch (error) {
      toast.error("Failed to join storm: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <header className="w-full max-w-md flex justify-start mb-8">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
      </header>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Join a Storm</CardTitle>
          <CardDescription>Enter the Storm code and your username to participate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="storm-code">Storm Code *</Label>
            <Input
              id="storm-code"
              placeholder="Ex: STORM-XYZ123"
              value={stormCode}
              onChange={(e) => setStormCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Your Username *</Label>
            <Input
              id="username"
              placeholder="Ex: AnonymousParticipant"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full py-3 text-lg">Join Storm</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default StormJoin

