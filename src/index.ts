import express, { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { ResponeRegister, ResponeLogin } from "./types";

const app: Express = express();
const prisma = new PrismaClient();

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.post('/register', async (req: Request, res: Response) => {
    const data: ResponeRegister = req.body
    console.log('Regisiter:', data)
    if (!(data.username && data.password && data.gmail)) return res.json({
        message: "All input is required"
    }).status(400)

    const findUser = await prisma.user.findMany({
        where: {
            username: data.username,
            password: data.password,
        }
    }).catch((e) => console.log(e))

    if (findUser[0]?.username === data?.username) {
        return res.json({
            message: "Username has already"
        }).json(400)
    } else if (findUser[0]?.gmail === data.gmail) {
        return res.json({
            message: "Gmail has already"
        }).json(400)
    }

    let _e = await bcrypt.hash(data.password, 20);
    let createUser = await prisma.user.create({
        data: {
            username: data.username,
            password: _e,
            gmail: data.gmail.toLowerCase(),
        }
    })

    return res.json({
        status: "SUCCESS",
        createUser
    }).status(200)
})

app.post('/login', async (req: Request, res: Response) => {
    const data: ResponeLogin = req.body
    console.log('Login:', data)
    if (!data.gmail || !data.password) return res.json({
        message: 'Username and password are required.'
    }).status(400);

    const findUser = await prisma.user.findMany({
        where: {
            gmail: data.gmail
        }
    })
    if (!findUser) return res.json({
        message: 'Unauthorized'
    }).status(401)

    const _b = await bcrypt.compare(data.password, findUser[0].password);
    if (findUser && _b) {
        return res.json({
            status: "SUCCESS",
            message: "Login successfully"
        }).status(200)
    }
})

app.listen("3000", () => {
    console.log('[API] STARTING')
})