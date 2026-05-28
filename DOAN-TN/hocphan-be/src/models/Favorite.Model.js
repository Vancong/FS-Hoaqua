const mongoose=require('mongoose');

const favoriteSchema= new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    product:{
        type: mongoose.Schema.ObjectId,
        ref: 'Products',
        required: true
    }
})

const favorite= mongoose.model("Favorites",favoriteSchema,"Favorites");
module.exports=favorite