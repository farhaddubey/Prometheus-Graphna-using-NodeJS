const express = require("express");
const client = require("prom-client");  //Metric Collection by Promethius
const { doSomeHeavyTask }=require("./util");
const responseTime = require('response-time');

const app = express();
const PORT = process.env.PORT || 8000

const CollectionDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({register: client.register});

const reqResTime =  new client.Histogram({
    name: "http_express_req_res_time",
    help: "This tells us how much time is taken by req and res",
    labelNames: ["method", "route", "status_code"],
    buckets: [1, 50, 100, 200, 400, 500, 800, 1000]

});
app.use(responseTime((req, res, time)=>{
    reqResTime.labels({
        method: req.method,
        route: req.url,
        status_code: res.statusCode,
    })
    .observe(time);


}))
app.get("/", (req, res)=>{

});
app.get("/slow", async(req, res)=>{
});
app.get("/metrics", async (req, res)=>{
    res.setHeader("Content-Type", client.register.contentType);
    const   metrics = await client.register.metrics();
    res.send(metrics);
});
app.listen(PORT, ()=>{
    console.log(`Express server started at http://localhost:${PORT}`)
});