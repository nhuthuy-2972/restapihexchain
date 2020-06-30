require('dotenv').config()
const { Pool } = require('pg')
const moment = require('moment')
const pool = new Pool({
    connectionString: process.env.database_url,
})


exports.insert1 = async (req, res) => {
    let minutes = 15
    let t = 0
    let ph = 0
    let h = 0
    let d = 0
    try {
        for (let i = 1; i < 100; i++) {
            t = Math.floor(Math.random() * (45 - 25)) + 25;
            ph = Math.floor(Math.random() * (12 - 2)) + 2;
            h = Math.floor(Math.random() * (85 - 45)) + 45;
            d = Math.floor(Math.random() * (15 - 5)) + 5;
            await pool.query(
                `insert into metrics (time,device_id,data) values(now() - interval '${minutes} minutes','ZdPTG3Z6arapWj8JulThz','{"temperature" : ${t} , "ph": ${ph} , "humidity": ${h} ,"do": ${d}}')`)

            minutes += 15;
        }

        //console.log(rows)
        res.json({
            messages: "insert successfuly"
        })
    } catch (error) {
        res.json({
            error
        })
    }
}


exports.getdata = async (req, res) => {
    const device_id = req.body.device_id
    const timestamp = req.body.timestamp
    console.log(timestamp)
    //let date = new Date(0)
    try {
        const { rows } =
            await pool.query(
                `select time,data from metrics where device_id = '${device_id}' and time > timestamp with time zone '${timestamp}' - interval '24 hours' order by time desc`)
        console.log(rows)

        let result = rows.map(row => {
            return { ...row.data, time: moment(row.time).format("hh:mm a DD/MM/YY") }
        })

        console.log(result.reverse())
        res.json({
            rows: [...result]
        })
    } catch (error) {
        res.json({
            error
        })
    }

}

exports.insertdata = async (req, res) => {
    let data = req.body
    let device_id = data.deviceId
    let timestamp = data.timestamp
    timestamp = JSON.stringify(timestamp)
    delete data.batery
    delete data.timestamp
    delete data.deviceId

    for (let sensor in data) {
        data[sensor] = parseFloat(data[sensor])
    }
    data = JSON.stringify(data)

    // console.log(data)
    // console.log(timestamp)
    // console.log(device_id)
    try {

        let { rows } = await pool.query(
            `insert into metrics (time,device_id,data) values('${timestamp}','${device_id}','${data}')`)
        console.log(rows)
        res.json({
            messages: "insert successfuly"
        })
    } catch (error) {
        res.json({
            error
        })
    }
}