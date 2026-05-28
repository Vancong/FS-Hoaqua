const mongoose=require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);
const NoteGroupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: {
        type: String,
        slug: 'name', 
        unique: true
    }

});



const NoteGroups=mongoose.model("NoteGroups",NoteGroupSchema,"NoteGroups");
module.exports=NoteGroups;