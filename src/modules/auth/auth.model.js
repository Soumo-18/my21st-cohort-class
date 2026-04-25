import mongoose from 'mongoose'
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        minLength:2,
        maxLength:50,
        required:[true, "Name is Required"]
    },

    email:{
        type:String,
        trim:true,
        required:[true, "Email is Required"],

        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:[true,"Password is Required"],
        minLength:8,
        select:false,//This is a massive security feature. By default, 
        // whenever you query the database for a user
        //  (e.g., User.findById(id)), Mongoose will retrieve everything 
        // except the password. This prevents you from accidentally 
        // sending user passwords back to the frontend. 
        // (When you do need the password to verify a login, you have to
        //  explicitly ask for it using .select('+password')).
    },
    role:{
        type:String,
        enum:["customer","seller","admin"],//Short for "enumeration." This means the role field will strictly only accept one of these three strings. If you try to save a user with the role "manager", it will fail.
         //If you don't provide a role when creating a user, they will automatically be assigned as a "customer".
        default:"customer"
    },
    isVerified:{
        type: Boolean,//A boolean (true/false) tracking whether the user has verified their email. It starts as false by default.
        default:false,
    },
    avatar:{
        type:String,
        default: false
    },
    verificationToken:{type:String, select:false},
    refreshToken:{type:String, select:false},
    resetPasswordToken:{type:String, select:false},
    resetPasswordExpires:{type:String, select:false},

}, {timestamps:true })

//hash the password before saving
userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12)
});

userSchema.methods.comparePassword = async function (clearTextPassword) {
    return bcrypt.compare(clearTextPassword, this.password)
};

export default mongoose.model("User",userSchema)
//This takes your structural blueprint (userSchema) and
//  compiles it into a usable Model called "User".
//  You are exporting this model so you can import it into your controllers
//  (e.g., to do things like User.create() or User.findOne()).