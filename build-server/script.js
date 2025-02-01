const {exec} = require('child_process')
const path = require('path')
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const mime = require('mime-types')
const s3Client = new S3Client ({
    region:'eu-north-1',
    credentials:{
        accessKeyId:process.env.ACCESSKEY,
        secretAccessKey:process.env.SECRET
    }
})

const PROJECT_ID = process.env.PROJECT_ID
const fs = require('fs')
async function init(){
    console.log('Executing the build function');
    const outDirPath = path.join(__dirname, 'output')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)
    p.stdout.on('data', function(data){
        console.log(data.toString());
    })

    p.stdout.on('error', function(data){
        console.log(data.toString());
    })

    p.on('close', async function(){
        console.log("Build complete");
        const distFolderPath = path.join(__dirname, 'output', 'dist')
        const distFolderContents = fs.readdirSync(distFolderPath, {recursive: true})
        for( const file of distFolderContents){
            const filePath = path.join(distFolderPath, file)
            if(fs.lstatSync(filePath).isDirectory())
            continue;
            console.log('uploading', filePath);
            const command = new PutObjectCommand({
                Bucket:'vercel-ggaurisaria',
                Key:`__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            })
                await s3Client.send(command)
                console.log('uploaded', filePath);
            }
            console.log('Done....');

        })
    }