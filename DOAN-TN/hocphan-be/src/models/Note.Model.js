const mongoose=require('mongoose');
const NoteSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['top', 'middle', 'base'],
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NoteGroups"
  }
});


const Notes=mongoose.model("Notes",NoteSchema,"Notes");
module.exports=Notes;