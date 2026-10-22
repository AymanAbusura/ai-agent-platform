"use client"

import { Button } from '@/components/ui/button'
import { ArrowUp, Plus } from 'lucide-react'
import React, { useState } from 'react'

const quickSuggestions = [
    {
        label: "Find AI Jobs",
        prompt: 'Find the latest AI developer jobs posted this week '
    },
    {
        label: "Find AI Jobs",
        prompt: 'Find the latest AI developer jobs posted this week '
    },
    {
        label: "Find AI Jobs",
        prompt: 'Find the latest AI developer jobs posted this week '
    },
    {
        label: "Find AI Jobs",
        prompt: 'Find the latest AI developer jobs posted this week '
    },
    {
        label: "Find AI Jobs",
        prompt: 'Find the latest AI developer jobs posted this week '
    }
]

function CreateAgent() {

    const [prompt, setPrompt] = useState('');

    return (
        <div className='mt-5'>
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Create New Agent</h2>
                <p className='mt-1 text-sm text-muted-foreground'>Ask what type of agent you want to create, type your goal, task, or workflow</p>
            </div>
            
            {/* Prompt Box */}
            <div className='w-full border rounded-2xl bg-background p-3 mt-3 shadow-lg shadow-purple-100 hover:shadow-purple-200'>
                <textarea 
                    placeholder='Describe the agent you want to create...' 
                    className="min-h-22.5 w-full resize-none bg-transparent px-2 py-2 text-sm outline-no"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                />

                <div className='flex justify-center items-center'>
                    <div>
                        <Button variant={'ghost'} size={'icon'}>
                            <Plus />
                        </Button>
                    </div>
                    <Button size={'icon'} className={"h-9 w-9 rounded-full bg-purple-600"}>
                        <ArrowUp />
                    </Button>
                </div>
            </div>

            <div className="mt-3 flex gap-2">
                {quickSuggestions.map((suggestion, index) => (
                    <Button 
                        key={index}
                        variant={'outline'} 
                        className='hover:text-purple-700 hover:bg-purple-200 hover:border-purple-700'
                        onClick={() => setPrompt(suggestion.prompt)}
                    >
                        {suggestion.label}
                    </Button>
                ))}
            </div>
        </div>
    )
}

export default CreateAgent