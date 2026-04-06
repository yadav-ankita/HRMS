const mongoose=require('mongoose');

const connectDb= async(url)=>{
   return await mongoose.connect(url)
   .then(()=>{
    console.log('Mongodb connected successfully')
   })
   .catch((error)=>{
       console.log('Error in mongodb connection',error)
   })
}
module.exports=connectDb;