const userModel=require("../../models/userModel");
const validator = require('validator');
const bcrypt = require('bcrypt');
const fs=require('fs');
const constant=require("../../config/const_credential");
const { default: mongoose } = require("mongoose");

class youtuberServices{

    constructor(){
        return {
            add_youtuber_data:this.add_youtuber_data.bind(this),
            edit_youtuber:this.edit_youtuber.bind(this),
            edit_youtuber_data:this.edit_youtuber_data.bind(this),
            delete_youtuber:this.delete_youtuber.bind(this),
           
        }
    }

    async add_youtuber_data(req){
        try{
            let doc=req.body
            if(req.body.email && req.body.mobile && req.body.refer_code){
                    // console.log("validator...................",!validator.isEmail(req.body.email))
                if (!validator.isEmail(req.body.email)) {
                        return{
                            status:false,
                            message:'this is not the correct format ***',
                            data:doc
                        }
                }else{
                    const checkEmail=await userModel.findOne({email:req.body.email});
                    // console.log("checkEmail.........",checkEmail)
                    if(checkEmail){
                        return{
                            status:false,
                            message:'email id already register',
                            data:doc
                        }
    
                    }else {
                        const checkMobile=await userModel.findOne({mobile:req.body.mobile});
                        if(checkMobile){
                            return{
                                status:false,
                                message:'mobile number already register',
                                data:doc
                            }
                        }else{
                            const checkReferCode=await userModel.findOne({refer_code:req.body.refer_code});
                            if(checkReferCode){
                                return{
                                    status:false,
                                    message:'refer code already exist ',
                                    data:doc
                                }
                            }else{
                                let salt = bcrypt.genSaltSync(10);
                                req.body.decrypted_password = req.body.password; 
                                req.body.password = bcrypt.hashSync(req.body.password, salt);
                                req.body.user_verify= { mobile_verify: 1, mobilebonus: 1 };
                                req.body.userbalance= { bonus: 0 };
                                req.body.type=constant.USER_TYPE.YOUTUBER;
                                req.body.status=constant.USER_STATUS.ACTIVATED;
                                let saveUser=await userModel.create(req.body);
                                if(saveUser){
                                    return{
                                        status:true,
                                        message:'user register successfully'
                                    }
                                }else{
                                    return{
                                        status:false,
                                        message:'user not register ..error..',
                                        data:doc
                                    }
                                }
                            }
                        }
                    }
                }
            }else{
                return{
                    status:false,
                    message:'please enter email-Id  & refer_code  & mobile',
                    data:doc
                }
            }

        }catch(error){
            throw error;
        }
    }
    async edit_youtuber(req){
        try{
            const checkYoutuber=await userModel.findOne({_id:mongoose.Types.ObjectId(req.params.youtuberId)});
            if(checkYoutuber){
                return{
                    status:true,
                    youtuberData:checkYoutuber
                }

            }else{
                return{
                    status:false,
                    message:'youTuber Data not Found..error..'
                }
            }
        }catch(error){
            throw error;
        }
    }
    async edit_youtuber_data(req){
        try{
            const checkYoutuber=await userModel.findOne({_id:req.params.youtuberId});
            if(checkYoutuber){
                if(req.body.email && req.body.mobile && req.body.refer_code){
                    // console.log("validator...................",!validator.isEmail(req.body.email))
                if (!validator.isEmail(req.body.email)) {
                        return{
                            status:false,
                            message:'this is not the correct format ***',
                        }
                }else{
                    const checkEmail=await userModel.findOne({_id:{$ne:req.params.youtuberId},email:req.body.email});
                    // console.log("checkEmail.........",checkEmail)
                    if(checkEmail){
                        return{
                            status:false,
                            message:'email id already register',
                        }
    
                    } else {
                        const checkMobile=await userModel.findOne({_id:{$ne:req.params.youtuberId},mobile:req.body.mobile});
                        if(checkMobile){
                            return{
                                status:false,
                                message:'mobile number already register',
                            }
                        }else{
                            const checkReferCode=await userModel.findOne({_id:{$ne:req.params.youtuberId},refer_code:req.body.refer_code});
                            if(checkReferCode){
                                return{
                                    status:false,
                                    message:'refer code already exist ',              
                                }
                            }else{
                                let saveUser=await userModel.updateOne({_id:mongoose.Types.ObjectId(req.params.youtuberId)},{
                                    $set:req.body
                                });
                                if(saveUser.modifiedCount > 0){
                                    return{
                                        status:true,
                                        message:'user update successfully'
                                    }
                                }else{
                                    return{
                                        status:false,
                                        message:'user not update ..error..'
                                    }
                                }
                            }
                        }
                    }
                }
            }else{
                return{
                    status:false,
                    message:'please enter email-Id  & refer_code  & mobile',
                    
                }
            }

            }else{
                return{
                    status:false,
                    message:'youtuber not Found..error..'
                }
            }


        }catch(error){
            throw error;
        }
    }
    async delete_youtuber(req){
        try{
            let checkYoutuber=await userModel.findOne({_id:req.params.youtuberId});
           
            if(checkYoutuber){
                if(checkYoutuber.image){
                   let filePath = `public${checkYoutuber.image}`;
                    if(fs.existsSync(filePath) == true){
                    fs.unlinkSync(filePath);
                    }
                }
                const updateYoutuber=await userModel.deleteOne({_id:req.params.youtuberId}); 
                if(updateYoutuber.deletedCount == 1){
                    return{
                        status:true,
                        message:'youtuber delete successfully'
                    }
                }else{
                    return{
                        status:false,
                        message:'youtuber not delete ..error.. '
                    }
                }
            }else{
                return{
                    status:false,
                    message:'youtuber not found..error..'
                }
            }

        }catch(error){
            throw error;
        }
    }
    
}
module.exports = new youtuberServices()