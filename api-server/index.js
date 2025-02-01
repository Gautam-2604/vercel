import express from 'express'
import { generateSlug } from 'random-word-slugs'
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs'

const app = express()
const PORT = 9000

const config = {
    CLUSTER:'arn:aws:ecs:eu-north-1:841162693180:cluster/buildercluster',
    TASK:'arn:aws:ecs:eu-north-1:841162693180:task-definition/builder-task'
}

const ecsClient = new ECSClient({
    region:'eu-north-1',
    credentials:{
        accessKeyId:'AKIA4HWJUDI6MAO5S4HB',
        secretAccessKey:'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'
    }
})

app.use(express.json())

app.post('/project',async (req,res)=>{
    const {gitURL} = req.body
    const projectSlug = generateSlug
    const command = new RunTaskCommand({
        cluster:config.CLUSTER,
        taskDefinition: config.TASK,
        launchType:'FARGATE',
        count:1,
        networkConfiguration:{
            awsvpcConfiguration:{
                assignPublicIp:'ENABLED',
                subnets:['subnet-0c361bb1515383917', 'subnet-08a7835780cea99df','subnet-0d79412c8c3d8f38f'],
                securityGroups:['sg-0eefe37d60fced91a']
            }
        },
        overrides:{
            containerOverrides:[
                {
                    name:'builder-image',
                    environment:[
                        {
                            name: 'GITHUB_REPOSITORY_URL', value:gitURL
                        },{
                            name: 'PROJECT_ID', value:projectSlug
                        }
                    ]
                }
            ]
        }
    }) 
    await ecsClient.send(command)
    return res.json({status:'queued', data:{
        projectSlug, url:`http://${projectSlug}.localhost:8000`
    }})
})
app.listen(PORT, () => console.log(`API Server Running..${PORT}`))