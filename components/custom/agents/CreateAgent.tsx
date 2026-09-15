'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { ArrowUp, BriefcaseBusiness, Loader2, Loader2Icon, Mail, Plus, Search } from 'lucide-react'
import React, { useState } from 'react'
import AIAgentQuestions from "./AlAgentQuestions" 

export type ClarificationQuestions = {
    id: string
    question: string
    type: "single_select" | "multi_select" | "text" | "number" | "date" | "time"
    options: string[]
    allowCustom: boolean
    customPlaceholder: string
}

const CreateAgent = () => {
 const quickSuggestions = [
    {
        label:"Find AI Jobs",
        prompt:"Find the latest AI job opportunities in the market and provide a list of relevant job postings."

    },
    {
        label:"Inbox Summary",
        prompt:"Check my inbox and summarize the latest emails, highlighting important or urgent messages."
    },
    {
        label:"Social Media Insights",
        prompt:"Analyze my social media accounts and provide insights on engagement, follower growth, and content performance."
    },
    {
        label:"Meeting Notes",
        prompt:"Review my recent meetings and generate concise meeting notes, including action items and key takeaways."
    },
    {
        label:"Research Assistant",
        prompt:"Help me research topics and gather information from reliable sources to support my work."
    },
    {
        label:"Content Creator",
        prompt:"Assist me in creating engaging content for my blog, social media, or marketing materials."
    },
    {
        label:"Travel Planner",
        prompt:"Plan my upcoming trips, including flight options, accommodation recommendations, and itinerary suggestions."
    }
 ]   
 const templates=[
    {
        title:"Find latest jobs",
        description:"Find the latest AI job opportunities in the market and provide a list of relevant job postings.",
        icon:BriefcaseBusiness,
        iconBg:"bg-blue-100",
        iconColor:"text-blue-900",
        border:"border-blue-100",
        glow:"shadow-blue-200",
    },
    {
        title:"Inbox Summary",
        description:"Check my inbox and summarize the latest emails, highlighting important or urgent messages.",
        icon:Mail,
        iconBg:"bg-green-100",
        iconColor:"text-green-900",
        border:"border-green-100",
        glow:"shadow-green-200",
    },
    {
        title:"Social Media Insights",
        description:"Analyze my social media accounts and provide insights on engagement, follower growth, and content performance.",
        icon:Search,
        iconBg:"bg-purple-100",
        iconColor:"text-purple-900",
        border:"border-purple-100",
        glow:"shadow-purple-200",
    },
    {
        title:"Meeting Notes",
        description:"Review my recent meetings and generate concise meeting notes, including action items and key takeaways.",
        icon:Plus,
        iconBg:"bg-yellow-100",
        iconColor:"text-yellow-900",
        border:"border-yellow-100",
        glow:"shadow-yellow-200",
    }
 ]

 type AgentConfigResp={
    status:"needs_clarification"|"ready",
    clarificationQuestions:ClarificationQuestions[],
    config:any
}

 const [prompt,setPrompt] = useState('')
 const [ConfigResult,setConfigResult] = useState<AgentConfigResp>()
 const [loading , setloading]=useState(false);

 
    const onSubmit=async()=>{
        try{
             setloading(true);
    const result= await axios.post('/api/agent/configure',{prompt:prompt}) 
    console.log(result.data)
    setConfigResult(result.data);
    setloading(false);
}catch(error){
  setloading(false);
  alert("No response")
}
        }
   

    


const onComplete =async(ans:any)=>{
    console.log('OnComplete',ans);
    setConfigResult(undefined)
    const updatedPrompt = `${prompt}\nClarification answers:\n${JSON.stringify(ans)}`
         try{
             setloading(true);
    const result= await axios.post('/api/agent/configure',{prompt:updatedPrompt}) 
    console.log(result.data)
    setConfigResult(result.data);
    setloading(false);
}catch(error){
  setloading(false);
  alert("No response")
}
}


  return (
    <div>
        <section>
            <h2 className="text-2xl font-semibold tracking-tight">Create New Agent</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
                Fill in the details below to create a new agent. agents are the building blocks of your AI-powered applications.
            </p>
        </section>
        <div className='w-full mt-4 border rounded-2xl bg-background p-3 shadow-lg shadow-red-200 hover:shadow-red-300 transition-all duration-300'>
            <Textarea
                className='w-full h-32 resize-none border-none rounded-lg bg-transparent shadow-none outline-none focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none'
                placeholder='Enter agent description...'
                 value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <div className='flex gap-2 justify-between'>
            <div>
                <Button variant={'ghost'} size={'icon'} className='h-9 w-9 rounded-full bg-slate-100'>
                    <Plus/>
                </Button>
            </div>
             <div>
                <Button disabled={loading}  onClick={onSubmit} variant={'ghost'} size={'icon'} className='h-9 w-9 rounded-full text-white bg-purple-600'>
               {loading ? <Loader2 className='animate-spin'/> : <ArrowUp/>}
                </Button>
            </div>
            </div>
        </div>
        <section className='mt-4 flex flex-wrap gap-2'>
            {quickSuggestions.map((suggestion,index) => (
       <Button onClick={() => setPrompt(suggestion.prompt)} key={index} variant={'outline'} className='text-sm hover:bg-red-100 hover:text-red-900 hover:border-red-700'>
                    {suggestion.label}
                </Button>
            ))}
        </section>
 {loading ?

 <div className='flex gap-2 items-center p-5 mt-7 border rounded-x shadow-xl'>
    <Loader2Icon className='animate-spin'/>
    <h2>Generating Agent Config...</h2>   </div>
:
    !ConfigResult &&    <section className='mt-10'>
            <h2 className='text-lg font-semibold flex justify-between items-center'>Agent Details</h2>
            <div className='grid grid-cols-1 gap-4 my-5 md:grid-cols-3'>
                {templates.map((template,index) => (
                    <section className={`flex flex-col border rounded-lg p-4 cursor-pointer ${template.border}  hover:shadow-lg hover:shadow-red-200 transition-all duration-300`} key={index}>
                        <div className={`flex items-center justify-center h-12 w-12 rounded-lg ${template.iconBg} ${template.iconColor} ${template.border} ${template.glow}`}>
                            <template.icon className='h-6 w-6'/>
                        </div>
                        <h2 className='text-sm font-semibold mt-4'>{template.title}</h2>
                        <p className='text-xs text-muted-foreground mt-2'>{template.description}</p>

                    </section>
                ))}
            </div>
        </section>}


        {ConfigResult &&
        <div className='p-5 border rounded-2xl'>
            {ConfigResult.status=='needs_clarification' &&  <AIAgentQuestions questionList={ConfigResult.clarificationQuestions}
            onComplete={(resp:any)=>onComplete(resp)}/>
            }
            
            <p>{JSON.stringify(ConfigResult)}</p></div>}
    </div>
  )
}
        
  
export default CreateAgent