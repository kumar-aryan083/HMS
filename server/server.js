import express from 'express';
import mongoose from 'mongoose';
import chalk from 'chalk';
import env from 'dotenv';
import cors from 'cors';
import  employeeRouter  from './routers/employee.router.js';
import  patientRouter  from './routers/patient.router.js';
import  adminRouter  from './routers/admin.router.js';
import  opdRouter  from './routers/opd.router.js';
import  testRouter  from './routers/tests.router.js';
import paymentRouter from './routers/payments.router.js';
import ipdRouter from './routers/ipd.router.js';

env.config();

const app = express();

const dbConnection = ()=>{
    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log(chalk.inverse.bold.green("DB is connected..."))
    }).catch((err)=>{
        console.log(chalk.inverse.bold.red("unable to connect db"));
    })
}

const corsAllow = {
    origin: 'http://localhost:5173',
    method: 'POST, GET, PUT, PATCH, HEAD',
    credential: true
}


app.use(express.json());
app.use(cors(corsAllow));
app.use("/api/employee", employeeRouter);
app.use("/api/patient", patientRouter);
app.use("/api/admin", adminRouter);
app.use("/api/opd", opdRouter);
app.use("/api/tests", testRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/ipd', ipdRouter);

app.get('/', (req, res)=>{
    res.status(200).json({
        success: true,
        message: "Server is working fine..."
    })
})

app.listen(process.env.PORT, (err)=>{
    if(!err){
        console.log(chalk.inverse.bold.yellow("Server is live..."));
        dbConnection();
    }else{
        console.log(chalk.inverse.red("something went wrong while listening the server."))
    }
});