const express = require("express"); //express : react와 mysql을 연결해주는 웹 서버 프레임워크
const cors = require("cors");
const app = express();
const port =  process.env.PORT || 8080;
const fs = require('fs');
const dataj = fs.readFileSync("./database.json");
const parseData = JSON.parse(dataj);
const mysql = require('mysql');
const multer = require("multer");

const connection = mysql.createConnection({
    host: parseData.host,
    user:parseData.user,
    password:parseData.password,
    port:parseData.port,
    database: parseData.database
})

app.use(express.json()) //json형식의 데이터를 처리할수 있도록설정
app.use(cors()) //브라우저의 다양한 사용을 위해 설정
//로그인 - 쿠키 사용


//회원가입
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.post("/signup",async (req, res)=>{
    let myPlanintextPass = req.body.password;
    let myPass = "";
    if(myPlanintextPass != '' && myPlanintextPass != undefined){
        bcrypt.genSalt(saltRounds, function(err,salt){
            bcrypt.hash(myPlanintextPass,salt, function(err,hash){
                myPass = hash;
                const { username, eMail, mobileNumber, question, answer } = req.body;
                console.log(req.body)
                connection.query("insert into user(`username`, `password`, `email`,`mobilenumber`,`question`,`answer`,`admin`,`regdate`) values(?,?,?,?,?,?,0,DATE_FORMAT(now(),'%Y-%m-%d'))",
                    [username, myPass, eMail,mobileNumber,question,answer] ,
                    (err,result,fields )=>{
                    console.log(result)
                    console.log(err)
                    res.send("회원이 등록 되었습니다.")
                })
            })
        })
    }   
})

// 로그인 하기
app.post('/login', async (req, res)=>{
    const {username,userpass}  = req.body; 
    console.log(req.body);
    connection.query(
        `select * from user where username = '${username}'`,
        (err, rows, fields)=>{
            console.log(rows)
            if(rows != undefined){
                if(rows[0] == undefined){
                    res.send(null)
                }else{
                    bcrypt.compare(userpass, rows[0].userpass,function(err,login_flag){
                        if(login_flag == true){
                            res.send(rows[0])
                            console.log("이거");
                        }else {
                            res.send(null)
                            console.log("저거");
                        }
                    })
                }
            }else {
            res.send(null)
            }
        }
    )
})

//프로모션 페이지

app.get('/promotion', async (req, res)=>{
    connection.query(
        "select * from promotion",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})


const storage = multer.diskStorage({
    destination: "./imgreg",
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
})
const upload = multer({
    storage: storage,
    limits: { fileSize: 100000000 }
});
app.post("/imgreg", upload.single("imgsrc"), function(req, res, next){
    res.send({
        imgsrc: 'imgreg/' + req.file.filename
    })
    console.log(req.file.filename);
})
app.use("/imgreg",express.static("imgreg"))


// 프로모션페이지 업로드
app.post('/postreg', async(req,res)=>{
    const {title, body, imgsrc, period} = req.body;
    connection.query(
        "insert into promotion(`title`, `body`, `imgsrc`, `period`) values(?,?,?,?)",
        [title, body, imgsrc, period],
        (err,result, fields)=>{
            console.log(result);
            console.log(err);
            res.send("글이 등록되었습니다.");
        }
    )
})

//프로모션페이지 삭제
app.delete('/postdel', async(req,res)=>{
    const { postId } = req.body;
    console.log(req.body)
    connection.query(
        `delete from promotion where id = ${postId}`,
        (err,result, fields)=>{
            console.log(`게시글 ${postId}번이 삭제되었습니다.`)
            console.log(result);
            res.send("게시글이 삭제되었습니다.")
        }
    )
})






// 리뷰페이지
app.get('/review', async (req, res)=>{
    connection.query(
        "select * from review order by id desc limit 11",
        (err, rows, fields)=>{
            res.send(rows);
            console.log(err);
        }
    )
})
app.post('/reviewreg', async(req,res)=>{
    const {imgsrc, title, body} = req.body;
    connection.query(
        "insert into review(`imgsrc`, `title`, `body`) values(?,?,?)",
        [imgsrc, title, body],
        (err,result, fields)=>{
            console.log(result);
            console.log(err);
            res.send("글이 등록되었습니다.");
        }
    )
})






//세팅한 app을 실행시킨다.
app.listen(port, () => {
    console.log('서버가 돌아가고 있습니다.');
});

