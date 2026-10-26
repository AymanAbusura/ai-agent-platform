"use client"

import { Button } from '@/components/ui/button'
import { ArrowUp, BriefcaseBusiness, Mail, Plus, Search } from 'lucide-react'
import React, { useState } from 'react'

const quickSuggestions = [
    {
        label: "Find AI Jobs",
        prompt: 'Find the latest AI developer jobs posted this week that match my skills and summarize the best opportunities for me.'
    },
    {
        label: "Inbox Summary",
        prompt: 'Check my inbox and summarize the most important emails, especially anything that requires my reply or attention.'
    },
    {
        label: "Research Topic",
        prompt: 'Research a topic across the web, compare multiple sources, and give me a concise summary with the most important findings.'
    },
    {
        label: "Plan My Day",
        prompt: 'Check my calendar and upcoming tasks, then create a priotrized plan for everything I should focus on today.'
    },
    {
        label: "Reddit Trends",
        prompt: 'Finding trending reddit discussions about AI tools and agents, then summarize the most useful and interesting conversations.'
    }
]

const templates = [
    {
        title: "Find latest jobs",
        description: "Search the web for the latest jobs matching my portfolio",
        icon: BriefcaseBusiness,
        iconBg: "bg-orange-100",
        iconColor: "trxt-orange-600",
        border: "hover:border-orange-300",
        glow: "hover:shadow-orange-100"
    },
    {
        title: "Daily inbox summary",
        description: "Summarize important emails and highlight what need to focus on",
        icon: Mail,
        iconBg: "bg-blue-100",
        iconColor: "trxt-blue-600",
        border: "hover:border-blue-300",
        glow: "hover:shadow-blue-100"
    },
    {
        title: "Research a topic",
        description: "Search the web and create a useful research summary",
        icon: Search,
        iconBg: "bg-purple-100",
        iconColor: "trxt-purple-600",
        border: "hover:border-purple-300",
        glow: "hover:shadow-purple-100"
    },
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

                <div className='flex justify-between items-center'>
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

            <div className='mt-10'>
                <h2 className='flex justify-between items-center font-semibold text-lg'>
                    Get Started 
                    <span className='text-sm font-medium'>View All</span>
                </h2>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mt-3'>
                    {templates.map((template, index) => (
                        <div className={`border rounded-2xl p-5 hover:cursor-pointer hover:shadow-lg ${template.border} ${template.glow}`}>
                            <template.icon className={`h-12 w-12 p-2 ${template.iconBg} ${template.iconColor} rounded-xl`} />
                            <div className='mt-6'>
                                <h2 className='font-semibold text-foreground'>{template.title}</h2>
                                <p className='text-sm mt-2 leading-5 text-muted-foreground'>{template.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CreateAgent