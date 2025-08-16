import React, { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { toast } from 'sonner'

const IdeationPhase = ({ storm, user, onSubmitIdea, onUpdateIdea, onDeleteIdea }) => {
  const [ideaTitle, setIdeaTitle] = useState("")
  const [ideaDescription, setIdeaDescription] = useState("")
  const [editingIdea, setEditingIdea] = useState(null)

  const handleSubmitIdea = async () => {
    if (!ideaTitle.trim()) {
      toast.error("Idea title is required!")
      return
    }

    try {
      if (editingIdea) {
        await onUpdateIdea(editingIdea.id, { title: ideaTitle, description: ideaDescription })
        setEditingIdea(null)
      } else {
        await onSubmitIdea({ title: ideaTitle, description: ideaDescription })
      }
      setIdeaTitle("")
      setIdeaDescription("")
    } catch (error) {
      toast.error("Failed to submit idea: " + error.message)
    }
  }

  const handleEdit = (idea) => {
    setEditingIdea(idea)
    setIdeaTitle(idea.title)
    setIdeaDescription(idea.description)
  }

  const handleDelete = async (ideaId) => {
    if (window.confirm("Are you sure you want to delete this idea?")) {
      try {
        await onDeleteIdea(ideaId)
      } catch (error) {
        toast.error("Failed to delete idea: " + error.message)
      }
    }
  }

  const myIdeas = storm.ideas.filter(idea => idea.authorId === user.sessionId)
  const isModerator = user.role === 'moderator'

  return (
    <div className="space-y-8">
      <Card className="p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Submit a new idea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idea-title">Idea Title *</Label>
            <Input
              id="idea-title"
              placeholder="Ex: Improve onboarding process"
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idea-description">Detailed Description</Label>
            <Textarea
              id="idea-description"
              placeholder="Describe your idea in detail, explain why it would be beneficial..."
              value={ideaDescription}
              onChange={(e) => setIdeaDescription(e.target.value)}
            />
            <p className="text-sm text-gray-500">{ideaDescription.length}/1000 characters</p>
          </div>
          <Button onClick={handleSubmitIdea} className="w-full py-2">
            {editingIdea ? "Update Idea" : "Submit Idea"}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold">My Ideas ({myIdeas.length})</h2>
      <div className="space-y-4">
        {myIdeas.length === 0 ? (
          <p className="text-gray-600 text-center">You haven't submitted any ideas yet. Use the form above to share your proposals.</p>
        ) : (
          myIdeas.map(idea => (
            <Card key={idea.id} className="p-4 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{idea.title}</h3>
                <p className="text-gray-600 text-sm">{idea.description}</p>
                <p className="text-gray-500 text-xs">Created {new Date(idea.createdAt).toLocaleDateString()} at {new Date(idea.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                {idea.updatedAt && idea.createdAt !== idea.updatedAt && (
                  <p className="text-gray-500 text-xs">Modified {new Date(idea.updatedAt).toLocaleDateString()} at {new Date(idea.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(idea)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(idea.id)}>Delete</Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {isModerator && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold">All Ideas (Moderator View) ({storm.ideas.length})</h2>
          <div className="space-y-4 mt-4">
            {storm.ideas.length === 0 ? (
              <p className="text-gray-600 text-center">No ideas have been submitted yet.</p>
            ) : (
              storm.ideas.map(idea => (
                <Card key={idea.id} className="p-4 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{idea.title}</h3>
                    <p className="text-gray-600 text-sm">{idea.description}</p>
                    <p className="text-gray-500 text-xs">By {idea.authorUsername}</p>
                    <p className="text-gray-500 text-xs">Created {new Date(idea.createdAt).toLocaleDateString()} at {new Date(idea.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    {idea.updatedAt && idea.createdAt !== idea.updatedAt && (
                      <p className="text-gray-500 text-xs">Modified {new Date(idea.updatedAt).toLocaleDateString()} at {new Date(idea.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(idea.id)}>Delete</Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default IdeationPhase

