const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/courtbooking");

const BookingSchema = new mongoose.Schema({
  sport: String,
  date: String,
  time: String,
  user: String
});

const Booking = mongoose.model("Booking", BookingSchema);

app.get("/", (req,res)=>{
  res.send("Court Booking Server Running");
});

app.post("/book", async (req,res)=>{

const {sport,date,time,user} = req.body;

const today = new Date();
const bookingDate = new Date(date);

const diff = (bookingDate - today) / (1000*60*60*24);

if(diff > 7){
return res.json({message:"Bookings allowed only 7 days ahead"});
}

const existingUserBooking = await Booking.findOne({user,date});

if(existingUserBooking){
return res.json({message:"You already booked a court today"});
}

const existingSlot = await Booking.findOne({sport,date,time});

if(existingSlot){
return res.json({message:"Slot already booked"});
}

const booking = new Booking({sport,date,time,user});
await booking.save();

res.json({message:"Booking successful"});
});
app.get("/availability", async (req,res)=>{

const bookings = await Booking.find();

let hours = {};

bookings.forEach(b => {

const hour = b.time;

if(!hours[hour]){
hours[hour] = 0;
}

hours[hour]++;

});

res.json(hours);

});
app.listen(5000, ()=>{
  console.log("Server running on port 5000");
});
