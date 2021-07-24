const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
    name :String
};



const Item = mongoose.model("Item",itemsSchema);

/*const item1 = new Item({
    name : "Welcome to todolist"
});
const item2 = new Item({
    name : "hit + to add"
});
const item3 = new Item({
    name : "Hit checkbox to check work"
});*/
const listSchema = {
    name :String,
    items:[itemsSchema]
}; 

const List = mongoose.model("List",listSchema);


//const defaultItems = [item1,item2,item3];

let customListArr=[];
List.find({},function(err,foundLists){
    for(var i = 0;i<foundLists.length;i++)
    {
        if(foundLists[i].name != "Favicon.ico")
        customListArr.push(foundLists[i].name);
    }
        
});



app.get("/", function(req, res){

    Item.find({},function(err,foundItems){
      /*if(foundItems.length === 0)
      {
        Item.insertMany(defaultItems,function(err){
            if(err)
                console.log(err);
            else console.log("Inserted successfully");
        });
        res.redirect("/");
      }
      else*/ res.render("list",{List : "Main",listitems : foundItems,customLists:customListArr});
  });
    

});

app.post("/",function(req,res){
    let itemName = req.body.newitem;
    let listName = req.body.list;
    
    const item = new Item({
        name : itemName
    });
    if(listName==="Main")
    {
        item.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
    
});

app.get("/:customList", function(req, res){
   
    customListArr=[];
    List.find({},function(err,foundLists){
        for(var i = 0;i<foundLists.length;i++)
    {
        if(foundLists[i].name != "Favicon.ico")
        customListArr.push(foundLists[i].name);
    }
    });
    const customListName = _.capitalize(req.params.customList);
    
    if(customListName==="Main")
    {
        res.redirect("/");
    }else{

        List.findOne({name:customListName},function(err,foundList){
        if(!err)
        {
            if(!foundList)
            {
                const list = new List({
                    name:customListName,
                    items:[]
                });
                list.save();
                customListArr.push(customListName);
                res.redirect("/"+customListName);
            }
            else {
                
                res.render("list",{List : foundList.name,listitems : foundList.items,customLists:customListArr});
            };
        }
    });
    
    }
  
});
 

app.post("/delete",function(req,res){
    const doneid = req.body.checkbox;
    const listName = req.body.listname;

    if(listName==="Main"){
        Item.findByIdAndRemove(doneid,function(err){
            if(!err)
            {    console.log("successfully del");
                res.redirect("/");
            }
        });

    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:doneid}}}, function(err,foundList){
            if(!err)
            {
                res.redirect("/"+listName);
            }
        } );
    }
    
});

app.post("/reset",function(req,res){
    
    List.deleteMany({},function(err){
        if(!err)
        {
            customListArr=[];
            res.redirect("/");
        }
    });
    

});
  

app.listen(process.env.PORT ||3000, function(){
  console.log("Server started on port 3000.");
});
