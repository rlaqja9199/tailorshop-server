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
//미들웨어 설정
app.use(cors({
    origin: ["http://localhost:3000"],
    // origin: ["https://dress-shop-server.herokuapp.com"],
    methods: ["GET","POST","DELETE","PUT"],
    // methods: ["GET","POST"],
    credentials: true
}));