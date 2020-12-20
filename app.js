//jshint esversion:6
//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-rashi:Test1234@cluster0.ckjon.mongodb.net/todoListDB",{useUnifiedTopology:true});
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"welcome to your todilist"
});
const item2=new Item({
  name:"hit the + button to add new item"
});
const item3=new Item({
  name:"<__hit this to delete item"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems) {
    if(foundItems.length===0) {
    Item.insertMany(defaultItems,function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("successfully saved default items to DB");
      }
    });
    res.redirect("/");
  } else {

    res.render("list",{listTitle:"Today",newListItems:foundItems});
  }
  });

});

app.get("/:customListName",function(req,res) {
const customListName=req.params.customListName;
List.findOne({name:customListName},function(err,foundList) {
  if(!err) {
    if(!foundList) {
      //create a new listTitle
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    } else {
        //show an existing listTitle
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
  }
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item ({
    name:itemName
  });
  if(listName==="Today") {
  item.save()
  res.redirect("/");
} else {
  List.findOne({name:listName},function(err,foundList) {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
});
}
});

app.post("/delete",function(req,res) {
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today") {

  Item.findByIdAndRemove(checkedItemId,function(err) {
    if(!err) {
      console.log("successfully deleted checked item");
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
if(!err) {
  res.redirect("/"+listName);

}
});
}
});
app.get("/about", function(req, res){
  res.render("about");
});

// let port=process.env.PORT;
// if(port==null ||port=="") {
//   port=5000;
// }
// app.listen(3000);

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
