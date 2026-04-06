const jwt=require('jsonwebtoken')

const {UnauthenticatedError}=require('../error')

const authenticationMiddleware = (req,res,next) => {
      //check header
      const authHeader=req.headers.authorization
      // console.log('authheader is ',authHeader)
      if(!authHeader || !authHeader.startsWith('Bearer')){
         throw new UnauthenticatedError('Authentication Invalid')
      }
             
      const token=authHeader.split(' ')[1]
      //console.log('token is',token)
    try
      {
             const payload=jwt.verify(token,process.env.JWT_SECRET)
             //console.log('payload is',payload)
              req.user={userId:payload.userId,role:payload.role,companyId:payload.companyId}
              next()
      }
      catch(error){
         throw new UnauthenticatedError('Authentication Invalid')
      }
}

const authorizeRole=(req,res,next)=>{
      if(req.user.role!=="admin") {
           throw new UnauthenticatedError("Role is not allowed to access this resource");
      } 
      next();
}
module.exports={ authenticationMiddleware, authorizeRole }
