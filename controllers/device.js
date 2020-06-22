require('dotenv').config()
const { Pool } = require('pg')
const moment = require('moment')
const pool = new Pool({
    connectionString: process.env.database_url,
})


exports.getdata = async (req, res) => {
    const device_id = req.body.device_id
    console.log(device_id)
    try {
        const { rows } =
            await pool.query(
                `select time,data from metrics where device_id = '${device_id}' order by time desc limit 24`)
        console.log(rows)

        let result = rows.map(row => { return { time: moment(row.time).format("[Lúc] hh:mm:ss a, DD/MM/YYYY"), temperature: row.data.temperature, humidity: row.data.humidity } })
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
        const { rows } = await pool.query(
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