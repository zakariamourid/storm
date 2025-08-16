import React, { useMemo, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { toast } from 'sonner'

const StormCreation = ({ onBack, onCreateStorm }) => {
  const [title, setTitle] = useState("")
  const [titleError, setTitleError] = useState(false)
  const [description, setDescription] = useState("")
  const [blueTokens, setBlueTokens] = useState(5)
  const [redTokens, setRedTokens] = useState(3)
  const [isLimitedTime, setIsLimitedTime] = useState(true)
  // Hours/minutes split per spec
  const [ideationHours, setIdeationHours] = useState(0)
  const [ideationMinutes, setIdeationMinutes] = useState(30)
  const [votingHours, setVotingHours] = useState(0)
  const [votingMinutes, setVotingMinutes] = useState(20)

  const canLaunch = useMemo(() => title.trim().length > 0, [title])

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError(true)
      toast.error("Storm title is required!")
      return
    }
    setTitleError(false)
    try {
      const ideationTotalMinutes = (Number(ideationHours) * 60) + (Number(ideationMinutes) || 0)
      const votingTotalMinutes = (Number(votingHours) * 60) + (Number(votingMinutes) || 0)

      await onCreateStorm({
        title,
        description,
        blueTokens: parseInt(blueTokens),
        redTokens: parseInt(redTokens),
        ideationTimeLimit: isLimitedTime ? ideationTotalMinutes : null,
        votingTimeLimit: isLimitedTime ? votingTotalMinutes : null,
      })
    } catch (error) {
      toast.error("Failed to create storm: " + error.message)
    }
  }

  const handleResetTokens = () => {
    setBlueTokens(5)
    setRedTokens(3)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-6">
      <header className="w-full max-w-[900px] flex justify-start mb-6">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
      </header>
      <Card className="w-full max-w-[900px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">Create a Storm</CardTitle>
          <CardDescription>Set the basics, tokens, and time controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2"><span role="img" aria-label="folder">📁</span> Basic Information</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Storm Title *</Label>
              <Input
                id="title"
                placeholder="E.g. Improve customer onboarding for new hires"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTitleError(!title.trim())}
                className={titleError ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description and Rules</Label>
              <Textarea
                id="description"
                placeholder="Describe the objectives, participation rules, and time constraints…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>
          </section>

          <div className="h-px bg-border" />

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span role="img" aria-label="check">✅</span>
                Voting Tokens
                <span
                  className="ml-2 text-gray-500 text-sm cursor-help"
                  title="Blue = positive votes, Red = negative votes."
                >
                  (i)
                </span>
              </h3>
              <button type="button" className="text-sm text-gray-600 hover:underline" onClick={handleResetTokens}>
                Reset to default
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="blue-tokens" className="flex items-center gap-2">
                  <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full bg-blue-600" />
                  <span>Blue Tokens (positive)</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => setBlueTokens(Math.max(0, Number(blueTokens) - 1))}>−</Button>
                  <Input
                    id="blue-tokens"
                    type="number"
                    value={blueTokens}
                    onChange={(e) => setBlueTokens(Number(e.target.value))}
                    min="0"
                    className="text-center focus-visible:ring-blue-500"
                  />
                  <Button type="button" onClick={() => setBlueTokens(Math.max(0, Number(blueTokens) + 1))}>+</Button>
                </div>
                <p className="text-sm text-gray-500">Used for positive votes</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="red-tokens" className="flex items-center gap-2">
                  <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full bg-red-600" />
                  <span>Red Tokens (negative)</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => setRedTokens(Math.max(0, Number(redTokens) - 1))}>−</Button>
                  <Input
                    id="red-tokens"
                    type="number"
                    value={redTokens}
                    onChange={(e) => setRedTokens(Number(e.target.value))}
                    min="0"
                    className="text-center focus-visible:ring-red-500"
                  />
                  <Button type="button" onClick={() => setRedTokens(Math.max(0, Number(redTokens) + 1))}>+</Button>
                </div>
                <p className="text-sm text-gray-500">Used for negative votes</p>
              </div>
            </div>
          </section>

          <div className="h-px bg-border" />

          <section className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2"><span role="img" aria-label="clock">🕒</span> Time Settings</h3>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="time-mode"
                  checked={!isLimitedTime}
                  onChange={() => setIsLimitedTime(false)}
                />
                <span>Unlimited</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="time-mode"
                  checked={isLimitedTime}
                  onChange={() => setIsLimitedTime(true)}
                />
                <span>Limited</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Ideation</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={isLimitedTime ? ideationHours : ''}
                      onChange={(e) => setIdeationHours(Math.max(0, Number(e.target.value)))}
                      min="0"
                      disabled={!isLimitedTime}
                      className="w-20 text-center"
                    />
                    <span>hr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="30"
                      value={isLimitedTime ? ideationMinutes : ''}
                      onChange={(e) => setIdeationMinutes(Math.max(0, Number(e.target.value)))}
                      min="0"
                      disabled={!isLimitedTime}
                      className="w-20 text-center"
                    />
                    <span>min</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Voting</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={isLimitedTime ? votingHours : ''}
                      onChange={(e) => setVotingHours(Math.max(0, Number(e.target.value)))}
                      min="0"
                      disabled={!isLimitedTime}
                      className="w-20 text-center"
                    />
                    <span>hr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="20"
                      value={isLimitedTime ? votingMinutes : ''}
                      onChange={(e) => setVotingMinutes(Math.max(0, Number(e.target.value)))}
                      min="0"
                      disabled={!isLimitedTime}
                      className="w-20 text-center"
                    />
                    <span>min</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Button onClick={handleSubmit} disabled={!canLaunch} className="w-full py-3 text-lg bg-black text-white hover:bg-neutral-800">
            🚀 Launch Storm
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default StormCreation

