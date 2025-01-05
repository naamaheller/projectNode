import { connect } from "mongoose";

export function connectToDb() {
    connect("mongodb+srv://naamahe788:naama246!@cluster0.s9376.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0")
        .then(con => console.log("mogo Db connected"))
        .catch(err => {
            console.log("cannot connect mongo db", err);
            process.exit(1)
        })
}