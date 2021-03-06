import express from 'express'
import fileUpload from 'express-fileupload'

import request from 'NeteaseCloudMusicApi/util/request'
import modules from 'NeteaseCloudMusicApi/main'
import { cookieToJson } from 'NeteaseCloudMusicApi/util/index'
import apicache from 'NeteaseCloudMusicApi/util/apicache'

const cache = apicache.middleware

export function startNeteaseMusicApi(): void {
    console.log('startNeteaseMusicApi')

    // Integrate API
    const app: express = express()
    // CORS & Preflight request
    app.use((req, res, next) => {
        if (req.path !== '/' && !req.path.includes('.')) {
            res.set({
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': req.headers.origin || '*',
                'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
                'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
                'Content-Type': 'application/json; charset=utf-8',
            })
        }
        req.method === 'OPTIONS' ? res.status(204).end() : next()
    })
    // cookie parser
    app.use((req, res, next) => {
        req.cookies = {}
        ;(req.headers.cookie || '').split(/\s*;\s*/).forEach((pair) => {
            let crack = pair.indexOf('=')
            if (crack < 1 || crack == pair.length - 1) return
            req.cookies[decodeURIComponent(pair.slice(0, crack)).trim()] = decodeURIComponent(
                pair.slice(crack + 1),
            ).trim()
        })
        next()
    })
    // body parser
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(fileUpload())
    // cache
    app.use(cache('2 minutes', (req, res) => res.statusCode === 200))
    // router

    const special = {
        daily_signin: '/daily_signin',
        fm_trash: '/fm_trash',
        personal_fm: '/personal_fm',
    }

    for (const module in modules) {
        let route = module in special ? `/${module}` : '/' + module.replace(/_/g, '/')
        let question = modules[module]

        app.use(route, (req, res) => {
            ;[req.query, req.body].forEach((item) => {
                if (typeof item.cookie === 'string') {
                    item.cookie = cookieToJson(decodeURIComponent(item.cookie))
                }
            })
            let query = Object.assign({}, { cookie: req.cookies }, req.query, req.body, req.files)
            question(query, request)
                .then((answer) => {
                    console.log('[OK]', decodeURIComponent(req.originalUrl))
                    res.append('Set-Cookie', answer.cookie)
                    res.status(answer.status).send(answer.body)
                })
                .catch((answer) => {
                    console.log('[ERR]', decodeURIComponent(req.originalUrl), {
                        status: answer.status,
                        body: answer.body,
                    })
                    if (answer.body.code == '301') answer.body.msg = '????????????'
                    res.append('Set-Cookie', answer.cookie)
                    res.status(answer.status).send(answer.body)
                })
        })
    }

    const port = 3000
    const host = '127.0.0.1'

    app.listen(port, host, () => {
        console.log(`server running @ http://${host ? host : 'localhost'}:${port}`)
    })
}
