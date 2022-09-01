const express = require("express"); //express : react와 mysql을 연결해주는 웹 서버 프레임워크
const cors = require("cors");
const app = express();
const port =  process.env.PORT || 8080;
const fs = require('fs');
const dataj = fs.readFileSync("./database.json");
const parseData = JSON.parse(dataj);
const mysql = require('mysql');

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
                    res.send("등록 되었습니다.")
                })
            })
        })
    }   
})

// 로그인 하기
app.post('/login', async (req, res)=>{
    const {useremail,userpass}  = req.body; 
    console.log(req.body);
    connection.query(
        `select * from customer_members where usermail = '${useremail}'`,
        (err, rows, fields)=>{
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

//세팅한 app을 실행시킨다.
app.listen(port, () => {
    console.log('그랩의 쇼핑몰 서버가 돌아가고 있습니다.');
});

