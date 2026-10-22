import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateAgent from '@/components/custom/agents/CreateAgent'

function AgentPage() {
    return (
        <div className="w-full flex justify-center">
            <div className='w-full max-w-3xl px-6 pt-28 pb-16'>
                <Tabs defaultValue="create-agent" className="w-full">
                    <TabsList>
                        <TabsTrigger value="create-agent">Create Agent</TabsTrigger>
                        <TabsTrigger value="my-agent">My Agents</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create-agent">
                        <CreateAgent />
                    </TabsContent>
                    <TabsContent value="my-agent">
                        My Agents
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default AgentPage