const fs = require("fs");
const path = require("path");
const Utils = require("./utils").utils;

const Koa = require("koa");
const router = require("koa-router")();
const bodyParser = require("koa-body");

const app = new Koa();

const uploadDir = 'uploads';

app.use(bodyParser({multipart: true}));
app.use(router.routes());

router.get("/index-upload", function(ctx){//首页
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream('./index-upload.html');
})

router.post('/upload', async function(ctx){//上传
    //拿到接口中的数据
    let data = ctx.request.body.fields,
        currChunk = data.currChunk,
        fileMd5Value = data.fileMd5Value,
        file = ctx.request.body.files,
        folder = path.join('uploads', fileMd5Value);
        //判断文件是否存在
    let isExist = await Utils.folderIsExist(path.join(__dirname, folder));
    if(isExist){//将文件写入fileMd5Value下面的文件夹
        let destFile = path.join(__dirname, folder, currChunk),
            srcFile = path.join(file.data.path);
        await Utils.copyFile(srcFile, destFile).then(() => {
            ctx.response.body = 'chunk ' + currChunk + ' upload success!!!'
        }, (err) => {
            console.error(err);
            ctx.response.body = 'chunk ' + currChunk + ' upload failed!!!'
        })
    }
})

router.get("/mergeChunk", async function(ctx){//合并chunk写成文件
    let md5 = ctx.query.md5,
        fileName = ctx.query.fileName,
        size = ctx.query.size;

    await Utils.mergeFiles(path.join(__dirname, uploadDir, md5), 
                           path.join(__dirname, uploadDir),
                           fileName, size)

    ctx.response.body = "success";
})

app.listen(3000);

console.log("the server is listening on port 3000")